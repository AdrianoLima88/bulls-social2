import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Course {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  type: 'course' | 'mentoring';
  price: number;
  currency: string;
  duration_label: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail_url: string | null;
  status: 'active' | 'paused' | 'draft';
  slots_total: number | null;
  slots_used: number;
  enrollments_count: number;
  created_at: string;
  // joined via get_courses_with_meta
  creator_name: string;
  creator_username: string;
  creator_avatar: string | null;
  creator_plan: string;
  is_enrolled: boolean;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  type: 'course' | 'mentoring';
  price: number;
  duration_label: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  slots_total: number | null;
}

// ─── Public marketplace hook — all authenticated users ───────────────────────
export const useCourses = (filter: 'all' | 'course' | 'mentoring' | 'mine' = 'all') => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .rpc('get_courses_with_meta', { p_user_id: user.id });

      if (err) throw err;

      let result = (data || []) as Course[];

      if (filter === 'course') result = result.filter(c => c.type === 'course');
      else if (filter === 'mentoring') result = result.filter(c => c.type === 'mentoring');
      else if (filter === 'mine') result = result.filter(c => c.is_enrolled);

      setCourses(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return { courses, loading, error, refresh: fetchCourses };
};

// ─── My courses as creator hook — Pro/Business only ──────────────────────────
export const useMyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:creator_id (name, username, avatar_url, plan)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setCourses(
        (data || []).map((c: any) => ({
          ...c,
          creator_name:     c.profiles?.name || '',
          creator_username: c.profiles?.username || '',
          creator_avatar:   c.profiles?.avatar_url || null,
          creator_plan:     c.profiles?.plan || 'free',
          is_enrolled:      false,
        }))
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMyCourses(); }, [fetchMyCourses]);

  const createCourse = useCallback(async (input: CreateCourseInput): Promise<boolean> => {
    if (!user) return false;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('courses')
        .insert({
          creator_id:     user.id,
          title:          input.title,
          description:    input.description,
          type:           input.type,
          price:          input.price,
          duration_label: input.duration_label || null,
          level:          input.level,
          tags:           input.tags,
          slots_total:    input.slots_total || null,
          status:         'active',
        })
        .select()
        .single();

      if (err) throw err;
      setCourses(prev => [
        { ...data, creator_name: '', creator_username: '', creator_avatar: null, creator_plan: 'pro', is_enrolled: false },
        ...prev
      ]);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user]);

  const toggleStatus = useCallback(async (id: string, current: 'active' | 'paused' | 'draft') => {
    const next = current === 'active' ? 'paused' : 'active';
    await supabase.from('courses').update({ status: next }).eq('id', id);
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: next } : c));
  }, []);

  const deleteCourse = useCallback(async (id: string) => {
    await supabase.from('courses').delete().eq('id', id);
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  return { courses, loading, submitting, error, createCourse, toggleStatus, deleteCourse, refresh: fetchMyCourses };
};

// ─── Enrollment hook ─────────────────────────────────────────────────────────
export const useEnrollment = () => {
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState<string | null>(null); // courseId being enrolled
  const [error, setError] = useState<string | null>(null);

  const enrollFree = useCallback(async (courseId: string): Promise<boolean> => {
    if (!user) return false;
    setEnrolling(courseId);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .rpc('enroll_in_course', {
          p_course_id:      courseId,
          p_student_id:     user.id,
          p_amount:         0,
          p_payment_status: 'free',
        });

      if (err) throw err;
      return data as boolean;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setEnrolling(null);
    }
  }, [user]);

  const checkoutPaidCourse = useCallback(async (
    courseId: string,
    courseTitle: string,
    priceEur: number,
    creatorId: string
  ): Promise<void> => {
    if (!user) return;
    setEnrolling(courseId);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const { data: urlData } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          type:        'course_enrollment',
          courseId,
          courseTitle,
          priceEur,
          creatorId,
          userId:      user.id,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (urlData?.url) {
        window.location.href = urlData.url;
      } else {
        throw new Error('Could not create checkout session');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnrolling(null);
    }
  }, [user]);

  return { enrollFree, checkoutPaidCourse, enrolling, error };
};
