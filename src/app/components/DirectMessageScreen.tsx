import React, { useState } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Smile, Paperclip, MoreVertical, Phone, Video, Info, Film, File } from 'lucide-react';
import { VoiceCallScreen } from './VoiceCallScreen';
import { VideoCallScreen } from './VideoCallScreen';
import { ContactInfoModal } from './ContactInfoModal';
import { AttachmentModal } from './AttachmentModal';
import { EmojiPicker } from './EmojiPicker';

export const DirectMessageScreen = ({ onBack, userName, userAvatar }) => {
  const [message, setMessage] = useState('');
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentType, setAttachmentType] = useState('media'); // 'media' ou 'file'
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Olá! Vi sua análise sobre PETR4, muito interessante!',
      sender: 'other',
      time: '10:30',
      date: 'Today'
    },
    {
      id: 2,
      text: 'Você acha que ainda é um bom momento para entrar?',
      sender: 'other',
      time: '10:31',
      date: 'Today'
    },
    {
      id: 3,
      text: 'Oi! Obrigada! Sim, ainda vejo potencial de alta 📈',
      sender: 'me',
      time: '10:35',
      date: 'Today'
    },
    {
      id: 4,
      text: 'O preço está testando suporte importante em € 36,50. Se romper, pode buscar os € 44,00',
      sender: 'me',
      time: '10:35',
      date: 'Today'
    },
    {
      id: 5,
      text: 'Entendi! Vou analisar melhor. Obrigado pela atenção! 🙏',
      sender: 'other',
      time: '10:38',
      date: 'Today'
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: 'Today'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleVoiceCall = () => {
    setShowVoiceCall(true);
  };

  const handleVideoCall = () => {
    setShowVideoCall(true);
  };

  const handleShowInfo = () => {
    setShowContactInfo(true);
  };

  const handleShowAttachmentModal = (type) => {
    setAttachmentType(type);
    setShowAttachmentModal(true);
  };

  const handleAttachmentSelect = (files, previews) => {
    // Criar mensagens com anexos
    files.forEach((file, index) => {
      const newMessage = {
        id: messages.length + index + 1,
        text: '',
        sender: 'me',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        attachment: {
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
          name: file.name,
          size: file.size,
          url: previews[index] || null
        }
      };
      setMessages(prev => [...prev, newMessage]);
    });
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
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
                <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold">
                  {userAvatar || 'MS'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-green-600 rounded-full"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-white font-bold">{userName || 'Maria Silva'}</h1>
                <p className="text-white/80 text-xs">Online now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceCall}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleVideoCall}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Video className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleShowInfo}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Indicador de data */}
        <div className="flex justify-center">
          <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-semibold">
            Today
          </span>
        </div>

        {messages.map((msg, index) => {
          const showAvatar = msg.sender === 'other' && (index === 0 || messages[index - 1].sender !== 'other');
          
          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'other' && (
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar && (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      MS
                    </div>
                  )}
                </div>
              )}
              
              <div className={`max-w-[70%] ${msg.sender === 'me' ? 'order-1' : ''}`}>
                {/* Anexo de Imagem */}
                {msg.attachment && msg.attachment.type === 'image' && (
                  <div className={`rounded-2xl overflow-hidden mb-1 ${
                    msg.sender === 'me' ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}>
                    <img
                      src={msg.attachment.url}
                      alt={msg.attachment.name}
                      className="w-full max-w-xs object-cover"
                    />
                  </div>
                )}

                {/* Anexo de Vídeo */}
                {msg.attachment && msg.attachment.type === 'video' && (
                  <div className={`rounded-2xl overflow-hidden mb-1 bg-slate-900 ${
                    msg.sender === 'me' ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}>
                    <video
                      src={msg.attachment.url}
                      controls
                      className="w-full max-w-xs"
                    />
                  </div>
                )}

                {/* Anexo de Arquivo */}
                {msg.attachment && msg.attachment.type === 'file' && (
                  <div className={`rounded-2xl p-3 mb-1 flex items-center gap-3 ${
                    msg.sender === 'me'
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-white text-slate-900 rounded-bl-md shadow-sm'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.sender === 'me' ? 'bg-white/20' : 'bg-green-100'
                    }`}>
                      <File className={`w-5 h-5 ${msg.sender === 'me' ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{msg.attachment.name}</p>
                      <p className={`text-xs ${msg.sender === 'me' ? 'text-white/70' : 'text-slate-500'}`}>
                        {(msg.attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                )}

                {/* Texto da Message */}
                {msg.text && (
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      msg.sender === 'me'
                        ? 'bg-green-600 text-white rounded-br-md'
                        : 'bg-white text-slate-900 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                )}
                
                <p className={`text-xs text-slate-400 mt-1 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sugestões Rápidas */}
      <div className="px-4 py-2 bg-white border-t border-slate-200">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setMessage('Qual sua análise sobre ')}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-slate-200 transition"
          >
            💬 Pedir opinião
          </button>
          <button 
            onClick={() => setMessage('Obrigado pela dica! 🙏')}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-slate-200 transition"
          >
            🙏 Agradecer
          </button>
          <button 
            onClick={() => setMessage('Posso te fazer uma pergunta?')}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-slate-200 transition"
          >
            ❓ Fazer pergunta
          </button>
        </div>
      </div>

      {/* Input de Message */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="flex items-end gap-2">
          {/* Botões de Anexo */}
          <div className="flex gap-2">
            <button
              onClick={() => handleShowAttachmentModal('media')}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
            >
              <ImageIcon className="w-5 h-5 text-green-600" />
            </button>
            <button
              onClick={() => handleShowAttachmentModal('file')}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
            >
              <Paperclip className="w-5 h-5 text-green-600" />
            </button>
          </div>

          {/* Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-slate-100 rounded-2xl text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-600 max-h-32"
              style={{ minHeight: '44px' }}
            />
            <div className="relative">
              <button 
                className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && <EmojiPicker onClose={() => setShowEmojiPicker(false)} onSelectEmoji={handleEmojiSelect} />}
            </div>
          </div>

          {/* Botão Enviar */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
              message.trim()
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Telas de Chamada */}
      {showVoiceCall && <VoiceCallScreen onEnd={() => setShowVoiceCall(false)} userName={userName || 'Maria Silva'} userAvatar={userAvatar || 'MS'} />}
      {showVideoCall && <VideoCallScreen onEnd={() => setShowVideoCall(false)} userName={userName || 'Maria Silva'} userAvatar={userAvatar || 'MS'} />}
      {showContactInfo && <ContactInfoModal onClose={() => setShowContactInfo(false)} userName={userName || 'Maria Silva'} userAvatar={userAvatar || 'MS'} />}
      {showAttachmentModal && <AttachmentModal onClose={() => setShowAttachmentModal(false)} type={attachmentType} onSelectAttachment={handleAttachmentSelect} />}
    </div>
  );
};