import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, MapPin, Link as LinkIcon, Mail, Briefcase, GraduationCap, User, Eye, X, Upload } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useAuth } from '../../contexts/AuthContext';

export const EditProfileScreen = ({ onBack, onSave, initialData }) => {
  const { uploadImage, uploading } = useImageUpload();
  const { profile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  // Estados do formulário - inicializados com os dados do perfil
  const [name, setName] = useState(initialData?.name || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [education, setEducation] = useState(initialData?.education || '');
  
  // Estados de configuração
  const [profileVisibility, setProfileVisibility] = useState(initialData?.profileVisibility || 'public');
  const [showEmail, setShowEmail] = useState(initialData?.showEmail || false);
  const [allowMessages, setAllowMessages] = useState(initialData?.allowMessages !== undefined ? initialData.allowMessages : true);
  const [showInvestments, setShowInvestments] = useState(initialData?.showInvestments !== undefined ? initialData.showInvestments : true);
  
  // Preview de imagem
  const [showPreview, setShowPreview] = useState(false);
  
  // Estados para imagens
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageSelectorType, setImageSelectorType] = useState(''); // 'banner' ou 'profile'
  const [selectedBanner, setSelectedBanner] = useState(initialData?.selectedBanner || null);
  const [selectedProfilePic, setSelectedProfilePic] = useState(initialData?.selectedProfilePic || null);
  
  // Certifications
  const [certifications, setCertifications] = useState(initialData?.certifications || []);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  
  // Modais
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Handlers
  const handleAddCertification = () => {
    if (newCertName.trim() && newCertIssuer.trim()) {
      setCertifications([...certifications, {
        id: Date.now(),
        name: newCertName,
        issuer: newCertIssuer
      }]);
      setNewCertName('');
      setNewCertIssuer('');
      setShowAddCert(false);
    }
  };
  
  const handleRemoveCertification = (id) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };
  
  const handleChangePassword = () => {
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      // Aqui você implementaria a lógica de mudança de senha
      alert('Senha alterada com sucesso!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else if (newPassword !== confirmPassword) {
      alert('Passwords don\'t match!');
    } else {
      alert('Password must be at least 6 characters!');
    }
  };
  
  const handleBannerChange = () => {
    bannerInputRef.current?.click();
  };

  const handleProfilePictureChange = () => {
    avatarInputRef.current?.click();
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const { error, url } = await uploadImage(file, 'banner');
      if (error) {
        alert(`Erro ao fazer upload: ${error}`);
      } else if (url) {
        setSelectedBanner(url);
        alert('Banner atualizado com sucesso!');
      }
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const { error, url } = await uploadImage(file, 'avatar');
      if (error) {
        alert(`Erro ao fazer upload: ${error}`);
      } else if (url) {
        setSelectedProfilePic(url);
        alert('Foto de perfil atualizada com sucesso!');
      }
    }
  };

  const getBannerStyle = () => {
    if (!selectedBanner) {
      return 'bg-gradient-to-r from-green-500 to-emerald-600';
    }
    if (typeof selectedBanner === 'string' && (selectedBanner.startsWith('data:') || selectedBanner.startsWith('http'))) {
      return '';
    }
    const gradients = {
      green: 'bg-gradient-to-br from-green-500 to-emerald-600',
      blue: 'bg-gradient-to-br from-blue-500 to-blue-700',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-700',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-700',
      pink: 'bg-gradient-to-br from-pink-500 to-pink-700',
      slate: 'bg-gradient-to-br from-slate-600 to-slate-800'
    };
    return gradients[selectedBanner] || 'bg-gradient-to-r from-green-500 to-emerald-600';
  };

  const getProfilePicStyle = () => {
    if (!selectedProfilePic) {
      return 'bg-green-600';
    }
    if (typeof selectedProfilePic === 'string' && (selectedProfilePic.startsWith('data:') || selectedProfilePic.startsWith('http'))) {
      return '';
    }
    const gradients = {
      green: 'bg-gradient-to-br from-green-500 to-emerald-600',
      blue: 'bg-gradient-to-br from-blue-500 to-blue-700',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-700',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-700',
      pink: 'bg-gradient-to-br from-pink-500 to-pink-700',
      slate: 'bg-gradient-to-br from-slate-600 to-slate-800'
    };
    return gradients[selectedProfilePic] || 'bg-green-600';
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-white font-semibold">
            Cancel
          </button>
          <h1 className="text-white font-bold text-lg">Edit Profile</h1>
          <button 
            onClick={() => {
              onSave?.({
                name,
                username,
                bio,
                location,
                website,
                email,
                jobTitle,
                company,
                education,
                profileVisibility,
                showEmail,
                allowMessages,
                showInvestments,
                selectedBanner,
                selectedProfilePic,
                certifications
              });
              onBack();
            }}
            className="text-white font-semibold"
          >
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Photos de Profile */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-slate-700 font-semibold mb-4">Photos</p>
          
          {/* Banner */}
          <div className="mb-6">
            <label className="text-slate-600 text-sm mb-2 block">Banner</label>
            <div className={`relative h-32 rounded-xl overflow-hidden ${!selectedBanner || (typeof selectedBanner === 'string' && !selectedBanner.startsWith('data:') && !selectedBanner.startsWith('http')) ? getBannerStyle() : ''}`}
              style={selectedBanner && typeof selectedBanner === 'string' && (selectedBanner.startsWith('data:') || selectedBanner.startsWith('http')) ? {
                backgroundImage: `url(${selectedBanner})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              <button 
                onClick={handleBannerChange}
                className="absolute inset-0 bg-black/40 hover:bg-black/50 transition flex items-center justify-center"
              >
                <div className="text-center">
                  <Camera className="w-8 h-8 text-white mx-auto mb-1" />
                  <p className="text-white text-sm font-semibold">Change Banner</p>
                </div>
              </button>
            </div>
          </div>

          {/* Profile Photo */}
          <div>
            <label className="text-slate-600 text-sm mb-2 block">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden ${!selectedProfilePic || (typeof selectedProfilePic === 'string' && !selectedProfilePic.startsWith('data:') && !selectedProfilePic.startsWith('http')) ? getProfilePicStyle() : ''}`}
                  style={selectedProfilePic && typeof selectedProfilePic === 'string' && (selectedProfilePic.startsWith('data:') || selectedProfilePic.startsWith('http')) ? {
                    backgroundImage: `url(${selectedProfilePic})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  {(!selectedProfilePic || (typeof selectedProfilePic === 'string' && !selectedProfilePic.startsWith('data:') && !selectedProfilePic.startsWith('http'))) && (
                    name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'
                  )}
                </div>
                <button 
                  onClick={handleProfilePictureChange}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-green-700 transition"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-slate-700 font-semibold mb-1">{name || 'Seu Nome'}</p>
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-sm text-green-600 font-semibold"
                >
                  View profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-slate-700 font-semibold mb-4">Basic Information</p>
          
          {/* Nome */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-2 block flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-2 block">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                @
              </span>
              <input
                type="text"
                value={username.replace('@', '')}
                onChange={(e) => setUsername('@' + e.target.value.replace('@', ''))}
                placeholder="seunome"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              bulls.com.br{username}
            </p>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-2 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={4}
              maxLength={160}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              {bio.length}/160 caracteres
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-slate-700 font-semibold mb-4">Account</p>
          
          {/* Email */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-2 block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="showEmail"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded"
              />
              <label htmlFor="showEmail" className="text-sm text-slate-600">
                Exibir email no perfil
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Cidade, Estado"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Website */}
          <div>
            <label className="text-slate-600 text-sm mb-2 block flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Website
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="seusite.com"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Informações Profissionais */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-slate-700 font-semibold mb-4">Profissional</p>
          
          {/* Job title */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-2 block flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex: Analyst de Investimentos"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Company */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-2 block">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ex: XP Investimentos"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Education */}
          <div>
            <label className="text-slate-600 text-sm mb-2 block flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Education
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Ex: Economia - USP"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-700 font-semibold">Certifications</p>
            <button 
              onClick={() => setShowAddCert(true)}
              className="text-green-600 font-semibold text-sm hover:text-green-700 transition"
            >
              + Add
            </button>
          </div>
          
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-700 font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{cert.name}</p>
                    <p className="text-xs text-slate-500">{cert.issuer}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveCertification(cert.id)}
                  className="text-slate-400 hover:text-red-500 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            {certifications.length === 0 && (
              <p className="text-center text-slate-400 py-4">
                No certifications added
              </p>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-slate-700 font-semibold mb-4">Privacy</p>
          
          {/* Profile Visibility */}
          <div className="mb-4">
            <label className="text-slate-600 text-sm mb-3 block">
              Profile Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={profileVisibility === 'public'}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-5 h-5 text-green-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Public</p>
                  <p className="text-xs text-slate-500">Anyone can view your profile</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="radio"
                  name="visibility"
                  value="followers"
                  checked={profileVisibility === 'followers'}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-5 h-5 text-green-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Followers only</p>
                  <p className="text-xs text-slate-500">Only followers can view</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={profileVisibility === 'private'}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-5 h-5 text-green-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Private</p>
                  <p className="text-xs text-slate-500">Requires follower approval</p>
                </div>
              </label>
            </div>
          </div>

          {/* Outras Settings de Privacy */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Allow direct messages</span>
              <input
                type="checkbox"
                checked={allowMessages}
                onChange={(e) => setAllowMessages(e.target.checked)}
                className="w-12 h-6 rounded-full appearance-none bg-slate-300 checked:bg-green-600 relative cursor-pointer transition-colors
                          before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                          checked:before:translate-x-6"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Show investment portfolio</span>
              <input
                type="checkbox"
                checked={showInvestments}
                onChange={(e) => setShowInvestments(e.target.checked)}
                className="w-12 h-6 rounded-full appearance-none bg-slate-300 checked:bg-green-600 relative cursor-pointer transition-colors
                          before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                          checked:before:translate-x-6"
              />
            </label>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button 
            onClick={() => setShowChangePassword(true)}
            className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Modal de Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Preview do Profile</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            {/* Preview Content */}
            <div className="p-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-24 rounded-xl mb-4"></div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold -mt-8 border-4 border-white">
                  MS
                </div>
                <div className="flex-1 pt-2">
                  <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                  <p className="text-slate-600">{username}</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-3">{bio}</p>
              
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                {jobTitle && <p>💼 {jobTitle} {company && `at ${company}`}</p>}
                {education && <p>🎓 {education}</p>}
                {location && <p>📍 {location}</p>}
                {website && <p>🔗 {website}</p>}
              </div>
              
              <div className="flex gap-4 text-sm">
                <span><strong>234</strong> Followers</span>
                <span><strong>189</strong> Following</span>
                <span><strong>45</strong> Posts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Certification */}
      {showAddCert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Nova Certificação</h3>
              <button 
                onClick={() => {
                  setShowAddCert(false);
                  setNewCertName('');
                  setNewCertIssuer('');
                }}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-slate-600 text-sm mb-2 block">
                  Nome da Certificação
                </label>
                <input
                  type="text"
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  placeholder="Ex: CPA-20, CFP, CGA"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              <div>
                <label className="text-slate-600 text-sm mb-2 block">
                  Issuing Institution
                </label>
                <input
                  type="text"
                  value={newCertIssuer}
                  onChange={(e) => setNewCertIssuer(e.target.value)}
                  placeholder="Ex: ANBIMA, IBCPF, CFA"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              <button
                onClick={handleAddCertification}
                disabled={!newCertName.trim() || !newCertIssuer.trim()}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  newCertName.trim() && newCertIssuer.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Add Certification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Change Password */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
              <button 
                onClick={() => {
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-slate-600 text-sm mb-2 block">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              <div>
                <label className="text-slate-600 text-sm mb-2 block">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min. 6 characters)"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              <div>
                <label className="text-slate-600 text-sm mb-2 block">
                  Confirm Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente a nova senha"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-sm">
                  ⚠️ As senhas não coincidem
                </p>
              )}
              
              {newPassword && newPassword.length < 6 && (
                <p className="text-red-500 text-sm">
                  ⚠️ A senha deve ter no mínimo 6 caracteres
                </p>
              )}
              
              <button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seletor de Imagem */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {imageSelectorType === 'banner' ? 'Seletor de imagem para banner' : 'Seletor de imagem para perfil'}
              </h3>
              <button 
                onClick={() => setShowImageSelector(false)}
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-slate-600 mb-4">
                {imageSelectorType === 'banner' 
                  ? 'Escolha uma imagem para o banner do seu perfil' 
                  : 'Escolha uma imagem para sua foto de perfil'}
              </p>
              
              {/* Área de Upload */}
              <div className="border-2 border-dashed border-green-300 rounded-2xl p-8 bg-green-50 hover:bg-green-100 transition cursor-pointer mb-4 relative">
                <Camera className="w-16 h-16 text-green-600 mx-auto mb-3" />
                <p className="text-green-700 font-semibold mb-1">Clique para fazer upload</p>
                <p className="text-sm text-green-600">ou arraste e solte uma imagem aqui</p>
                <p className="text-xs text-slate-500 mt-2">PNG, JPG até 5MB</p>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              {/* Opções Pré-definidas */}
              <div className="mb-4">
                <p className="text-slate-700 font-semibold mb-3 text-left">Ou escolha um gradiente:</p>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => {
                      if (imageSelectorType === 'banner') {
                        setSelectedBanner('green');
                      } else {
                        setSelectedProfilePic('green');
                      }
                      setShowImageSelector(false);
                    }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-105 transition border-2 border-transparent hover:border-green-700"
                  >
                  </button>
                  <button 
                    onClick={() => {
                      if (imageSelectorType === 'banner') {
                        setSelectedBanner('blue');
                      } else {
                        setSelectedProfilePic('blue');
                      }
                      setShowImageSelector(false);
                    }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 hover:scale-105 transition border-2 border-transparent hover:border-blue-800"
                  >
                  </button>
                  <button 
                    onClick={() => {
                      if (imageSelectorType === 'banner') {
                        setSelectedBanner('purple');
                      } else {
                        setSelectedProfilePic('purple');
                      }
                      setShowImageSelector(false);
                    }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 hover:scale-105 transition border-2 border-transparent hover:border-purple-800"
                  >
                  </button>
                  <button 
                    onClick={() => {
                      if (imageSelectorType === 'banner') {
                        setSelectedBanner('orange');
                      } else {
                        setSelectedProfilePic('orange');
                      }
                      setShowImageSelector(false);
                    }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 hover:scale-105 transition border-2 border-transparent hover:border-orange-800"
                  >
                  </button>
                  <button 
                    onClick={() => {
                      if (imageSelectorType === 'banner') {
                        setSelectedBanner('pink');
                      } else {
                        setSelectedProfilePic('pink');
                      }
                      setShowImageSelector(false);
                    }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 hover:scale-105 transition border-2 border-transparent hover:border-pink-800"
                  >
                  </button>
                  <button 
                    onClick={() => {
                      if (imageSelectorType === 'banner') {
                        setSelectedBanner('slate');
                      } else {
                        setSelectedProfilePic('slate');
                      }
                      setShowImageSelector(false);
                    }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 hover:scale-105 transition border-2 border-transparent hover:border-slate-900"
                  >
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowImageSelector(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </div>
  );
};