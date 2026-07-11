import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, FileText, ChevronRight, BarChart3, Palette, Mail, Lock, CreditCard, Eye, Download, Trash2, Crown, Sparkles, Building2, GraduationCap } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { AppearanceSection } from './AppearanceSection';
import { MFAManageScreen } from './MFAManageScreen';

const ChangeEmailModal = ({ currentEmail, onClose }) => {
  const { updateEmail } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newEmail || newEmail === currentEmail) {
      setError('Enter a different email address.');
      return;
    }
    setLoading(true);
    const { error } = await updateEmail(newEmail);
    setLoading(false);
    if (error) setError(error.message || 'Could not update email.');
    else setSent(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <h3 className="font-bold text-slate-900 mb-1">Change Email</h3>
        {sent ? (
          <>
            <p className="text-sm text-slate-600 mb-4">
              We've sent a confirmation link to <strong>{newEmail}</strong>. Click it to finish changing your email.
            </p>
            <button onClick={onClose} className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-xl">Done</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-xs text-slate-500 mb-3">Current: {currentEmail || 'Not set'}</p>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="New email address"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm mb-2 focus:outline-none focus:border-green-500"
              required
            />
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-xl disabled:opacity-50 hover:bg-green-700 transition">
                {loading ? 'Sending...' : 'Send confirmation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose }) => {
  const { signIn, updatePassword, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: signInError } = await signIn(user?.email || '', currentPassword);
    if (signInError) {
      setLoading(false);
      setError('Current password is incorrect.');
      return;
    }
    const { error: updateError } = await updatePassword(newPassword);
    setLoading(false);
    if (updateError) setError(updateError.message || 'Could not update password.');
    else setDone(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5">
        <h3 className="font-bold text-slate-900 mb-1">Change Password</h3>
        {done ? (
          <>
            <p className="text-sm text-slate-600 mb-4">Your password has been updated.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-xl">Done</button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-green-500" required />
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-green-500" required />
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-green-500" required />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-xl disabled:opacity-50 hover:bg-green-700 transition">
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const PLAN_DISPLAY: Record<string, { label: string; color: string; Icon: React.FC<any> }> = {
  free:     { label: 'Free plan',     color: 'text-slate-500',  Icon: CreditCard  },
  premium:  { label: 'Premium',       color: 'text-yellow-600', Icon: Crown       },
  pro:      { label: 'Pro',           color: 'text-purple-600', Icon: Sparkles    },
  business: { label: 'Business',      color: 'text-blue-600',   Icon: Building2   },
};

export const SettingsScreen = ({ onBack, onLogout, onNavigateToPremium, onNavigateToGuidelines, onNavigateToLanguageRegion, onNavigateToCreatorDashboard, onNavigateToAcademy }) => {
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const { currentPlan, isPremium, isPro, isBusiness, subscription } = useSubscription();
  const [showMFAManage, setShowMFAManage] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [gdprLoading, setGdprLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showSection, setShowSection] = useState(null);

  const toggleSection = (section) => {
    setShowSection(showSection === section ? null : section);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {showMFAManage && (
        <MFAManageScreen onClose={() => setShowMFAManage(false)} />
      )}
      {showEmailModal && (
        <ChangeEmailModal currentEmail={user?.email} onClose={() => setShowEmailModal(false)} />
      )}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      <header className="bg-green-600 z-50 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">{t('settings.title')}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">

        {/* Creator Dashboard */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Creator Dashboard</h3>
              <p className="text-white/90 text-sm">Analytics, monetisation and tools</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToCreatorDashboard?.()}
            className="w-full bg-white text-purple-700 px-4 py-3 rounded-xl font-bold hover:bg-white/90 transition flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Open Dashboard
          </button>
        </div>

        {/* Bulls Academy */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Bulls Academy</h3>
              <p className="text-white/90 text-sm">
                {(isPro || isBusiness) ? 'Crie e gerencie cursos e mentorias' : 'Cursos e mentorias de investimento'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToAcademy?.()}
            className="w-full bg-white text-indigo-700 px-4 py-3 rounded-xl font-bold hover:bg-white/90 transition flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-5 h-5" />
            {(isPro || isBusiness) ? 'Abrir Academy' : 'Explorar Cursos'}
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
                onClick={() => setShowEmailModal(true)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Email</p>
                    <p className="text-xs text-slate-500">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Change Password</p>
                    <p className="text-xs text-slate-500">Update your password</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateToPremium()}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const planInfo = PLAN_DISPLAY[currentPlan] ?? PLAN_DISPLAY.free;
                    const PlanIcon = planInfo.Icon;
                    return <PlanIcon className={`w-5 h-5 ${isPremium ? planInfo.color : 'text-slate-400'}`} />;
                  })()}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Subscription</p>
                    {isPremium ? (
                      <p className={`text-xs font-semibold ${PLAN_DISPLAY[currentPlan]?.color ?? 'text-slate-500'}`}>
                        {PLAN_DISPLAY[currentPlan]?.label ?? currentPlan}
                        {subscription?.cancel_at_period_end ? ' · Cancels soon' : ' · Active'}
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-semibold">Upgrade to Premium</p>
                    )}
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
                    <p className="text-sm font-semibold text-slate-900">Private Account</p>
                    <p className="text-xs text-slate-500">Only followers see your posts</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrivateAccount(!privateAccount)}
                  className={`w-12 h-6 rounded-full transition relative ${privateAccount ? 'bg-green-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${privateAccount ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Online Status</p>
                    <p className="text-xs text-slate-500">Show when you're online</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                  className={`w-12 h-6 rounded-full transition relative ${showOnlineStatus ? 'bg-green-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${showOnlineStatus ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              <button
                onClick={() => setShowMFAManage(true)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 font-semibold">Manage</span>
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
                <p className="text-xs text-slate-500">Manage your notifications</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition ${showSection === 'notifications' ? 'rotate-90' : ''}`} />
          </button>

          {showSection === 'notifications' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-4">
              {[
                { label: 'Push Notifications', desc: 'Receive on your device', value: pushNotifications, set: setPushNotifications },
                { label: 'Email Notifications', desc: 'Receive by email', value: emailNotifications, set: setEmailNotifications },
                { label: 'Market Alerts', desc: 'Portfolio asset changes', value: marketAlerts, set: setMarketAlerts },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.value)}
                    className={`w-12 h-6 rounded-full transition relative ${item.value ? 'bg-green-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${item.value ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
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
            <div className="border-t border-slate-100 px-4 py-4">
              <AppearanceSection />
              <button
                onClick={() => onNavigateToLanguageRegion()}
                className="w-full mt-3 px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition"
              >
                <span className="text-sm font-semibold text-slate-900">{t('settings.language')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {locale.language === 'en-US' || locale.language === 'en-IE' ? 'English' : locale.language}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Data & Privacy — GDPR */}
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
                <h3 className="font-bold text-slate-900">Data & Privacy</h3>
                <p className="text-xs text-slate-500">GDPR — Manage your personal data</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition ${showSection === 'data' ? 'rotate-90' : ''}`} />
          </button>

          {showSection === 'data' && (
            <div className="border-t border-slate-100 px-4 py-3 space-y-3">
              <button
                disabled={gdprLoading}
                onClick={async () => {
                  if (!user) return;
                  setGdprLoading(true);
                  try {
                    const { data, error } = await supabase.rpc('export_user_data');
                    if (error) throw error;
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `bulls-my-data-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert('✅ Your data has been downloaded successfully.');
                  } catch (e: any) {
                    alert(`❌ Failed to export data: ${e.message}`);
                  } finally {
                    setGdprLoading(false);
                  }
                }}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl flex items-center justify-between hover:bg-slate-100 transition disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-indigo-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Download My Data</p>
                    <p className="text-xs text-slate-500">Export all your personal data (GDPR Art. 20)</p>
                  </div>
                </div>
                {gdprLoading
                  ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  : <ChevronRight className="w-4 h-4 text-slate-400" />
                }
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-800">
                  🇪🇺 <strong>Your GDPR rights:</strong> You have the right to access, export and delete all your personal data at any time under EU Regulation 2016/679.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Help Centre */}
        <div className="bg-white rounded-2xl shadow-sm">
          <button
            onClick={() => alert('Help Centre coming soon! Email: support@bulls.app')}
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

        {/* Terms */}
        <div className="bg-white rounded-2xl shadow-sm">
          <button
            onClick={() => alert('Terms of Use & Privacy Policy coming soon!')}
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

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">B</div>
            <div>
              <p className="font-bold text-slate-900">Bulls</p>
              <p className="text-xs text-slate-500">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The social network for investors, companies and financial market enthusiasts. Connect, learn and invest better.
          </p>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => { if (window.confirm('Are you sure you want to sign out?')) onLogout(); }}
          className="w-full bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center justify-center gap-3 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="font-bold text-red-600">Sign Out</span>
        </button>

        {/* Delete Account */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="w-full px-4 py-3 flex items-center justify-center gap-3 hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-red-600 text-sm">Delete My Account</span>
          </button>

          {showDeleteConfirm && (
            <div className="border-t border-red-100 p-4 bg-red-50">
              <div className="bg-red-100 border border-red-300 rounded-xl p-3 mb-4">
                <p className="text-sm font-bold text-red-800 mb-1">⚠️ This action is permanent and irreversible</p>
                <p className="text-xs text-red-700">All your posts, messages, portfolio and personal data will be permanently deleted.</p>
              </div>
              <p className="text-xs text-slate-600 mb-2 font-semibold">Type <strong>DELETE</strong> to confirm:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-3 py-2 border-2 border-red-300 rounded-xl text-sm mb-3 focus:outline-none focus:border-red-500"
              />
              <button
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={async () => {
                  if (deleteConfirmText !== 'DELETE') return;
                  if (!window.confirm('Final confirmation: permanently delete your account?')) return;
                  try {
                    await supabase.from('profiles').delete().eq('id', user?.id);
                    await supabase.auth.signOut();
                    window.location.reload();
                  } catch (e) {
                    alert('Error deleting account. Contact support.');
                  }
                }}
                className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                  deleteConfirmText === 'DELETE'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Permanently Delete Account
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
