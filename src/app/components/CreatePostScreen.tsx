import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, BarChart3, FileText, Video, Smile, XCircle, TrendingUp, File, Loader2, Lock, Crown, Sparkles, Building2, Eye } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { AddChartModal } from './AddChartModal';
import { AddDocumentModal } from './AddDocumentModal';
import { ContentWarningModal } from './ContentWarningModal';
import { EmojiPicker } from './EmojiPicker';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../utils/supabase/client';
import { FinancialReportCard, encodeFinancialReport, type FinancialReportData } from './FinancialReportCard';

export const CreatePostScreen = ({ onBack, onViewGuidelines, onNavigateToPremium }) => {
  const { user, profile } = useAuth();
  const { createPost } = usePosts();
  const { t } = useLocale();
  const { isPremium, isPro, isBusiness } = useSubscription();
  const [postType, setPostType] = useState('analysis');
  const [postContent, setPostContent] = useState('');
  const [isPremiumPost, setIsPremiumPost] = useState(false);
  const [isFeaturedPost, setIsFeaturedPost] = useState(false);
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

  // ── Financial Report state (Company tab, Business only) ──────────────────
  const [finTicker, setFinTicker] = useState('');
  const [finCompanyName, setFinCompanyName] = useState('');
  const [finQuarter, setFinQuarter] = useState<'Q1'|'Q2'|'Q3'|'Q4'>('Q1');
  const [finYear, setFinYear] = useState(new Date().getFullYear());
  const [finResult, setFinResult] = useState<'beat'|'inline'|'miss'>('beat');
  const [finRevVal, setFinRevVal] = useState('');
  const [finRevUnit, setFinRevUnit] = useState('B');
  const [finRevYoy, setFinRevYoy] = useState('');
  const [finNiVal, setFinNiVal] = useState('');
  const [finNiUnit, setFinNiUnit] = useState('B');
  const [finNiYoy, setFinNiYoy] = useState('');
  const [finEpsVal, setFinEpsVal] = useState('');
  const [finEpsYoy, setFinEpsYoy] = useState('');
  const [finGmVal, setFinGmVal] = useState('');
  const [finGmYoy, setFinGmYoy] = useState('');
  const [finHighlight, setFinHighlight] = useState('');
  const [showFinPreview, setShowFinPreview] = useState(false);

  const buildFinData = (): FinancialReportData => ({
    ticker: finTicker,
    companyName: finCompanyName,
    quarter: finQuarter,
    year: finYear,
    result: finResult,
    highlight: finHighlight || undefined,
    metrics: {
      revenue:     { value: parseFloat(finRevVal) || 0, unit: finRevUnit, yoy: parseFloat(finRevYoy) || 0 },
      netIncome:   { value: parseFloat(finNiVal)  || 0, unit: finNiUnit,  yoy: parseFloat(finNiYoy)  || 0 },
      eps:         { value: parseFloat(finEpsVal) || 0, yoy: parseFloat(finEpsYoy) || 0 },
      grossMargin: { value: parseFloat(finGmVal)  || 0, yoy: parseFloat(finGmYoy)  || 0 },
    },
  });

  const finCanPublish = finTicker.trim() && finCompanyName.trim() && finRevVal && finNiVal && finEpsVal && finGmVal;

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
    // Company (financial report) path
    if (postType === 'financial') {
      if (!finCanPublish) { alert('Please fill in all required financial fields.'); return; }
      setPublishing(true);
      const content = encodeFinancialReport(buildFinData());
      const { error } = await createPost({ type: 'company', content, is_featured: isFeaturedPost });
      setPublishing(false);
      if (error) alert('❌ Failed to publish report. Please try again.');
      else onBack();
      return;
    }

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
      is_premium: isPremiumPost,
      is_featured: isFeaturedPost,
    });

    setPublishing(false);

    if (error) {
      alert('❌ Failed to publish post. Please try again.');
    } else {
      onBack();
    }
  };

  const canPublish = postType === 'financial'
    ? (!!finCanPublish && !publishing)
    : ((postContent.trim() || selectedMedia.length > 0 || selectedCharts.length > 0 || selectedDocuments.length > 0) && !uploading && !publishing);

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
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${postType === type.id ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {type.label}
              </button>
            ))}
            <button onClick={() => setPostType('generic')}
              className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${postType === 'generic' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              🌐 General
            </button>
            {/* Financial Statement — Business only */}
            <button
              onClick={() => setPostType('financial')}
              className={`py-2 px-3 rounded-lg font-semibold text-sm transition relative ${postType === 'financial' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              📑 Financials
              {!isBusiness && <Crown className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />}
            </button>
          </div>
        </div>

        {/* ── Company (Financial Report) — Business only ── */}
        {postType === 'financial' && !isBusiness && (
          <div className="bg-white rounded-xl p-6 mb-4 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg">Business Plan Required</p>
              <p className="text-slate-500 text-sm mt-1">
                Publishing official financial reports is exclusively available for Business account holders.
              </p>
            </div>
            <button
              onClick={() => onNavigateToPremium?.()}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Business
            </button>
          </div>
        )}

        {postType === 'financial' && isBusiness && (
          <div className="space-y-3 mb-4">
            {/* Company info */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900">Company Info</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">TICKER *</label>
                  <input
                    value={finTicker}
                    onChange={e => setFinTicker(e.target.value.toUpperCase())}
                    placeholder="AAPL"
                    maxLength={8}
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl font-black text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">COMPANY NAME *</label>
                  <input
                    value={finCompanyName}
                    onChange={e => setFinCompanyName(e.target.value)}
                    placeholder="Apple Inc."
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Period + Result */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Reporting Period & Result</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Quarter */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">QUARTER</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Q1','Q2','Q3','Q4'] as const).map(q => (
                      <button key={q} onClick={() => setFinQuarter(q)}
                        className={`py-2 rounded-lg font-bold text-sm transition ${finQuarter === q ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Year */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">YEAR</label>
                  <input
                    type="number"
                    value={finYear}
                    onChange={e => setFinYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                    min={2000} max={2099}
                  />
                </div>
              </div>
              {/* Result */}
              <label className="text-xs font-semibold text-slate-500 mb-2 block">EARNINGS RESULT</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'beat',   label: '🚀 Beat',    active: 'bg-emerald-600 text-white' },
                  { id: 'inline', label: '⚖️ In-line', active: 'bg-amber-500 text-white'   },
                  { id: 'miss',   label: '⛔ Miss',    active: 'bg-red-500 text-white'     },
                ] as const).map(r => (
                  <button key={r.id} onClick={() => setFinResult(r.id)}
                    className={`py-2.5 rounded-xl font-bold text-sm transition ${finResult === r.id ? r.active : 'bg-slate-100 text-slate-600'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Key Metrics</h3>
              <div className="space-y-3">
                {/* Revenue */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">REVENUE *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 flex gap-1">
                      <input value={finRevVal} onChange={e => setFinRevVal(e.target.value)} placeholder="12.5"
                        type="number" className="w-full px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <select value={finRevUnit} onChange={e => setFinRevUnit(e.target.value)}
                        className="px-2 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none">
                        <option>B</option><option>M</option><option>K</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-semibold">YoY %</span>
                      <input value={finRevYoy} onChange={e => setFinRevYoy(e.target.value)} placeholder="+12.3"
                        type="number" className="flex-1 px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                </div>
                {/* Net Income */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">NET INCOME *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 flex gap-1">
                      <input value={finNiVal} onChange={e => setFinNiVal(e.target.value)} placeholder="3.2"
                        type="number" className="w-full px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <select value={finNiUnit} onChange={e => setFinNiUnit(e.target.value)}
                        className="px-2 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none">
                        <option>B</option><option>M</option><option>K</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-semibold">YoY %</span>
                      <input value={finNiYoy} onChange={e => setFinNiYoy(e.target.value)} placeholder="+8.1"
                        type="number" className="flex-1 px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                </div>
                {/* EPS */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">EPS *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={finEpsVal} onChange={e => setFinEpsVal(e.target.value)} placeholder="1.52"
                      type="number" className="px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-semibold">YoY %</span>
                      <input value={finEpsYoy} onChange={e => setFinEpsYoy(e.target.value)} placeholder="+15.2"
                        type="number" className="flex-1 px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                </div>
                {/* Gross Margin */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">GROSS MARGIN (%) *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={finGmVal} onChange={e => setFinGmVal(e.target.value)} placeholder="43.6"
                      type="number" className="px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-semibold">pp change</span>
                      <input value={finGmYoy} onChange={e => setFinGmYoy(e.target.value)} placeholder="-0.5"
                        type="number" className="flex-1 px-3 py-2.5 bg-slate-50 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Management highlight */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">MANAGEMENT HIGHLIGHT (optional)</label>
              <textarea
                value={finHighlight}
                onChange={e => setFinHighlight(e.target.value)}
                placeholder="e.g. Record revenue driven by strong services growth and international expansion…"
                rows={3}
                maxLength={200}
                className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-slate-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-right text-xs text-slate-400 mt-1">{finHighlight.length}/200</p>
            </div>

            {/* Live Preview toggle */}
            {finTicker && finRevVal && (
              <div>
                <button
                  onClick={() => setShowFinPreview(p => !p)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
                >
                  <Eye className="w-4 h-4" />
                  {showFinPreview ? 'Hide Preview' : 'Preview Card'}
                </button>
                {showFinPreview && (
                  <div className="mt-3">
                    <FinancialReportCard data={buildFinData()} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Text Editor */}
        {postType !== 'financial' && (
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
              postType === 'financial' ? 'Comment on a company, earnings or latest results...' :
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
            {/* Gráficos — requer Premium */}
            <button
              onClick={() => isPremium ? setShowChartModal(true) : onNavigateToPremium?.()}
              className={`p-2 rounded-lg transition relative ${isPremium ? 'hover:bg-slate-100 text-slate-600' : 'text-slate-300'}`}
              title={isPremium ? 'Add chart' : 'Charts require Premium'}
            >
              <BarChart3 className="w-5 h-5" />
              {!isPremium && <Crown className="w-2.5 h-2.5 text-yellow-500 absolute top-1 right-1" />}
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

          {/* Toggle Post Exclusivo — apenas Pro/Business */}
          {isPro && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsPremiumPost(!isPremiumPost)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                  isPremiumPost
                    ? 'bg-purple-50 border-2 border-purple-400'
                    : 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${isPremiumPost ? 'text-purple-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${isPremiumPost ? 'text-purple-700' : 'text-slate-700'}`}>
                      Exclusive post for subscribers
                    </p>
                    <p className="text-xs text-slate-500">Only Premium/Pro subscribers will see the full content</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition relative flex-shrink-0 ${isPremiumPost ? 'bg-purple-600' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${isPremiumPost ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>
          )}

          {/* Toggle Post em Destaque — apenas Business */}
          {isBusiness && (
            <div className={isPro ? 'mt-2' : 'mt-3 pt-3 border-t border-slate-100'}>
              <button
                onClick={() => setIsFeaturedPost(!isFeaturedPost)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                  isFeaturedPost
                    ? 'bg-amber-50 border-2 border-amber-400'
                    : 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className={`w-4 h-4 ${isFeaturedPost ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-bold ${isFeaturedPost ? 'text-amber-700' : 'text-slate-700'}`}>
                      Featured publication
                    </p>
                    <p className="text-xs text-slate-500">Highlighted in the feed with a featured badge</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition relative flex-shrink-0 ${isFeaturedPost ? 'bg-amber-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${isFeaturedPost ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
        </div>
        )} {/* end postType !== 'financial' */}

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
            {postType === 'financial' && 'Company analysis helps investors make better decisions!'}
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
