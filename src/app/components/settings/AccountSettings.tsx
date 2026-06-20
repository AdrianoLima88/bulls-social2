import React, { useState } from 'react';
import { ArrowLeft, Mail, Smartphone, Lock, CreditCard, User, Camera, X, Check, AlertCircle, Shield, Download, HelpCircle, Globe, Type, UserX, Ban, Eye, MessageSquare, Ban as BanIcon } from 'lucide-react';
import { PremiumModal, PrivacyModal, SecurityModal, FontSizeModal, LanguageModal, DownloadDataModal, HelpCenterModal } from './AccountSettingsModals';
import { useLocale } from '../../contexts/LocaleContext';

export const AccountSettings = ({ onBack }) => {
  const { locale } = useLocale();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDownloadDataModal, setShowDownloadDataModal] = useState(false);
  const [showHelpCenterModal, setShowHelpCenterModal] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newName, setNewName] = useState('Maria Silva');
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('pt-BR');

  // Validação de senha
  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      valid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      errors: {
        minLength: !hasMinLength,
        upperCase: !hasUpperCase,
        lowerCase: !hasLowerCase,
        number: !hasNumber,
        specialChar: !hasSpecialChar
      }
    };
  };

  const handleEmailChange = () => {
    if (!newEmail.includes('@')) {
      alert('❌ Please enter a valid email!');
      return;
    }
    alert(`✅ Instruções enviadas!\\n\\nPara alterar seu e-mail, você precisará:\\n\\n1. Confirm sua senha atual\\n2. Inserir o novo e-mail\\n3. Verificar o novo e-mail através de um link de confirmação\\n\\nEnviamos as instruções para ${newEmail}.`);
    setShowEmailModal(false);
    setNewEmail('');
  };

  const handlePhoneChange = () => {
    if (newPhone.length < 10) {
      alert('❌ Please enter a valid phone number!');
      return;
    }
    alert(`✅ Código SMS enviado!\\n\\nPara alterar seu telefone, você precisará:\\n\\n1. Confirm sua senha atual\\n2. Inserir o novo número\\n3. Verificar através de código SMS\\n\\nEnviamos um código para ${newPhone}.`);
    setShowPhoneModal(false);
    setNewPhone('');
  };

  const handlePasswordChange = () => {
    const validation = validatePassword(newPassword);
    
    if (!validation.valid) {
      let errorMsg = '❌ A senha não atende aos requisitos:\\n\\n';
      if (validation.errors.minLength) errorMsg += '• Mínimo 8 caracteres\\n';
      if (validation.errors.upperCase || validation.errors.lowerCase) errorMsg += '• Letras maiúsculas e minúsculas\\n';
      if (validation.errors.number) errorMsg += '• Pelo menos 1 número\\n';
      if (validation.errors.specialChar) errorMsg += '• Pelo menos 1 caractere especial\\n';
      alert(errorMsg);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('❌ Passwords don\'t match!');
      return;
    }
    
    alert('✅ Senha alterada com sucesso!\\n\\nSua senha foi atualizada. Use a nova senha no próximo login.');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleNameChange = () => {
    if (newName.trim().length < 3) {
      alert('❌ O nome deve ter pelo menos 3 caracteres!');
      return;
    }
    alert('✅ Nome alterado com sucesso!');
    setShowNameModal(false);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Account</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                MS
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">Maria Silva</h3>
              <p className="text-sm text-slate-600">@mariasilva</p>
              <button 
                onClick={() => setShowNameModal(true)}
                className="text-sm text-green-600 font-semibold mt-1"
              >
                Edit perfil
              </button>
            </div>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Informações Pessoais</h3>
          </div>

          <button 
            onClick={() => setShowEmailModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">E-mail</p>
                <p className="text-xs text-slate-500">maria.silva@email.com</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Alterar</span>
          </button>

          <button 
            onClick={() => setShowPhoneModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition border-t border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Telefone</p>
                <p className="text-xs text-slate-500">(11) 98765-4321</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Alterar</span>
          </button>

          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition border-t border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Senha</p>
                <p className="text-xs text-slate-500">Última alteração há 3 meses</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Alterar</span>
          </button>
        </div>

        {/* Plano */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Premium Plan</h3>
              <p className="text-sm text-white/80">Ativo até 05/04/2026</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <p className="text-white/90 text-sm mb-3">Benefícios ativos:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Check className="w-4 h-4" />
                <span>Unlimited analyses</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Check className="w-4 h-4" />
                <span>Alertas personalizados</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Check className="w-4 h-4" />
                <span>Ad-free</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Check className="w-4 h-4" />
                <span>Verified badge ✓</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setShowPremiumModal(true)}
              className="flex-1 bg-white text-green-600 py-2 rounded-xl font-semibold hover:bg-white/90 transition"
            >
              Gerenciar
            </button>
            <button className="flex-1 bg-white/20 text-white py-2 rounded-xl font-semibold hover:bg-white/30 transition">
              History
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Privacy e Security</h3>
          </div>

          <button 
            onClick={() => setShowPrivacyModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Accounts Bloqueadas</p>
                <p className="text-xs text-slate-500">3 contas bloqueadas</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Ver</span>
          </button>

          <button 
            onClick={() => setShowSecurityModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition border-t border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Autenticação em 2 Etapas</p>
                <p className="text-xs text-slate-500">Security extra ativada</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Configurar</span>
          </button>
        </div>

        {/* Preferências */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Preferências</h3>
          </div>

          <button 
            onClick={() => setShowFontSizeModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Type className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Tamanho da Fonte</p>
                <p className="text-xs text-slate-500">Médio (atual)</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Alterar</span>
          </button>

          <button 
            onClick={() => setShowLanguageModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition border-t border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Language</p>
                <p className="text-xs text-slate-500">Português (BR)</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Alterar</span>
          </button>
        </div>

        {/* Dados e Ajuda */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Dados e Ajuda</h3>
          </div>

          <button 
            onClick={() => setShowDownloadDataModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Baixar Meus Dados</p>
                <p className="text-xs text-slate-500">Solicitar cópia dos seus dados</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Solicitar</span>
          </button>

          <button 
            onClick={() => setShowHelpCenterModal(true)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition border-t border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Central de Ajuda</p>
                <p className="text-xs text-slate-500">Encontre respostas e suporte</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-semibold">Abrir</span>
          </button>
        </div>
      </div>

      {/* Modal Alterar E-mail */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Alterar E-mail</h3>
              <button onClick={() => setShowEmailModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">E-mail atual</label>
                <input 
                  type="email" 
                  value="maria.silva@email.com" 
                  disabled
                  className="w-full bg-slate-100 text-slate-500 px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Novo e-mail</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="seu.novo@email.com"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEmailChange}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar Telefone */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Alterar Telefone</h3>
              <button onClick={() => setShowPhoneModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Telefone atual</label>
                <input 
                  type="tel" 
                  value="(11) 98765-4321" 
                  disabled
                  className="w-full bg-slate-100 text-slate-500 px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Novo telefone</label>
                <input 
                  type="tel" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="(11) 91234-5678"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePhoneChange}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Alterar Senha</h3>
              <button onClick={() => setShowPasswordModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Current password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">New password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <p className="text-xs text-slate-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Confirm nova senha</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePasswordChange}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Alterar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Nome */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Edit Profile</h3>
              <button onClick={() => setShowNameModal(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Nome</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Bio</label>
                <textarea 
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="w-full bg-slate-50 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleNameChange}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Novos Modais */}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
      {showPrivacyModal && <PrivacyModal onClose={() => setShowPrivacyModal(false)} />}
      {showSecurityModal && <SecurityModal onClose={() => setShowSecurityModal(false)} />}
      {showFontSizeModal && <FontSizeModal onClose={() => setShowFontSizeModal(false)} fontSize={fontSize} setFontSize={setFontSize} />}
      {showLanguageModal && <LanguageModal onClose={() => setShowLanguageModal(false)} language={language} setLanguage={setLanguage} />}
      {showDownloadDataModal && <DownloadDataModal onClose={() => setShowDownloadDataModal(false)} />}
      {showHelpCenterModal && <HelpCenterModal onClose={() => setShowHelpCenterModal(false)} />}
    </div>
  );
};