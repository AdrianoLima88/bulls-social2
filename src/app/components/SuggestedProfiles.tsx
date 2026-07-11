import React, { useState } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { useSuggestedProfiles } from '../../hooks/useSuggestedProfiles';
import { useFollows } from '../../hooks/useFollows';

export const SuggestedProfiles = ({ onNavigateToProfile }) => {
  const { profiles, loading } = useSuggestedProfiles(5);
  const { isFollowing, toggleFollow } = useFollows();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-32 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const visible = profiles.filter(p => !dismissed.includes(p.id));

  if (profiles.length === 0 || visible.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-green-600" />
        Who to follow
      </h3>
      <div className="space-y-3">
        {visible.map(profile => (
          <div key={profile.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                const profileData = {
                  id: profile.id,
                  name: profile.name,
                  username: profile.username,
                  type: 'other'
                };
                onNavigateToProfile(profileData);
              }}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {profile.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {profile.name || 'User'}
                  </p>
                  {profile.verified && (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  @{profile.username || 'usuario'}
                </p>
              </div>
            </button>
            <button
              onClick={() => toggleFollow(profile.id)}
              className={`px-3 py-1.5 rounded-full font-semibold text-sm transition flex items-center gap-1 flex-shrink-0 ${
                isFollowing(profile.id)
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isFollowing(profile.id) ? (
                <>
                  <Check className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </button>
            <button
              onClick={() => setDismissed(prev => [...prev, profile.id])}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
