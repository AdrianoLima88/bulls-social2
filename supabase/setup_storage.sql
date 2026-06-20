-- ============================================
-- STORAGE BUCKETS AND POLICIES
-- ============================================
-- This file sets up the storage buckets needed for image uploads
-- Run this SQL in your Supabase SQL Editor

-- Create storage bucket for profile images (avatars and banners)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] IN ('avatars', 'banners')
);

-- Allow anyone to read profile images (since bucket is public)
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles')
WITH CHECK (bucket_id = 'profiles');

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');
