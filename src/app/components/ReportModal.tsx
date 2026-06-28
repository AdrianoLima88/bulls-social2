import React, { useState } from 'react';
import { X, Flag, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useReport, REPORT_REASONS, type ReportTargetType, type ReportReason } from '../../hooks/useReport';

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  targetName?: string; // e.g. "@username" or "this post"
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  targetName,
  onClose,
}) => {
  const { submitReport, loading, error, success } = useReport();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  const targetLabel = targetName
    ? targetName
    : targetType === 'post' ? 'this post'
    : targetType === 'comment' ? 'this comment'
    : 'this user';

  const handleSubmit = async () => {
    if (!selectedReason) return;
    await submitReport(targetType, targetId, selectedReason, details);
  };

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report Submitted</h2>
          <p className="text-slate-500 text-sm mb-2">
            Thank you for helping keep Bulls safe. Our moderation team will review your report.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Content with multiple reports is automatically flagged for priority review.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-5 pb-3 border-b border-slate-100 z-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-slate-900">Report</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <p className="text-sm text-slate-500">
            Why are you reporting {targetLabel}?
          </p>
        </div>

        <div className="p-5 space-y-3">

          {/* Reason list */}
          {REPORT_REASONS.map(r => (
            <button
              key={r.value}
              onClick={() => setSelectedReason(r.value)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${
                selectedReason === r.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${selectedReason === r.value ? 'text-red-700' : 'text-slate-800'}`}>
                  {r.label}
                </p>
                <p className="text-xs text-slate-500 truncate">{r.desc}</p>
              </div>
              {selectedReason === r.value && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}

          {/* Optional details */}
          {selectedReason && (
            <div className="pt-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Provide any additional context to help our moderators..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 text-sm resize-none focus:outline-none focus:border-red-400"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{details.length}/500</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs text-slate-600">
              🛡️ Reports are <strong>anonymous</strong>. The reported user will not know who reported them.
              Content with 5+ reports is automatically flagged for priority review.
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || loading}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              selectedReason && !loading
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              : 'Submit Report'
            }
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 text-slate-500 font-semibold text-sm hover:text-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
