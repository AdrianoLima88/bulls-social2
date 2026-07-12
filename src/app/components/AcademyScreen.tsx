import React, { useState } from 'react';
import {
  ArrowLeft, GraduationCap, Users, Clock, Star, ChevronRight,
  Plus, BookOpen, Video, X, Loader2, AlertCircle, CheckCircle2,
  Pause, Play, Trash2, Crown, Lock, TrendingUp, Filter,
} from 'lucide-react';
import { useCourses, useMyCourses, useEnrollment, Course, CreateCourseInput } from '../../hooks/useCourses';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVEL_LABELS: Record<string, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced:     'bg-red-100 text-red-700',
};

const PLAN_PRIORITY: Record<string, number> = { business: 0, pro: 1, premium: 2, free: 3 };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const formatPrice = (price: number, currency: string) => {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(price);
};

// ─── CreateCourseModal ────────────────────────────────────────────────────────
const EMPTY_FORM: CreateCourseInput = {
  title: '', description: '', type: 'course', price: 0,
  duration_label: '', level: 'beginner', tags: [], slots_total: null,
};

const CreateCourseModal: React.FC<{
  onClose: () => void;
  onCreated: () => void;
}> = ({ onClose, onCreated }) => {
  const { createCourse, submitting, error } = useMyCourses();
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: keyof CreateCourseInput, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 5) {
      set('tags', [...form.tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => set('tags', form.tags.filter(x => x !== t));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    const ok = await createCourse(form);
    if (ok) {
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create Course / Mentoring</h2>
              <p className="text-white/80 text-sm">Bulls charges 15% commission</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700 font-semibold">Published successfully!</p>
            </div>
          )}

          {/* Type */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Type</p>
            <div className="flex gap-2">
              {(['course', 'mentoring'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => set('type', t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition ${
                    form.type === t
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t === 'course' ? <BookOpen className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  {t === 'course' ? 'Course' : 'Mentoring'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Technical Analysis for Beginners"
              maxLength={80}
              className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What will students learn? Prerequisites, content, format..."
              rows={4}
              maxLength={800}
              className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 text-sm resize-none focus:outline-none focus:border-indigo-400"
            />
            <p className="text-right text-xs text-slate-400 mt-1">{form.description.length}/800</p>
          </div>

          {/* Level + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Level</label>
              <select
                value={form.level}
                onChange={e => set('level', e.target.value as any)}
                className="mt-1 w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-400 bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</label>
              <input
                value={form.duration_label}
                onChange={e => set('duration_label', e.target.value)}
                placeholder="e.g. 4 weeks, 60 min"
                maxLength={30}
                className="mt-1 w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Price + Slots row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price (€)</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">€</span>
                <input
                  type="number"
                  value={form.price === 0 ? '' : form.price}
                  onChange={e => set('price', parseFloat(e.target.value) || 0)}
                  placeholder="0 = free"
                  min="0"
                  step="5"
                  className="w-full pl-7 pr-3 py-3 border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Slots</label>
              <input
                type="number"
                value={form.slots_total ?? ''}
                onChange={e => set('slots_total', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Unlimited"
                min="1"
                className="mt-1 w-full px-3 py-3 border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags (max 5)</label>
            <div className="flex gap-2 mt-1">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="stocks, crypto, options..."
                maxLength={20}
                className="flex-1 px-3 py-2.5 border-2 border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-400"
              />
              <button onClick={addTag} className="px-4 py-2.5 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-200 transition">
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                    #{t}
                    <button onClick={() => removeTag(t)} className="hover:text-indigo-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Commission info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">
              <span className="font-bold">Bulls commission: 15%</span> — you receive 85% of what students pay. Payments via Stripe, settled in 2–5 business days.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.title.trim() || !form.description.trim() || success}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              !submitting && form.title.trim() && form.description.trim() && !success
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CourseCard ───────────────────────────────────────────────────────────────
const CourseCard: React.FC<{
  course: Course;
  onEnroll: (course: Course) => void;
  enrolling: string | null;
  isOwnCourse: boolean;
}> = ({ course, onEnroll, enrolling, isOwnCourse }) => {
  const isFeatured = ['pro', 'business'].includes(course.creator_plan);
  const loading = enrolling === course.id;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition hover:shadow-md ${isFeatured ? 'border-indigo-200' : 'border-slate-200'}`}>
      {/* Featured banner */}
      {isFeatured && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
          <span className="text-white text-xs font-bold uppercase tracking-wide">Featured Educator</span>
        </div>
      )}

      <div className="p-4">
        {/* Type + Level */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${course.type === 'course' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
            {course.type === 'course' ? <BookOpen className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            {course.type === 'course' ? 'Course' : 'Mentoring'}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${LEVEL_COLORS[course.level]}`}>
            {LEVEL_LABELS[course.level]}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{course.title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">{course.description}</p>

        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {course.creator_avatar
              ? <img src={course.creator_avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-indigo-700 text-xs font-bold">{initials(course.creator_name || 'U')}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-700 text-xs font-semibold truncate">{course.creator_name}</p>
            <p className="text-slate-400 text-xs">@{course.creator_username}</p>
          </div>
          {isFeatured && (
            <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
          {course.duration_label && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration_label}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.enrollments_count} student{course.enrollments_count !== 1 ? 's' : ''}
          </span>
          {course.slots_total && (
            <span className="text-slate-400">
              {Math.max(0, course.slots_total - course.slots_used)} slots left
            </span>
          )}
        </div>

        {/* Tags */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-lg font-bold ${course.price === 0 ? 'text-green-600' : 'text-slate-900'}`}>
              {formatPrice(course.price, course.currency)}
            </p>
            {course.price > 0 && (
              <p className="text-xs text-slate-400">Creator receives €{((course.price * 0.85)).toFixed(2)}</p>
            )}
          </div>

          {isOwnCourse ? (
            <span className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
              Your course
            </span>
          ) : course.is_enrolled ? (
            <span className="flex items-center gap-1.5 px-4 py-2.5 bg-green-100 text-green-700 rounded-xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Enrolled
            </span>
          ) : (
            <button
              onClick={() => onEnroll(course)}
              disabled={loading || (course.slots_total !== null && course.slots_used >= course.slots_total)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                loading
                  ? 'bg-slate-200 text-slate-400'
                  : course.slots_total !== null && course.slots_used >= course.slots_total
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-sm'
              }`}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : course.slots_total !== null && course.slots_used >= course.slots_total
                ? 'Sold out'
                : course.price === 0
                ? 'Enroll'
                : 'Buy'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MyCoursesTab (creator view) ──────────────────────────────────────────────
const MyCoursesTab: React.FC<{ onCreateCourse: () => void }> = ({ onCreateCourse }) => {
  const { courses, loading, toggleStatus, deleteCourse } = useMyCourses();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Create button */}
      <button
        onClick={onCreateCourse}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-indigo-300 rounded-2xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition"
      >
        <Plus className="w-5 h-5" />
        Create new course / mentoring
      </button>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No courses published yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first course and start earning.</p>
        </div>
      ) : (
        courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${course.type === 'course' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {course.type === 'course' ? 'Course' : 'Mentoring'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{course.title}</h3>
              </div>
              <p className="text-indigo-700 font-bold text-sm flex-shrink-0">{formatPrice(course.price, course.currency)}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-3 mt-3">
              <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                <p className="text-base font-bold text-slate-800">{course.enrollments_count}</p>
                <p className="text-xs text-slate-400">Students</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                <p className="text-base font-bold text-slate-800">
                  {course.price > 0
                    ? `€${(course.enrollments_count * course.price * 0.85).toFixed(0)}`
                    : '—'
                  }
                </p>
                <p className="text-xs text-slate-400">Est. Revenue</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                <p className="text-base font-bold text-slate-800">
                  {course.slots_total ? `${course.slots_total - course.slots_used}` : '∞'}
                </p>
                <p className="text-xs text-slate-400">Slots</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(course.id, course.status)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                {course.status === 'active'
                  ? <><Pause className="w-3.5 h-3.5" /> Pause</>
                  : <><Play className="w-3.5 h-3.5" /> Activate</>
                }
              </button>
              <button
                onClick={() => { if (window.confirm('Delete this course?')) deleteCourse(course.id); }}
                className="p-2 border border-red-200 rounded-xl text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ─── EducatorsSpotlight ───────────────────────────────────────────────────────
const EducatorsSpotlight: React.FC<{ courses: Course[] }> = ({ courses }) => {
  // Deduplicate educators, Pro/Business first
  const seen = new Set<string>();
  const educators = courses
    .filter(c => { if (seen.has(c.creator_id)) return false; seen.add(c.creator_id); return true; })
    .sort((a, b) => (PLAN_PRIORITY[a.creator_plan] ?? 9) - (PLAN_PRIORITY[b.creator_plan] ?? 9))
    .slice(0, 6);

  if (!educators.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        <h2 className="font-bold text-slate-800 text-sm">Featured Educators</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {educators.map(e => (
          <div key={e.creator_id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
            <div className={`w-13 h-13 rounded-full flex items-center justify-center overflow-hidden border-2 ${
              ['pro','business'].includes(e.creator_plan) ? 'border-indigo-400' : 'border-slate-200'
            }`}>
              {e.creator_avatar
                ? <img src={e.creator_avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                : <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-700 text-sm font-bold">{initials(e.creator_name || 'U')}</span>
                  </div>
              }
            </div>
            <p className="text-xs text-slate-700 font-semibold text-center leading-tight truncate w-full text-center">
              {e.creator_name.split(' ')[0]}
            </p>
            {['pro','business'].includes(e.creator_plan) && (
              <Crown className="w-3 h-3 text-amber-500 -mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main AcademyScreen ───────────────────────────────────────────────────────
type TabId = 'all' | 'course' | 'mentoring' | 'enrolled' | 'manage';

export const AcademyScreen: React.FC<{
  onBack: () => void;
  onNavigateToPremium: () => void;
}> = ({ onBack, onNavigateToPremium }) => {
  const { user } = useAuth();
  const { isPro, isBusiness } = useSubscription();
  const canCreate = isPro || isBusiness;

  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filterMap: Record<TabId, 'all' | 'course' | 'mentoring' | 'mine'> = {
    all:      'all',
    course:   'course',
    mentoring:'mentoring',
    enrolled: 'mine',
    manage:   'all',
  };

  const { courses, loading, error, refresh } = useCourses(filterMap[activeTab]);
  const { enrollFree, checkoutPaidCourse, enrolling } = useEnrollment();

  const handleEnroll = async (course: Course) => {
    if (course.price === 0) {
      const ok = await enrollFree(course.id);
      if (ok) refresh();
    } else {
      await checkoutPaidCourse(course.id, course.title, course.price, course.creator_id);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'course',    label: 'Courses' },
    { id: 'mentoring', label: 'Mentoring' },
    { id: 'enrolled',  label: 'Enrolled' },
    ...(canCreate ? [{ id: 'manage' as TabId, label: 'Manage' }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-12 pb-6 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Bulls Academy</h1>
            <p className="text-white/80 text-sm">Investment courses and mentoring</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-lg font-bold">{courses.length}</p>
            <p className="text-white/70 text-xs">Courses</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{courses.filter(c => c.type === 'mentoring').length}</p>
            <p className="text-white/70 text-xs">Mentoring</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{courses.filter(c => c.is_enrolled).length}</p>
            <p className="text-white/70 text-xs">Enrolled</p>
          </div>
        </div>
      </div>

      {/* Pro gate banner */}
      {!canCreate && (
        <div className="mx-4 mt-4 bg-white border border-indigo-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">I want to teach at the Academy</p>
            <p className="text-xs text-slate-500">Pro or Business plan required to create courses and mentoring.</p>
          </div>
          <button
            onClick={onNavigateToPremium}
            className="flex-shrink-0 px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 mt-4 pb-28">
        {activeTab === 'manage' ? (
          <MyCoursesTab onCreateCourse={() => setShowCreateModal(true)} />
        ) : (
          <>
            {/* Educators spotlight (only on All tab) */}
            {activeTab === 'all' && !loading && <EducatorsSpotlight courses={courses} />}

            {/* Course list */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">
                  {activeTab === 'enrolled' ? 'No enrollments yet' : 'No courses available'}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {activeTab === 'enrolled'
                    ? 'Explore the courses and enroll in your first one!'
                    : 'Coming soon — the best investment educators.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    enrolling={enrolling}
                    isOwnCourse={course.creator_id === user?.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onCreated={refresh}
        />
      )}
    </div>
  );
};
                                                       