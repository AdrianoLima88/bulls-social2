import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useFollows } from '../../hooks/useFollows';
import { useAuth } from '../../contexts/AuthContext';

interface FollowersListScreenProps {
  onBack: () => void;
  onNavigateToProfile: (profileData: any) => void;
  userId: string; // ID do usuário cujos seguidores queremos ver
}

export const FollowersListScreen: React.FC<FollowersListScreenProps> = ({
  onBack,
  onNavigateToProfile,
  userId
}) => {
  const { getFollowers, isFollowing, toggleFollow } = useFollows();
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const loadFollowers = async () => {
    setLoading(true);
    const { data, error } = await getFollowers(userId);
    if (error) {
      console.error('Error loading followers:', error);
    } else {
      setFollowers(data || []);
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
          <h1 className="text-white font-bold text-lg">Followers</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : followers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <ArrowLeft className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 text-center font-semibold">Nenhum seguidor ainda</p>
            <p className="text-slate-400 text-sm text-center mt-1">
              Quando alguém seguir este perfil, aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {followers.map((follower) => (
              <div key={follower.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3">
                {/* Avatar */}
                <button
                  onClick={() => onNavigateToProfile(follower)}
                  className="flex-shrink-0"
                >
                  {follower.avatar_url ? (
                    <div
                      className="w-12 h-12 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${follower.avatar_url})` }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {follower.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => onNavigateToProfile(follower)}
                    className="text-left w-full"
                  >
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {follower.name}
                      </p>
                      {follower.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {follower.username}
                    </p>
                    {follower.bio && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {follower.bio}
                      </p>
                    )}
                  </button>
                </div>

                {/* Botão Follow/Following */}
                {user && follower.id !== user.id && (
                  <button
                    onClick={() => handleToggleFollow(follower.id)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition flex-shrink-0 ${
                      isFollowing(follower.id)
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isFollowing(follower.id) ? 'Following' : 'Follow'}
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
