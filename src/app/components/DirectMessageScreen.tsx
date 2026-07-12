import React, { useState } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Smile, Paperclip, Phone, Video, Info, File } from 'lucide-react';
import { VoiceCallScreen }   from './VoiceCallScreen';
import { VideoCallScreen }   from './VideoCallScreen';
import { ContactInfoModal }  from './ContactInfoModal';
import { AttachmentModal }   from './AttachmentModal';
import { EmojiPicker }       from './EmojiPicker';

type Profile = {
  id?: string;
  name?: string;
  username?: string;
  bio?: string;
  email?: string;
  location?: string;
  job_title?: string;
  company?: string;
  avatar_url?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  created_at?: string;
};

type Message = {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
  date: string;
  attachment?: {
    type: 'image' | 'video' | 'file';
    name: string;
    size: number;
    url: string | null;
  };
};

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export const DirectMessageScreen = ({
  onBack,
  contact,
  userName,
  userAvatar,
}: {
  onBack: () => void;
  contact?: Profile;
  userName?: string;
  userAvatar?: string;
}) => {
  const profile  = contact ?? {};
  const name     = profile.name || userName || 'User';
  const abbrev   = profile.avatar_url ? null : initials(name);

  const [message,            setMessage]            = useState('');
  const [showVoiceCall,      setShowVoiceCall]       = useState(false);
  const [showVideoCall,      setShowVideoCall]       = useState(false);
  const [showContactInfo,    setShowContactInfo]     = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showEmojiPicker,    setShowEmojiPicker]     = useState(false);
  const [attachmentType,     setAttachmentType]      = useState<'media' | 'file'>('media');
  const [messages,           setMessages]            = useState<Message[]>([]);

  const now = () =>
    new Date().toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: prev.length + 1, text: message, sender: 'me', time: now(), date: 'Today' }]);
    setMessage('');
  };

  const handleAttachmentSelect = (files: File[], previews: (string | null)[]) => {
    const newMsgs: Message[] = files.map((file, i) => ({
      id: Date.now() + i,
      text: '',
      sender: 'me',
      time: now(),
      date: 'Today',
      attachment: {
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
        name: file.name,
        size: file.size,
        url: previews[i] ?? null,
      },
    }));
    setMessages(prev => [...prev, ...newMsgs]);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                    : abbrev
                  }
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-green-600 rounded-full" />
              </div>
              <div>
                <h1 className="text-white font-bold">{name}</h1>
                <p className="text-white/80 text-xs">Online now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowVoiceCall(true)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setShowVideoCall(true)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <Video className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setShowContactInfo(true)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-700 text-2xl font-bold">{abbrev}</span>
            </div>
            <p className="text-slate-500 text-sm">Start a conversation with <strong>{name}</strong></p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex justify-center">
            <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-semibold">Today</span>
          </div>
        )}

        {messages.map((msg, index) => {
          const showAvatar = msg.sender === 'other' && (index === 0 || messages[index - 1].sender !== 'other');
          return (
            <div key={msg.id} className={`flex gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'other' && (
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar && (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {abbrev}
                    </div>
                  )}
                </div>
              )}
              <div className={`max-w-[70%] ${msg.sender === 'me' ? 'order-1' : ''}`}>
                {msg.attachment?.type === 'image' && (
                  <div className={`rounded-2xl overflow-hidden mb-1 ${msg.sender === 'me' ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                    <img src={msg.attachment.url ?? ''} alt={msg.attachment.name} className="w-full max-w-xs object-cover" />
                  </div>
                )}
                {msg.attachment?.type === 'video' && (
                  <div className={`rounded-2xl overflow-hidden mb-1 bg-slate-900 ${msg.sender === 'me' ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                    <video src={msg.attachment.url ?? ''} controls className="w-full max-w-xs" />
                  </div>
                )}
                {msg.attachment?.type === 'file' && (
                  <div className={`rounded-2xl p-3 mb-1 flex items-center gap-3 ${msg.sender === 'me' ? 'bg-green-600 text-white rounded-br-md' : 'bg-white text-slate-900 rounded-bl-md shadow-sm'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.sender === 'me' ? 'bg-white/20' : 'bg-green-100'}`}>
                      <File className={`w-5 h-5 ${msg.sender === 'me' ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{msg.attachment.name}</p>
                      <p className={`text-xs ${msg.sender === 'me' ? 'text-white/70' : 'text-slate-500'}`}>
                        {(msg.attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}
                {msg.text && (
                  <div className={`rounded-2xl px-4 py-2 ${msg.sender === 'me' ? 'bg-green-600 text-white rounded-br-md' : 'bg-white text-slate-900 rounded-bl-md shadow-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                )}
                <p className={`text-xs text-slate-400 mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>{msg.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick replies */}
      <div className="px-4 py-2 bg-white border-t border-slate-200">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { emoji: '💬', label: 'Ask for opinion', text: 'What do you think about ' },
            { emoji: '🙏', label: 'Thank you',       text: 'Thanks for the tip! 🙏'  },
            { emoji: '❓', label: 'Ask a question',  text: 'Can I ask you something?' },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setMessage(s.text)}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-slate-200 transition"
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-end gap-2">
          <div className="flex gap-2">
            <button onClick={() => { setAttachmentType('media'); setShowAttachmentModal(true); }} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
              <ImageIcon className="w-5 h-5 text-green-600" />
            </button>
            <button onClick={() => { setAttachmentType('file'); setShowAttachmentModal(true); }} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
              <Paperclip className="w-5 h-5 text-green-600" />
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-slate-100 rounded-2xl text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-600 max-h-32"
              style={{ minHeight: '44px' }}
            />
            <div className="relative">
              <button className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  onClose={() => setShowEmojiPicker(false)}
                  onSelectEmoji={(emoji: string) => { setMessage(m => m + emoji); setShowEmojiPicker(false); }}
                />
              )}
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${message.trim() ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' : 'bg-slate-200 text-slate-400'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overlays */}
      {showVoiceCall && (
        <VoiceCallScreen
          onEnd={() => setShowVoiceCall(false)}
          userName={name}
          userAvatar={abbrev ?? name[0]}
        />
      )}
      {showVideoCall && (
        <VideoCallScreen
          onEnd={() => setShowVideoCall(false)}
          userName={name}
          userAvatar={abbrev ?? name[0]}
        />
      )}
      {showContactInfo && (
        <ContactInfoModal
          onClose={() => setShowContactInfo(false)}
          contact={profile}
          userName={name}
          userAvatar={abbrev ?? undefined}
          onVoiceCall={() => setShowVoiceCall(true)}
          onVideoCall={() => setShowVideoCall(true)}
          onConversationDeleted={() => setMessages([])}
        />
      )}
      {showAttachmentModal && (
        <AttachmentModal
          onClose={() => setShowAttachmentModal(false)}
          type={attachmentType}
          onSelectAttachment={handleAttachmentSelect}
        />
      )}
    </div>
  );
};
