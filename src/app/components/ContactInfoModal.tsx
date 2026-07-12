import React, { useState } from 'react';
import { X, Phone, Video, Mail, MapPin, Briefcase, Calendar, Bell, AlertCircle, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

type Profile = {
  id?: string;
  name?: string;
  username?: string;
  bio?: string;
  email?: string;
  location?: string;
  job_title?: string;
  company?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  created_at?: string;
};

export const ContactInfoModal = ({
  onClose,
  contact,
  userName,
  userAvatar,
  onVoiceCall,
  onVideoCall,
  onConversationDeleted,
}: {
  onClose: () => void;
  contact?: Profile;
  userName?: string;
  userAvatar?: string;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onConversationDeleted?: () => void;
}) => {
  const { user } = useAuth();
  const [notificationsOn, setNotificationsOn]   = useState(true);
  const [showBlockConfirm, setShowBlockConfirm]  = useState(false);
  const [showReportDialog, setShowReportDialog]  = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportReason, setReportReason]           = useState('');
  const [actionDone, setActionDone]               = useState<string | null>(null);

  const p    = contact ?? {};
  const name = p.name || userName || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const joinDate = p.created_at
    ? `Member since ${new Date(p.created_at).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}`
    : null;

  const handleBlock = async () => {
    if (p.id && user) {
      await supabase.from('blocks').upsert(
        { blocker_id: user.id, blocked_id: p.id },
        { onConflict: 'blocker_id,blocked_id' }
      ).maybeSingle().catch(() => {});
    }
    setShowBlockConfirm(false);
    setActionDone('blocked');
    setTimeout(() => onClose(), 1500);
  };

  const handleReport = async () => {
    if (!reportReason) return;
    if (p.id && user) {
      await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: p.id,
        reason: reportReason,
        type: 'user',
      }).maybeSingle().catch(() => {});
    }
    setShowReportDialog(false);
    setReportReason('');
    setActionDone('reported');
    setTimeout(() => setActionDone(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Action feedback */}
        {actionDone && (
          <div className="mx-4 mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-semibold">
              {actionDone === 'blocked' ? `${name} has been blocked.` : 'Report submitted. Thank you.'}
            </p>
          </div>
        )}

        {/* Profile section */}
        <div className="p-6 bg-gradient-to-b from-green-50 to-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg overflow-hidden">
              {p.avatar_url
                ? <img src={p.avatar_url} alt={name} className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{name}</h3>
            {p.username && <p className="text-green-600 font-semibold mb-2">@{p.username}</p>}
            {p.bio && <p className="text-slate-600 text-sm max-w-xs mb-4">{p.bio}</p>}

            {/* Stats */}
            <div className="flex gap-6 mb-5">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{p.posts_count ?? '—'}</div>
                <div className="text-xs text-slate-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{p.followers_count ?? '—'}</div>
                <div className="text-xs text-slate-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{p.following_count ?? '—'}</div>
                <div className="text-xs text-slate-500">Following</div>
              </div>
            </div>

            {/* Call buttons */}
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={() => { onClose(); setTimeout(() => onVoiceCall?.(), 100); }}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Call
              </button>
              <button
                onClick={() => { onClose(); setTimeout(() => onVideoCall?.(), 100); }}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" /> Video
              </button>
            </div>
          </div>
        </div>

        {/* Info rows */}
        {(p.email || p.location || p.job_title || p.company || joinDate) && (
          <div className="p-6 space-y-1">
            <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Information</h4>

            {p.email && (
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-slate-900 font-medium">{p.email}</p>
                </div>
              </div>
            )}

            {p.location && (
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-slate-900 font-medium">{p.location}</p>
                </div>
              </div>
            )}

            {(p.job_title || p.company) && (
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Occupation</p>
                  <p className="text-slate-900 font-medium">
                    {[p.job_title, p.company].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            )}

            {joinDate && (
              <div className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Bulls</p>
                  <p className="text-slate-900 font-medium">{joinDate}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="p-6 space-y-3 bg-white border-t-8 border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Settings</h4>

          {/* Notifications */}
          <div className="flex items-center gap-3 py-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="flex-1 text-slate-900 font-medium">Notifications</span>
            <button
              onClick={() => setNotificationsOn(!notificationsOn)}
              className={`w-12 h-6 rounded-full relative transition-colors ${notificationsOn ? 'bg-green-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${notificationsOn ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Block */}
          {showBlockConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-bold text-red-800 mb-1">Block {name}?</p>
              <p className="text-xs text-red-700 mb-3">They won't be able to message you or see your posts.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowBlockConfirm(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleBlock} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold">Block</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowBlockConfirm(true)} className="flex items-center gap-3 py-2 w-full text-left hover:opacity-70 transition">
              <Shield className="w-5 h-5 text-slate-700" />
              <span className="text-slate-900 font-medium">Block contact</span>
            </button>
          )}

          {/* Report */}
          {showReportDialog ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-800 mb-3">Report {name}</p>
              <div className="space-y-1.5 mb-3">
                {['Spam or scam', 'Harassment', 'Inappropriate content', 'Financial misinformation', 'Other'].map(r => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
                      reportReason === r ? 'bg-amber-200 text-amber-900' : 'bg-white text-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowReportDialog(false); setReportReason(''); }} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">Submit</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowReportDialog(true)} className="flex items-center gap-3 py-2 w-full text-left hover:opacity-70 transition">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-medium">Report contact</span>
            </button>
          )}

          {/* Delete conversation */}
          {showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-bold text-red-800 mb-1">Delete conversation?</p>
              <p className="text-xs text-red-700 mb-3">All messages in this chat will be removed.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold">Cancel</button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); onConversationDeleted?.(); onClose(); }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-3 py-2 w-full text-left hover:opacity-70 transition">
              <Trash2 className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-medium">Delete conversation</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
