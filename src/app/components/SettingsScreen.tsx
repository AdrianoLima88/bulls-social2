import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, HelpCircle, Info, LogOut, Crown, FileText, Globe, ChevronRight, BarChart3, Palette, Mail, Smartphone, Lock, CreditCard, Eye, Zap, Moon, Download, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useLocale } from '../contexts/LocaleContext';

export const SettingsScreen = ({ onBack, onLogout, onNavigateToPremium, onNavigateToGuidelines, onNavigateToLanguageRegion, onNavigateToCreatorDashboard }) => {
  const { t, locale } = useLocale();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [liveTheme, setLiveTheme] = useState(() => {
    return localStorage.getItem('liveTheme') || 'dark';
  });
  
  const [showSection, setShowSection] = useState(null);

  const handleLiveThemeChange = (theme: string) => {
    setLiveTheme(theme);
    localStorage.setItem('liveTheme', theme);
  };

  const toggleSection = (section) => {
    setShowSection(showSection === section ? null : section);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">{t('settings.title')}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* Creator Dashboard - Destaque */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Creator Dashboard</h3>
              <p className="text-white/90 text-sm">Analytics, monetização e ferramentas</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToCreatorDashboard?.()}
            className="w-full bg-white text-purple-700 px-4 py-3 rounded-xl font-bold hover:bg-white/90 transition flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Acessar Dashboard
          </button>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('account')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900">Account</h3>
                <p className="text-xs text-slate-500">Personal information and preferences</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition ${showSection === 'account' ? 'rotate-90' : ''}`} />
          </button>
          
          {showSection === 'account' && (
            <div className="border-t border-slate-100">
              <button 
                onClick={() => alert('📧 Alterar E-mail\n\nPara alterar seu e-mail, você precisará:\n\n1. Confirm sua senha atual\n2. Inserir o novo e-mail\n3. Verificar o novo e-mail através de um link de confirmação\n\nFuncionalidade completa será implementada em breve! 🚀')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">E-mail</p>
                    <p className="text-xs text-slate-500">maria.silva@email.com</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              
              <button 
                onClick={() => alert('📱 Alterar Telefone\n\nPara alterar seu telefone, você precisará:\n\n1. Confirm sua senha atual\n2. Inserir o novo número\n3. Verificar através de código SMS\n\nFuncionalidade completa será implementada em breve! 🚀')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Telefone</p>
                    <p className="text-xs text-slate-500">(11) 98765-4321</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button 
                onClick={() => alert('🔒 Alterar Senha\n\nPara alterar sua senha, você precisará:\n\n1. Confirm senha atual\n2. Inserir nova senha (mínimo 8 caracteres)\n3. Confirm a nova senha\n\nRequisitos de segurança:\n• Mínimo 8 caracteres\n• Letras maiúsculas e minúsculas\n• Pelo menos 1 número\n• Pelo menos 1 caractere especial\n\nFuncionalidade completa será implementada em breve! 🚀')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Change password</p>
                    <p className="text-xs text-slate-500">Última alteração há 3 meses</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button 
                onClick={() => onNavigateToPremium()}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Plano</p>
                    <p className="text-xs text-green-600 font-semibold">Premium • Ativo</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('privacy')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900">Privacy & Security</h3>
                <p className="text-xs text-slate-500">Control who can see your information</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition ${showSection === 'privacy' ? 'rotate-90' : ''}`} />
          </button>
          
          {showSection === 'privacy' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Account Privada</p>
                    <p className="text-xs text-slate-500">Apenas seguidores veem seus posts</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrivateAccount(!privateAccount)}
                  className={`w-12 h-6 rounded-full transition relative ${
                    privateAccount ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                    privateAccount ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Status Online</p>
                    <p className="text-xs text-slate-500">Mostrar quando você está online</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                  className={`w-12 h-6 rounded-full transition relative ${
                    showOnlineStatus ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                    showOnlineStatus ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Atividade de Leitura</p>
                    <p className="text-xs text-slate-500">Mostrar quando você visualiza posts</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className={`w-12 h-6 rounded-full transition relative ${
                    showActivity ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                    showActivity ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <button 
                onClick={() => alert('🚫 Blocked Accounts\n\nVocê bloqueou 3 contas:\n\n1. @investidor_fake\n2. @spam_bot_123\n3. @usuario_problema\n\nBlocked accounts não podem:\n• View your posts\n• Follow you\n• Send direct messages\n• Comment on your posts\n\nFuncionalidade completa será implementada em breve! 🚀')}
                className="w-full mt-2 px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <span className="text-sm font-semibold text-slate-900">Blocked accounts</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">3 contas</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              <button 
                onClick={() => alert('🔐 Autenticação em Duas Etapas\n\n✅ Status: Ativa\n\nMétodo configurado:\n• SMS para (11) 98765-****\n\nOpções disponíveis:\n• Alterar método (SMS/App Autenticador)\n• Gerar códigos de backup\n• Desativar 2FA\n• Ver dispositivos confiáveis\n\nTwo-factor authentication adds an extra layer of security to your account.\n\nFuncionalidade completa será implementada em breve! 🚀')}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <span className="text-sm font-semibold text-slate-900">Autenticação em duas etapas</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-semibold">Ativa</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">Gerencie suas notificações</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition ${showSection === 'notifications' ? 'rotate-90' : ''}`} />
          </button>
          
          {showSection === 'notifications' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Notifications Push</p>
                    <p className="text-xs text-slate-500">Receba no celular</p>
                  </div>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`w-12 h-6 rounded-full transition relative ${
                    pushNotifications ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                    pushNotifications ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">E-mail</p>
                    <p className="text-xs text-slate-500">Receba por e-mail</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-12 h-6 rounded-full transition relative ${
                    emailNotifications ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                    emailNotifications ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Alertas de Market</p>
                    <p className="text-xs text-slate-500">Variações de ativos da carteira</p>
                  </div>
                </div>
                <button
                  onClick={() => setMarketAlerts(!marketAlerts)}
                  className={`w-12 h-6 rounded-full transition relative ${
                    marketAlerts ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                    marketAlerts ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Notificar sobre</p>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">Likes</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">Comments</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">Novos seguidores</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">Menções</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-700">Posts de empresas seguidas</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Palette className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900">Appearance</h3>
                <p className="text-xs text-slate-500">Customise the app appearance</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition ${showSection === 'appearance' ? 'rotate-90' : ''}`} />
          </button>
          
          {showSection === 'appearance' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Dark Mode</p>
                    <p className="text-xs text-slate-500">Ativar tema escuro</p>
                  </div>
                </div>
                <button
                  onClick={() => handleLiveThemeChange(liveTheme === 'dark' ? 'light' : 'dark')}
                  className={`w-12 h-6 rounded-full transition relative ${
                    liveTheme === 'dark' ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                    liveTheme === 'dark' ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <button 
                onClick={() => alert('📏 Tamanho da Fonte\n\nEscolha o tamanho de fonte ideal para você:\n\n○ Pequeno\n● Médio (atual)\n○ Grande\n○ Muito Grande\n\nThe change will be applied across the entire app.\n\nFuncionalidade completa será implementada em breve! 🚀')}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <span className="text-sm font-semibold text-slate-900">Tamanho da fonte</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Médio</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              <button 
                onClick={() => onNavigateToLanguageRegion()}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <span className="text-sm font-semibold text-slate-900">{t('settings.language')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{locale.language === 'pt-BR' ? 'Português (BR)' : locale.language === 'en-US' ? 'English (US)' : locale.language === 'es-ES' ? 'Español' : locale.language}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Data & Storage */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection('data')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900">Data & Storage</h3>
                <p className="text-xs text-slate-500">Gerencie seus dados</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition ${showSection === 'data' ? 'rotate-90' : ''}`} />
          </button>
          
          {showSection === 'data' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-3">
              <button 
                onClick={() => alert('📥 Baixar Meus Dados\n\nVocê pode solicitar uma cópia de todos os seus dados:\n\n• Posts and comments\n• Published analyses\n• Messages diretas\n• Profile information\n• Activity history\n• Portfolio de investimentos\n\nProcesso:\n1. Solicitar download\n2. Aguardar processamento (até 48h)\n3. Receber e-mail com link\n4. Download válido por 7 dias\n\nFuncionalidade completa será implementada em breve! 🚀')}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-900">Baixar meus dados</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button 
                onClick={() => {
                  if (window.confirm('🗑️ Limpar Cache\n\nIsso vai liberar 124 MB de espaço.\n\nO cache inclui:\n• Imagens visualizadas\n• Dados temporários\n• Arquivos de mídia\n\nSeus dados e configurações serão mantidos.\n\nDeseja continuar?')) {
                    alert('✅ Cache limpo com sucesso!\n\n124 MB liberados.\n\nO aplicativo pode ficar um pouco mais lento na primeira utilização após limpar o cache.');
                  }
                }}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-slate-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Limpar cache</p>
                    <p className="text-xs text-slate-500">124 MB em cache</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Espaço utilizado</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">450 MB / 1 GB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ajuda e Suporte */}
        <div className="bg-white rounded-2xl shadow-sm">
          <button 
            onClick={() => alert('🆘 Help Centre\n\nComo podemos ajudar você?\n\n📚 Tópicos populares:\n• Como publicar uma análise\n• Gerenciar carteira de investimentos\n• Configurar alertas de preço\n• Privacy e segurança\n• Planos e assinaturas\n\n💬 Suporte:\n• Chat ao vivo (seg-sex 9h-18h)\n• E-mail: suporte@bulls.com\n• FAQ completo\n• Tutoriais em vídeo\n\nFuncionalidade completa será implementada em breve! 🚀')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="font-semibold text-slate-900">Help Centre</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm">
          <button 
            onClick={() => alert('📄 Terms of Use & Privacy\n\nDocumentos legais:\n\n📋 Termos de Uso\n• Última atualização: 01/03/2026\n• Version 2.1\n\n🔒 Política de Privacy\n• Última atualização: 01/03/2026\n• Version 2.1\n\n🍪 Política de Cookies\n• Como usamos cookies\n\n⚖️ Direitos do Usuário\n• LGPD - Lei Geral de Proteção de Dados\n\nFuncionalidade completa será implementada em breve! 🚀')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <span className="font-semibold text-slate-900">Terms of Use & Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Community Guidelines */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Community Guidelines</h3>
              <p className="text-white/90 text-sm">Keep Bulls focused on finance</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToGuidelines}
            className="w-full bg-white text-green-700 px-4 py-3 rounded-xl font-bold hover:bg-white/90 transition flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            View Full Guidelines
          </button>
        </div>

        {/* Sobre */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <div>
              <p className="font-bold text-slate-900">Bulls</p>
              <p className="text-xs text-slate-500">Version 1.0.0 (Build 245)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The social network for investors, companies and financial market enthusiasts. Connect, learn and invest better.
          </p>
        </div>

        {/* Sign out */}
        <button 
          onClick={() => {
            if (window.confirm('Tem certeza que deseja sair?')) {
              onLogout();
            }
          }}
          className="w-full bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center justify-center gap-3 hover:bg-red-50 transition group"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="font-bold text-red-600">Sign out da Account</span>
        </button>

        {/* Delete Account */}
        <button 
          onClick={() => {
            if (window.confirm('⚠️ ATENÇÃO: Delete Account\n\nEsta ação é PERMANENTE e IRREVERSÍVEL!\n\nSe você excluir sua conta:\n\n❌ Todos os seus posts serão deletados\n❌ Suas análises serão removidas\n❌ Seus seguidores serão perdidos\n❌ Seu histórico será apagado\n❌ Suas mensagens serão deletadas\n\nDeseja realmente continuar?')) {
              const confirmText = prompt('Digite "EXCLUIR" em maiúsculas para confirmar:');
              if (confirmText === 'EXCLUIR') {
                alert('🔄 Processando exclusão da conta...\n\nVocê receberá um e-mail de confirmação final.\n\nTem 30 dias para cancelar a exclusão caso mude de ideia.\n\n(Funcionalidade completa será implementada em breve)');
              } else {
                alert('❌ Exclusão cancelada.\n\nSua conta está segura! 🛡️');
              }
            }
          }}
          className="w-full bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-center gap-3 hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-red-600 text-sm">Delete minha conta</span>
        </button>
      </div>
    </div>
  );
};