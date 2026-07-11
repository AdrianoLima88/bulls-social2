import React, { useState } from 'react';
import { TrendingUp, Mail, Lock, User, AtSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, resetPasswordForEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next);
    setError(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPasswordForEmail(email);
        if (error) setError(error.message || 'Could not send reset link');
        else setInfoMessage("If that email exists, we've sent a password reset link to it.");
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message || 'Failed to login');
        // MFA é tratado automaticamente pelo AuthContext + App.tsx
      } else {
        if (!username.startsWith('@')) {
          setError('Username must start with @');
          return;
        }
        const { error } = await signUp(email, password, username, name);
        if (error) setError(error.message || 'Failed to create account');
        else setInfoMessage('Account created! If email confirmation is required, check your inbox — otherwise you\'ll be redirected automatically.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bulls</h1>
          <p className="text-green-100">The Social Network for Investors</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {mode === 'forgot' ? (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Reset your password</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your email and we'll send you a reset link.</p>
            </div>
          ) : (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  mode === 'login' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  mode === 'register' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm">{infoMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe" required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text" value={username}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (!value.startsWith('@')) value = '@' + value;
                        setUsername(value);
                      }}
                      placeholder="@username" required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {mode === 'register' && (
                  <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                )}
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-green-600 font-semibold hover:underline mt-1.5"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Send reset link'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-sm text-slate-500 mt-4">
              Don't have an account?{' '}
              <button onClick={() => switchMode('register')} className="text-green-600 font-semibold hover:underline">
                Sign up
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p className="text-center text-sm text-slate-500 mt-4">
              <button onClick={() => switchMode('login')} className="text-green-600 font-semibold hover:underline">
                Back to login
              </button>
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-green-100 text-sm">
            {mode === 'register' ? 'Create your account to start investing socially' : mode === 'forgot' ? 'We\'ll help you get back in' : 'Welcome back to Bulls'}
          </p>
        </div>
      </div>
    </div>
  );
};
