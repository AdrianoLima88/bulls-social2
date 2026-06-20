import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AtSign } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../../contexts/AuthContext';

export const AuthScreen = ({ onLogin }) => {
  const { t } = useLocale();
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' ou 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        alert(t('auth.passwords_do_not_match'));
        return;
      }
      if (formData.password.length < 6) {
        alert(t('auth.password_min_length'));
        return;
      }
      if (!formData.username) {
        alert('Please fill in your username');
        return;
      }
    }

    if (!formData.email || !formData.password) {
      alert(t('auth.fill_required_fields'));
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.username,
          formData.name
        );

        if (error) {
          alert(error.message || 'Erro ao criar conta');
          return;
        }

        alert('Account created! Please sign in to continue.');
        setMode('login');
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          alert(error.message || 'Email ou senha incorretos');
          return;
        }

        // Login bem-sucedido
        onLogin();
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="text-6xl font-black text-green-600 mb-2">Bulls</h1>
            <p className="text-lg text-slate-600 font-semibold">{t('feed.subtitle')}</p>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-4 font-bold text-lg transition ${
                mode === 'login'
                  ? 'text-green-600 border-b-4 border-green-600 bg-green-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-4 font-bold text-lg transition ${
                mode === 'signup'
                  ? 'text-green-600 border-b-4 border-green-600 bg-green-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('auth.signup')}
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Nome (apenas no cadastro) */}
            {mode === 'signup' && (
              <>
                <div className="mb-6">
                  <label className="block text-slate-700 font-semibold mb-2">
                    {t('auth.full_name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder={t('auth.enter_full_name')}
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-slate-700 font-semibold mb-2">
                    Nome de Usuário
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="@seu_usuario"
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="mb-6">
              <label className="block text-slate-700 font-semibold mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder={t('auth.enter_email')}
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="mb-6">
              <label className="block text-slate-700 font-semibold mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={t('auth.enter_password')}
                  className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-slate-500 mt-2">
                  {t('auth.password_min_length')}
                </p>
              )}
            </div>

            {/* Confirm Senha (apenas no cadastro) */}
            {mode === 'signup' && (
              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-2">
                  {t('auth.confirm_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder={t('auth.confirm_password')}
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Link "Esqueci minha senha" (apenas no login) */}
            {mode === 'login' && (
              <div className="mb-6 text-right">
                <button
                  type="button"
                  className="text-green-600 text-sm font-semibold hover:text-green-700"
                >
                  {t('auth.forgot_password')}
                </button>
              </div>
            )}

            {/* Termos (apenas no cadastro) */}
            {mode === 'signup' && (
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-green-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-green-600"
                    required
                  />
                  <span className="text-sm text-slate-600">
                    {t('auth.agree_terms')}
                    {' '}e{' '}
                    <button type="button" className="text-green-600 font-semibold hover:underline">
                      {t('auth.privacy_policy')}
                    </button>
                  </span>
                </label>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? t('auth.login_button') : t('auth.signup_button')}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="px-8 pb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">
                  {t('auth.continue_with')}
                </span>
              </div>
            </div>
          </div>

          {/* Botões Sociais */}
          <div className="px-8 pb-8 space-y-3">
            <button
              type="button"
              className="w-full bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button
              type="button"
              className="w-full bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            <button
              type="button"
              className="w-full bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              Apple
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8">
          © 2026 Bulls. {t('auth.rights_reserved')}.
        </p>
      </div>
    </div>
  );
};