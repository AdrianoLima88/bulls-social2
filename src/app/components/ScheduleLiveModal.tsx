import React, { useState } from 'react';
import { X, Calendar, Clock, Globe, Users, Lock, ChevronDown } from 'lucide-react';
import { useLives } from '../../hooks/useLives';

interface Props {
  onClose: () => void;
  onScheduled: () => void;
}

const CATEGORIES = [
  '📊 Technical Analysis',
  '📈 Fundamental Analysis',
  '📰 Market News',
  '🎓 Financial Education',
  '💼 Trading Strategies',
  '🏢 Corporate Results',
  '💰 Cryptocurrencies',
  '🌎 International Markets',
  '📚 Live Course',
  '💡 Quick Tips',
];

export const ScheduleLiveModal: React.FC<Props> = ({ onClose, onScheduled }) => {
  const { createLive } = useLives();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'premium'>('public');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [error, setError] = useState('');

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Please add a title.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    if (!date) { setError('Please choose a date.'); return; }
    if (!time) { setError('Please choose a time.'); return; }

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt <= new Date()) {
      setError('The scheduled time must be in the future.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await createLive({
      title: title.trim(),
      category,
      description: description.trim(),
      privacy,
      status: 'scheduled',
      scheduled_at: scheduledAt.toISOString(),
    });

    setSubmitting(false);
    if (err) { setError('Could not schedule live. Please try again.'); return; }
    onScheduled();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900">📅 Schedule Live</h2>
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-5 pb-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="E.g. Market Recap — S&P 500 Analysis"
              maxLength={100}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <p className="text-xs text-slate-400 mt-1">{title.length}/100</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">Category *</label>
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm flex items-center justify-between focus:outline-none focus:border-green-500"
            >
              <span className={category ? 'text-slate-900' : 'text-slate-400'}>
                {category || 'Select a category'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition ${showCategoryPicker ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryPicker && (
              <div className="mt-1 border border-slate-200 rounded-xl overflow-hidden shadow-lg">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setShowCategoryPicker(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition ${
                      category === cat ? 'bg-green-50 text-green-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1.5">Description <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell viewers what you'll cover..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <p className="text-xs text-slate-400 mt-1">{description.length}/500</p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date *
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Who can watch?</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'public',    Icon: Globe,  label: 'Public' },
                { value: 'followers', Icon: Users,  label: 'Followers' },
                { value: 'premium',   Icon: Lock,   label: 'Premium' },
              ] as const).map(({ value, Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setPrivacy(value)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition ${
                    privacy === value
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            {submitting ? 'Scheduling...' : 'Schedule Live'}
          </button>
        </div>
      </div>
    </div>
  );
};
