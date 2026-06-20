import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    if (!user) {
      return { error: 'User not authenticated', url: null };
    }

    try {
      setUploading(true);

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        return { error: 'O arquivo deve ser uma imagem', url: null };
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { error: 'A imagem deve ter no máximo 5MB', url: null };
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // Fazer upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Atualizar perfil com a nova URL
      const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      return { error: null, url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { error: error.message, url: null };
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
