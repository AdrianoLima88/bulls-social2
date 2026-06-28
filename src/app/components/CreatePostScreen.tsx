import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, BarChart3, FileText, Video, Smile, XCircle, TrendingUp, File, Loader2 } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { AddChartModal } from './AddChartModal';
import { AddDocumentModal } from './AddDocumentModal';
import { ContentWarningModal } from './ContentWarningModal';
import { EmojiPicker } from './EmojiPicker';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase/client';

export const CreatePostScreen = ({ onBack, onViewGuidelines }) => {
  const { user, profile } = useAuth();
  const { createPost } = usePosts();
  const { t } = useLocale();
  const [postType, setPostType] = useState('analysis');
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; url: string; preview: string }[]>([]);
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const moderateContent = (content: string) => {
    const blockedKeywords = ['futebol', 'política', 'religião', 'música', 'partid'];
    const contentLower = content.toLowerCase();
    for (const keyword of blockedKeywords) {
      if (contentLower.includes(keyword)) {
        return { isAllowed: false, reason: `Blocked keyword: "${keyword}"`, suggestion: 'Keep focus on financial markets.' };
      }
    }
    return { isAllowed: true };
  };

  // Upload to Supabase Storage — returns public URL
  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const bucket = file.type.startsWith('video/') ? 'videos' : 'post-images';

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    for (const file of files) {
      // Show local preview immediately
      const preview = URL.createObjectURL(file);
      setSelectedMedia(prev => [...prev, { type, url: '', preview }]);

      // Upload to storage in background
      const url = await uploadToStorage(file);
      if (url) {
        setSelectedMedia(prev => prev.map(m =>
          m.preview === preview ? { ...m, url } : m
        ));
      } else {
        // Remove if upload failed
        setSelectedMedia(prev => prev.filter(m => m.preview !== preview));
        alert('Failed to upload image. Please try again.');
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: string) => {
    setPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handlePublish = async () => {
    if (!postContent.trim() && selectedMedia.length === 0 && selectedCharts.length === 0 && selectedDocuments.length === 0) {
      alert('Please add some content or media to your post!');
      return;
    }

    if (uploading) {
      alert('Please wait for images to finish uploading.');
      return;
    }

    const moderation = moderateContent(postContent);
    if (!moderation.isAllowed) {
      setModerationResult(moderation);
      setShowContentWarning(true);
      return;
    }

    // Check all media has been uploaded
    const pendingUploads = selectedMedia.filter(m => !m.url);
    if (pendingUploads.length > 0) {
      alert('Please wait for all images to finish uploading.');
      return;
    }

    setPublishing(true);

    const tags = [...new Set([
      ...(postContent.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []),
    ])];

    const { error } = await createPost({
      type: postType,
      content: postContent,
      media: selectedMedia.length > 0 ? selectedMedia.map(m => ({ type: m.type, url: m.url })) : undefined,
      charts: selectedCharts.length > 0 ? selectedCharts : undefined,
      documents: selectedDocuments.length > 0 ? selectedDocuments : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    setPublishing(false);

    if (error) {
      alert('❌ Failed to publish post. Please try again.');
    } else {
      onBack();
    }
  };

  const canPublish = (postContent.trim() || selectedMedia.length > 0 || selectedCharts.length > 0 || selectedDocuments.length > 0) && !uploading && !publishing;

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-600">
          <X className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-slate-900">New Post</h1>
        <button
          onClick={handlePublish}
          disabled={!canPublish}
          className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : 'Publish'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Post Type */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-3">Post Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'analysis', label: '📊 Analysis' },
              { id: 'news', label: '📰 News' },
              { id: 'education', label: '📚 Education' },
              { id: 'company', label: '🏢 Company' },
            ].map(type => (
              <button key={type.id} onClick={() => setPostType(type.id)}
                className={`py-2 px-4 rounded-lg font-semibold transition ${postType === type.id ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {type.label}
              </button>
            ))}
            <button onClick={() => setPostType('generic')}
              className={`py-2 px-4 rounded-lg font-semibold transition col-span-2 ${postType === 'generic' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              🌐 General
            </button>
          </div>
        </div>

        {/* Text Editor */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : profile?.name?.[0] || 'U'
              }
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">{profile?.name || 'User'}</p>
              <p className="text-xs text-slate-500">@{profile?.username || 'user'}</p>
            </div>
          </div>

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={
              postType === 'analysis' ? 'Share your market analysis or stock breakdown...' :
              postType === 'news' ? 'Share a relevant market news or update...' :
              postType === 'education' ? 'Teach something new about investing or markets...' :
              postType === 'company' ? 'Comment on a company, earnings or latest results...' :
              'What are you thinking about the markets?'
            }
            className="w-full h-40 resize-none outline-none text-slate-900 text-lg"
            maxLength={500}
          />

          <div className="text-xs text-slate-400 text-right mb-3">{postContent.length}/500</div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-green-50 rounded-lg transition text-green-600" title="Add image">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button onClick={() => videoInputRef.current?.click()} className="p-2 hover:bg-green-50 rounded-lg transition text-green-600" title="Add video">
              <Video className="w-5 h-5" />
            </button>
            <button onClick={() => setShowChartModal(true)} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600" title="Add chart">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button onClick={() => setShowDocumentModal(true)} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600" title="Add document">
              <FileText className="w-5 h-5" />
            </button>
            <div className="relative ml-auto">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600">
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 z-50">
                  <EmojiPicker onClose={() => setShowEmojiPicker(false)} onSelectEmoji={handleEmojiSelect} />
                </div>
              )}
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
        </div>

        {/* Media Preview */}
        {selectedMedia.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Media</h3>
              {uploading && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
            <div className={`grid gap-2 ${selectedMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {selectedMedia.map((media, index) => (
                <div key={index} className="relative group">
                  {media.type === 'image' ? (
                    <img src={media.preview || media.url} alt="" className="w-full aspect-video object-cover rounded-lg" />
                  ) : (
                    <video src={media.preview || media.url} className="w-full aspect-video rounded-lg" controls />
                  )}
                  {!media.url && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Preview */}
        {selectedCharts.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-slate-900 mb-3">Charts</h3>
            <div className="space-y-3">
              {selectedCharts.map((chart, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{chart.title}</p>
                    <p className="text-xs text-slate-500">{chart.type} • {chart.data.length} points</p>
                  </div>
                  <button onClick={() => setSelectedCharts(prev => prev.filter((_, i) => i !== index))}>
                    <XCircle className="w-5 h-5 text-slate-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Preview */}
        {selectedDocuments.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="font-bold text-slate-900 mb-3">Documents</h3>
            <div className="space-y-3">
              {selectedDocuments.map((doc, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-slate-500">{(doc.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => setSelectedDocuments(prev => prev.filter((_, i) => i !== index))}>
                    <XCircle className="w-5 h-5 text-slate-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            💡 <strong>Tip:</strong>{' '}
            {postType === 'analysis' && 'Analyses with data and charts get 3x more engagement!'}
            {postType === 'news' && 'Share breaking market news to grow your audience!'}
            {postType === 'education' && 'Educational content generates more qualified followers!'}
            {postType === 'company' && 'Company analysis helps investors make better decisions!'}
            {postType === 'generic' && 'Share your market thoughts and connect with investors!'}
          </p>
        </div>
      </div>

      {showChartModal && <AddChartModal onClose={() => setShowChartModal(false)} onAddChart={(chart) => setSelectedCharts(prev => [...prev, chart])} />}
      {showDocumentModal && <AddDocumentModal onClose={() => setShowDocumentModal(false)} onAddDocument={(doc) => setSelectedDocuments(prev => [...prev, doc])} />}
      {showContentWarning && <ContentWarningModal onClose={() => setShowContentWarning(false)} onAccept={handlePublish} onViewGuidelines={onViewGuidelines} moderationResult={moderationResult} />}
    </div>
  );
};
