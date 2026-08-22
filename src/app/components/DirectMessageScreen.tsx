import React, { useState, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Smile, Paperclip, Phone, Video, Info, File, Mic, MicOff, Play, Pause, Square } from 'lucide-react';
import { useAudioRecorder, formatAudioDuration } from '../../hooks/useAudioRecorder';
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
  attachment?: {
    type: 'image' | 'video' | 'file';
    name: string;
    size: number;
    url: string | null;
  };
  audio?: {
    url: string;
    duration: number;
  };
};

// ── Audio player bubble ─────────────────────────────────────────
const AudioBubble = ({ url, duration, isMe }: { url: string; duration: number; isMe: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 min-w-[180px] ${isMe ? 'bg-green-600 text-white rounded-br-md' : 'bg-white text-slate-900 rounded-bl-md shadow-sm'}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={e => setProgress((e.currentTarget.currentTime / (e.currentTarget.duration || 1)) * 100)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button onClick={toggle} className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-green-100 hover:bg-green-200'} transition`}>
        {playing
          ? <Pause className={`w-4 h-4 ${isMe ? 'text-white' : 'text-green-600'}`} />
          : <Play className={`w-4 h-4 ${isMe ? 'text-white' : 'text-green-600'}`} />}
      </button>
      <div className="flex-1 min-w-0">
        {/* Waveform placeholder */}
        <div className={`flex items-end gap-0.5 h-6 mb-1`}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all ${(i / 20) * 100 <= progress ? (isMe ? 'bg-white' : 'bg-green-500') : (isMe ? 'bg-white/40' : 'bg-slate-300')}`}
              style={{ height: `${20 + Math.sin(i * 1.3) * 10 + Math.cos(i * 0.7) * 8}%` }}
            />
          ))}
        </div>
        <p className={`text-xs ${isMe ? 'text-white/70' : 'text-slate-400'}`}>{formatAudioDuration(duration)}</p>
      </div>
    </div>
  );
};

const mkInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export const DirectMessageScreen = ({
  onBack,
  contact,
  userName,
  userAvatar,
  onStartVoiceCall,
  onStartVideoCall,
}: {
  onBack: () => void;
  contact?: Profile;
  userName?: string;
  userAvatar?: string;
  onStartVoiceCall?: () => void;
  onStartVideoCall?: () => void;
}) => {
  const profile  = contact ?? {};
  const name     = profile.name || userName || 'User';
  const abbrev   = profile.avatar_url ? null : mkInitials(name);

  const [message,             setMessage]             = useState('');
  const [showContactInfo,     setShowContactInfo]      = useState(false);
  const [showAttachmentModal, setShowAttachmentModal]  = useState(false);
  const [showEmojiPicker,     setShowEmojiPicker]      = useState(false);
  const [attachmentType,      setAttachmentType]       = useState<'media' | 'file'>('media');
  const [messages,            setMessages]             = useState<Message[]>([]);

  const { state: recState, duration: recDuration, recording, error: recError, startRecording, stopRecording, reset: resetRec } = useAudioRecorder();

  const handleSendAudio = () => {
    if (!recording) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: '',
      sender: 'me',
      time: now(),
      audio: { url: recording.url, duration: recording.duration },
    }]);
    resetRec();
  };

  const now = () =>
    new Date().toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: prev.length + 1, text: message, sender: 'me', time: now() }]);
    setMessage('');
  };

  const handleAttachmentSelect = (files: File[], previews: (string | null)[]) => {
    const newMsgs: Message[] = files.map((file, i) => ({
      id: Date.now() + i,
      text: '',
      sender: 'me',
      time: now(),
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
            <button
              onClick={() => onStartVoiceCall?.()}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => onStartVideoCall?.()}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Video className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setShowContactInfo(true)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-700 text-2xl font-bold">{abbrev || name[0]}</span>
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
                      {abbrev || name[0]}
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
                {msg.audio && (
                  <div className="mb-1">
                    <AudioBubble url={msg.audio.url} duration={msg.audio.duration} isMe={msg.sender === 'me'} />
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

      {/* Sugestões rápidas */}
      <div className="px-4 py-2 bg-white border-t border-slate-200">
        <div className="flex gap-2 overflow-x-auto pb-1">
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
        {/* Recording preview */}
        {recState === 'stopped' && recording && (
          <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-green-50 rounded-2xl border border-green-200">
            <AudioBubble url={recording.url} duration={recording.duration} isMe={true} />
            <div className="flex gap-2 ml-auto">
              <button onClick={resetRec} className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-red-100 transition">
                <Square className="w-3.5 h-3.5 text-slate-600" />
              </button>
              <button onClick={handleSendAudio} className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition">
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Recording indicator */}
        {recState === 'recording' && (
          <div className="flex items-center gap-3 mb-3 px-4 py-2 bg-red-50 rounded-2xl border border-red-200">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-red-600">Recording… {formatAudioDuration(recDuration)}</span>
            <button onClick={stopRecording} className="ml-auto w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition">
              <Square className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        )}

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
              placeholder={recState === 'recording' ? 'Recording audio…' : 'Type a message...'}
              rows={1}
              disabled={recState === 'recording'}
              className="w-full px-4 py-3 bg-slate-100 rounded-2xl text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-600 max-h-32 disabled:opacity-50"
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
          {/* Mic button (shown when no text typed) */}
          {!message.trim() && recState === 'idle' && (
            <button
              onClick={startRecording}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 hover:bg-green-100 transition"
            >
              <Mic className="w-5 h-5 text-green-600" />
            </button>
          )}
          {/* Send button (shown when text typed or stopped) */}
          {(message.trim() || recState === 'stopped') && (
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition ${message.trim() ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' : 'bg-slate-200 text-slate-400'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
        {recError && <p className="text-xs text-red-500 mt-1 px-2">{recError}</p>}
      </div>

      {/* ContactInfoModal */}
      {showContactInfo && (
        <ContactInfoModal
          onClose={() => setShowContactInfo(false)}
          contact={profile}
          userName={name}
          userAvatar={abbrev ?? undefined}
          onVoiceCall={() => { setShowContactInfo(false); onStartVoiceCall?.(); }}
          onVideoCall={() => { setShowContactInfo(false); onStartVideoCall?.(); }}
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
