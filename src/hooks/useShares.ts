import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const useShares = () => {
  const { user } = useAuth();

  // Registrar compartilhamento
  const sharePost = async (postId: string, platform: string = 'bulls') => {
    if (!user) {
      console.log('📤 Compartilhamento registrado (visitante):', { postId, platform });
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('shares')
        .insert({
          user_id: user.id,
          post_id: postId,
          platform: platform,
        });

      if (error) {
        // Se já compartilhou nessa plataforma, ignorar o erro
        if (error.code === '23505') {
          console.log('📤 Já compartilhou nesta plataforma');
          return { error: null };
        }
        throw error;
      }

      console.log('✅ Compartilhamento registrado:', { postId, platform });
      return { error: null };
    } catch (error) {
      console.error('Error sharing post:', error);
      return { error };
    }
  };

  // Registrar visualização de post
  const viewPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('post_views')
        .insert({
          user_id: user?.id || null,
          post_id: postId,
          ip_address: null, // Pode adicionar lógica para pegar IP
        });

      if (error) throw error;

      console.log('👁️ Visualização registrada:', { postId });
      return { error: null };
    } catch (error) {
      console.error('Error viewing post:', error);
      return { error };
    }
  };

  return {
    sharePost,
    viewPost,
  };
};
