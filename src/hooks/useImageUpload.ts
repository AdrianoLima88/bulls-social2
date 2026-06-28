import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadImage = useCallback(async (
    file: File,
    type: 'avatar' | 'banner'
  ): Promise<{ url: string | null; error: string | null }> => {
    if (!user) return { url: null, error: 'Not authenticated' };

    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'File must be an image (JPG, PNG, WebP or GIF)' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Image must be under 5MB' };
    }

    setUploading(true);
    setProgress(20);

    try {
      // Simple flat path: {userId}-{type}.{ext}
      // This avoids folder-based RLS issues
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}-${type}.${ext}`;

      setProgress(40);

      // Upload with upsert to replace existing
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '0',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      setProgress(80);

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Add cache buster so browser loads new image
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      setProgress(90);

      // Update profile in database
      const field = type === 'avatar' ? 'avatar_url' : 'banner_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(updateError.message);
      }

      setProgress(100);
      return { url: publicUrl, error: null };

    } catch (e: any) {
      console.error('Upload failed:', e);
      return { url: null, error: e.message || 'Upload failed. Please try again.' };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [user]);

  // Upload media for posts
  const uploadPostMedia = useCallback(async (
    files: File[]
  ): Promise<{ urls: string[]; errors: string[] }> => {
    if (!user) return { urls: [], errors: ['Not authenticated'] };

    const urls: string[] = [];
    const errors: string[] = [];

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(Math.round((i / files.length) * 100));

      try {
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          errors.push(`${file.name}: exceeds ${isVideo ? '50MB' : '10MB'} limit`);
          continue;
        }

        const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
        const path = `${user.id}-${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(path, file, { cacheControl: '86400', upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('posts').getPublicUrl(path);
        urls.push(data.publicUrl);
      } catch (e: any) {
        errors.push(`${file.name}: ${e?.message || 'upload failed'}`);
      }
    }

    setUploading(false);
    setProgress(0);
    return { urls, errors };
  }, [user]);

  return {
    uploadImage,
    uploadPostMedia,
    uploading,
    progress,
  };
};
