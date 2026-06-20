import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useFollows } from '../../hooks/useFollows';
import { useAuth } from '../../contexts/AuthContext';

interface FollowingListScreenProps {
  onBack: () => void;
  onNavigateToProfile: (profileData: any) => void;
  userId: string; // ID do usuário cujos seguindo queremos ver
}

export const FollowingListScreen: React.FC<FollowingListScreenProps> = ({
  onBack,
  onNavigateToProfile,
  userId
}) => {
  const { getFollowing, isFollowing, toggleFollow } = useFollows();
  const { user } = useAuth();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async () => {
    setLoading(true);
    const { data, error } = await getFollowing(userId);
    if (error) {
      console.error('Error loading following:', error);
    } else {
      setFollowing(data || []);
    }
    setLoading(false);
  };

  const handleToggleFollow = async (profileId: string) => {
    const { error } = await toggleFollow(profileId);
    if (error) {
      alert(`Erro ao seguir/deixar de seguir: ${error}`);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Following</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : following.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <ArrowLeft className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 text-center font-semibold">Não está seguindo ninguém</p>
            <p className="text-slate-400 text-sm text-center mt-1">
              Quando seguir alguém, aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {following.map((profile) => (
              <div key={profile.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
                {/* Avatar */}
                <button
                  onClick={() => onNavigateToProfile(profile)}
                  className="flex-shrink-0"
                >
                  {profile.avatar_url ? (
                    <div
                      className="w-12 h-12 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${profile.avatar_url})` }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {profile.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onNavigateToProfile(profile)}
                    className="text-left w-full"
                  >
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {profile.name}
                      </p>
                      {profile.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {profile.username}
                    </p>
                    {profile.bio && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {profile.bio}
                      </p>
                    )}
                  </button>
                </div>

                {/* Botão Follow/Following */}
                {user && profile.id !== user.id && (
                  <button
                    onClick={() => handleToggleFollow(profile.id)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition flex-shrink-0 ${
                      isFollowing(profile.id)
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isFollowing(profile.id) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
