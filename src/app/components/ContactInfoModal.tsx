import React from 'react';
import { X, Phone, Video, Mail, MapPin, Briefcase, Calendar, TrendingUp, Bell, BellOff, AlertCircle, Shield, Trash2 } from 'lucide-react';

export const ContactInfoModal = ({ onClose, userName, userAvatar }) => {
  const contactInfo = {
    name: userName || 'Maria Silva',
    username: '@mariasilva',
    bio: 'Analyst de investimentos | Especialista em ações | Day trader 📈',
    email: 'maria.silva@email.com',
    location: 'São Paulo, SP',
    occupation: 'Analyst de Investimentos',
    joinDate: 'Membro desde Janeiro 2024',
    followers: '12.5k',
    following: '840',
    posts: '1.2k',
    mutualConnections: 23
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Profile */}
        <div className="p-6 bg-gradient-to-b from-green-50 to-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg">
              {userAvatar || 'MS'}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {contactInfo.name}
            </h3>
            <p className="text-green-600 font-semibold mb-2">
              {contactInfo.username}
            </p>
            <p className="text-slate-600 text-sm max-w-xs mb-4">
              {contactInfo.bio}
            </p>
            
            {/* Statistics */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{contactInfo.posts}</div>
                <div className="text-xs text-slate-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{contactInfo.followers}</div>
                <div className="text-xs text-slate-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{contactInfo.following}</div>
                <div className="text-xs text-slate-500">Following</div>
              </div>
            </div>

            {/* Botões de Ação Rápida */}
            <div className="flex gap-3 w-full max-w-xs">
              <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Ligar
              </button>
              <button className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2">
                <Video className="w-4 h-4" />
                Vídeo
              </button>
            </div>
          </div>
        </div>

        {/* Informações Detalhadas */}
        <div className="p-6 space-y-1">
          <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Informações</h4>
          
          {/* Email */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-slate-900 font-medium">{contactInfo.email}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Location</p>
              <p className="text-slate-900 font-medium">{contactInfo.location}</p>
            </div>
          </div>

          {/* Ocupação */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Ocupação</p>
              <p className="text-slate-900 font-medium">{contactInfo.occupation}</p>
            </div>
          </div>

          {/* Data de Entrada */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Bulls</p>
              <p className="text-slate-900 font-medium">{contactInfo.joinDate}</p>
            </div>
          </div>

          {/* Conexões em Comum */}
          <div className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Conexões em comum</p>
              <p className="text-slate-900 font-medium">{contactInfo.mutualConnections} pessoas</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-3 bg-white border-t-8 border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Settings</h4>
          
          {/* Notifications */}
          <div className="flex items-center gap-3 py-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="flex-1 text-slate-900 font-medium">Notifications</span>
            <div className="w-12 h-6 bg-green-600 rounded-full relative cursor-pointer transition hover:bg-green-700">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition"></div>
            </div>
          </div>

          {/* Bloquear */}
          <div className="flex items-center gap-3 py-2 cursor-pointer">
            <Shield className="w-5 h-5 text-slate-700" />
            <span className="text-slate-900 font-medium">Bloquear contato</span>
          </div>

          {/* Reportar */}
          <div className="flex items-center gap-3 py-2 cursor-pointer">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-500 font-medium">Reportar contato</span>
          </div>

          {/* Delete Conversa */}
          <div className="flex items-center gap-3 py-2 cursor-pointer">
            <Trash2 className="w-5 h-5 text-red-500" />
            <span className="text-red-500 font-medium">Delete conversa</span>
          </div>
        </div>
      </div>
    </div>
  );
};