import React, { useState } from 'react';
import { X, Mail, Send, Check, Clock, UserPlus } from 'lucide-react';
import { useInvites } from '../../hooks/useInvites';
import { useFollows } from '../../hooks/useFollows';

interface Props {
  onClose: () => void;
  onNavigateToProfile: (profile: any) => void;
}

export const InviteModal: React.FC<Props> = ({ onClose, onNavigateToProfile }) => {
  const { invites, sending, sendInvite } = useInvites();
  const { isFollowing, toggleFollow } = useFollows();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSend = async () => {
    if (!email.trim()) return;
    const result = await sendInvite(email.trim());
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) setEmail('');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-slate-900">Invite to Bulls</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="friend@email.com"
              className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !email.trim()}
            className="px-4 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-1.5 hover:bg-green-700 transition"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <p className={`text-xs mb-4 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {feedback.message}
          </p>
        )}

        {/* Invite list */}
        {invites.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">Your invites</h3>
            <div className="space-y-3">
              {invites.map(invite => (
                <div key={invite.id} className="flex items-center gap-3">
                  {invite.status === 'accepted' && invite.invited_user ? (
                    <>
                      <button
                        onClick={() => {
                          onNavigateToProfile({ id: invite.invited_user!.id, name: invite.invited_user!.name, username: invite.invited_user!.username, type: 'other' });
                          onClose();
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {invite.invited_user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{invite.invited_user.name}</p>
                          <p className="text-xs text-slate-500 truncate">@{invite.invited_user.username}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => toggleFollow(invite.invited_user!.id)}
                        className={`px-3 py-1.5 rounded-full font-semibold text-sm transition flex-shrink-0 ${
                          isFollowing(invite.invited_user!.id)
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {isFollowing(invite.invited_user!.id) ? 'Following' : 'Follow'}
                      </button>
                      <span className="flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                        <Check className="w-3 h-3" /> Joined
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="flex-1 text-sm text-slate-600 truncate">{invite.email}</p>
                      <span className="flex items-center gap-1 text-xs text-amber-500 flex-shrink-0">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
