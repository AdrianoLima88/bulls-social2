import React, { useState, useRef } from 'react';
import { ArrowLeft, X, Image as ImageIcon, BarChart3, FileText, AlertCircle, Trash2, Video, Smile, XCircle, TrendingUp, File } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';
import { AddChartModal } from './AddChartModal';
import { AddDocumentModal } from './AddDocumentModal';
import { ContentWarningModal } from './ContentWarningModal';
import { EmojiPicker } from './EmojiPicker';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../contexts/AuthContext';

export const CreatePostScreen = ({ onBack, onViewGuidelines }) => {
  const { currentUser } = useApp();
  const { user, profile } = useAuth();
  const { createPost } = usePosts();
  const { t } = useLocale();
  const [postType, setPostType] = useState('analysis');
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showContentWarning, setShowContentWarning] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);
  const [ticker, setTicker] = useState('');
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Função de moderação de conteúdo
  const moderateContent = (content, ticker) => {
    const blockedKeywords = ['futebol', 'política', 'religião', 'música', 'partid'];
    const contentLower = content.toLowerCase();
    
    for (const keyword of blockedKeywords) {
      if (contentLower.includes(keyword)) {
        return {
          isAllowed: false,
          reason: `Content contém palavra bloqueada: "${keyword}"`,
          suggestion: 'Mantenha o foco em mercado financeiro, investimentos e negócios.'
        };
      }
    }
    
    return { isAllowed: true };
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleAddVideo = () => {
    videoInputRef.current?.click();
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMedia(prev => [...prev, {
          type: type,
          url: reader.result,
          file: file,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMedia = (index) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddChart = () => {
    setShowChartModal(true);
  };

  const handleAddDocument = () => {
    setShowDocumentModal(true);
  };

  const handleEmojiSelect = (emoji) => {
    setPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handlePublish = async () => {
    if (!postContent.trim() && selectedMedia.length === 0 && selectedCharts.length === 0 && selectedDocuments.length === 0) {
      alert('Please add some content or media to your post!');
      return;
    }

    // Moderar conteúdo antes de publicar
    const moderation = moderateContent(postContent, ticker);

    if (!moderation.isAllowed) {
      setModerationResult(moderation);
      setShowContentWarning(true);
      return;
    }

    // Extrair tags do conteúdo
    const tags = postContent.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
    if (ticker) tags.push(ticker);

    const { error } = await createPost({
      type: postType,
      content: postContent,
      media: selectedMedia.length > 0 ? selectedMedia.map(m => ({
        type: m.type,
        url: m.url,
      })) : undefined,
      charts: selectedCharts.length > 0 ? selectedCharts : undefined,
      documents: selectedDocuments.length > 0 ? selectedDocuments : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    if (error) {
      console.error('Erro ao criar post:', error);
      alert('❌ Erro ao criar post. Tente novamente.');
    } else {
      alert('✅ Post published successfully! 🎉');
      onBack();
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-600">
          <X className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-slate-900">New Post</h1>
        <button 
          onClick={handlePublish}
          className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!postContent.trim() && selectedMedia.length === 0 && selectedCharts.length === 0 && selectedDocuments.length === 0}
        >
          Publish
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Post Type */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-3">Post Type</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPostType('analysis')}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                postType === 'analysis'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              📊 Analysis
            </button>
            <button
              onClick={() => setPostType('news')}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                postType === 'news'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              📰 News
            </button>
            <button
              onClick={() => setPostType('education')}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                postType === 'education'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              📚 Education
            </button>
            <button
              onClick={() => setPostType('company')}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                postType === 'company'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              🏢 Company
            </button>
            <button
              onClick={() => setPostType('generic')}
              className={`py-2 px-4 rounded-lg font-semibold transition col-span-2 ${
                postType === 'generic'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              💬 General
            </button>
          </div>
        </div>

        {/* Editor de Texto */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex gap-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {profile?.name?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">{profile?.name || 'User'}</p>
              <p className="text-xs text-slate-500">@{profile?.username || 'usuario'}</p>
            </div>
          </div>

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={
              postType === 'analysis'
                ? 'Share your market analysis or stock breakdown...'
                : postType === 'news'
                ? 'Share a relevant market news or update...'
                : postType === 'education'
                ? 'Teach something new about investing or markets...'
                : postType === 'company'
                ? 'Comment on a company, earnings or latest results...'
                : 'What are you thinking about the markets?'
            }
            className="w-full h-40 resize-none outline-none text-slate-900 text-lg"
            maxLength={500}
          />

          <div className="text-xs text-slate-400 text-right mb-3">
            {postContent.length}/500
          </div>
          
          {/* Ferramentas */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
            <button 
              onClick={handleAddImage}
              className="p-2 hover:bg-green-50 rounded-lg transition text-green-600"
              title="Add imagem"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAddVideo}
              className="p-2 hover:bg-green-50 rounded-lg transition text-green-600"
              title="Add video"
            >
              <Video className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAddChart}
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
              title="Add chart"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAddDocument}
              className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
              title="Add documento"
            >
              <FileText className="w-5 h-5" />
            </button>
            <div className="relative ml-auto">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 z-50">
                  <EmojiPicker 
                    onClose={() => setShowEmojiPicker(false)}
                    onSelectEmoji={handleEmojiSelect}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hidden file inputs */}
          <input 
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
          />
          <input 
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange(e, 'video')}
            className="hidden"
          />
        </div>

        {/* Preview de Mídias */}
        {selectedMedia.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">
                {selectedMedia[0].type === 'video' ? 'Vídeo' : 'Imagens'} Anexadas
              </h3>
              <span className="text-sm text-slate-500">{selectedMedia.length}</span>
            </div>
            <div className={`grid gap-2 ${selectedMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {selectedMedia.map((media, index) => (
                <div key={index} className="relative group">
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  ) : (
                    <video 
                      src={media.url}
                      className="w-full aspect-video object-cover rounded-lg"
                      controls
                    />
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

        {/* Preview de Charts */}
        {selectedCharts.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Charts Anexados</h3>
              <span className="text-sm text-slate-500">{selectedCharts.length}</span>
            </div>
            <div className="space-y-3">
              {selectedCharts.map((chart, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative group">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{chart.title}</p>
                      <p className="text-sm text-slate-500">
                        Chart: {chart.type === 'line' ? 'Line' : chart.type === 'bar' ? 'Bar' : 'Pie'} • {chart.data.length} points
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCharts(prev => prev.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview de Documentos */}
        {selectedDocuments.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Documentos Anexados</h3>
              <span className="text-sm text-slate-500">{selectedDocuments.length}</span>
            </div>
            <div className="space-y-3">
              {selectedDocuments.map((doc, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative group">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <File className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{doc.title}</p>
                      <p className="text-sm text-slate-500">
                        {doc.type === 'text' ? 'Documento de texto' : 'Arquivo'} • {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDocuments(prev => prev.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dicas baseadas no tipo de post */}
        <div className={`rounded-xl p-4 border ${
          postType === 'analysis' ? 'bg-green-50 border-green-200' :
          postType === 'opinion' ? 'bg-blue-50 border-blue-200' :
          postType === 'education' ? 'bg-purple-50 border-purple-200' :
          'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-sm ${
            postType === 'analysis' ? 'text-green-800' :
            postType === 'opinion' ? 'text-blue-800' :
            postType === 'education' ? 'text-purple-800' :
            'text-orange-800'
          }`}>
            💡 <strong>Tip:</strong>{' '}
            {postType === 'analysis' && 'Analyses com dados e gráficos têm 3x mais engajamento!'}
            {postType === 'opinion' && 'Compartilhe sua perspectiva única sobre o mercado!'}
            {postType === 'education' && 'Content educativo gera mais seguidores qualificados!'}
            {postType === 'media' && 'Vídeos e imagens aumentam o alcance do seu post!'}
          </p>
        </div>
      </div>

      {/* Modais */}
      {showChartModal && (
        <AddChartModal
          onClose={() => setShowChartModal(false)}
          onAddChart={(chart) => setSelectedCharts(prev => [...prev, chart])}
        />
      )}
      {showDocumentModal && (
        <AddDocumentModal
          onClose={() => setShowDocumentModal(false)}
          onAddDocument={(document) => setSelectedDocuments(prev => [...prev, document])}
        />
      )}
      {showContentWarning && (
        <ContentWarningModal
          onClose={() => setShowContentWarning(false)}
          onAccept={handlePublish}
          onViewGuidelines={onViewGuidelines}
          moderationResult={moderationResult}
        />
      )}
    </div>
  );
};