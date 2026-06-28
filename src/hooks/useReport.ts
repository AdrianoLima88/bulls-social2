import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export type ReportTargetType = 'post' | 'comment' | 'user';

export type ReportReason =
  | 'spam'
  | 'misinformation'
  | 'hate_speech'
  | 'harassment'
  | 'off_topic'
  | 'scam'
  | 'violence'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string; desc: string; icon: string }[] = [
  { value: 'spam',           label: 'Spam',            desc: 'Repetitive or unsolicited content',     icon: '📢' },
  { value: 'misinformation', label: 'Misinformation',  desc: 'False or misleading financial info',    icon: '⚠️' },
  { value: 'hate_speech',    label: 'Hate Speech',     desc: 'Discriminatory or offensive language',  icon: '🚫' },
  { value: 'harassment',     label: 'Harassment',      desc: 'Targeting or bullying someone',         icon: '😡' },
  { value: 'off_topic',      label: 'Off-Topic',       desc: 'Not related to finance or business',    icon: '📵' },
  { value: 'scam',           label: 'Scam / Fraud',    desc: 'Fraudulent investment schemes',         icon: '💸' },
  { value: 'violence',       label: 'Violence',        desc: 'Violent or threatening content',        icon: '⛔' },
  { value: 'other',          label: 'Other',           desc: 'Something else not listed above',       icon: '🔍' },
];

export function useReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitReport = useCallback(async (
    targetType: ReportTargetType,
    targetId: string,
    reason: ReportReason,
    details?: string
  ) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: err } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          target_type: targetType,
          target_id: targetId,
          reason,
          details: details?.trim() || null,
        });

      if (err) {
        // Unique constraint = already reported
        if (err.code === '23505') {
          setError('You have already reported this content.');
          return { error: 'Already reported' };
        }
        throw err;
      }

      setSuccess(true);
      return { error: null };
    } catch (e: any) {
      const msg = e.message || 'Failed to submit report. Please try again.';
      setError(msg);
      return { error: msg };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { submitReport, loading, error, success, reset };
}
