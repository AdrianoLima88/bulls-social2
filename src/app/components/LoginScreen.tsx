import React, { useState } from 'react';
import { Mail, Lock, User, AtSign, Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// BullsGo Bull Logo
const BullLogo = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 60 54" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left horn */}
    <path d="M17 25C17 25 6 19 7 7C10 0 19 4 19 4C19 4 14 13 18 23L17 25Z" fill="white"/>
    {/* Right horn */}
    <path d="M43 25C43 25 54 19 53 7C50 0 41 4 41 4C41 4 46 13 42 23L43 25Z" fill="white"/>
    {/* Ear left */}
    <ellipse cx="12" cy="31" rx="4.5" ry="5.5" fill="white"/>
    {/* Ear right */}
    <ellipse cx="48" cy="31" rx="4.5" ry="5.5" fill="white"/>
    {/* Head */}
    <ellipse cx="30" cy="37" rx="19" ry="15" fill="white"/>
    {/* Snout */}
    <ellipse cx="30" cy="46" rx="11" ry="7" fill="#bbf7d0"/>
    {/* Eyes */}
    <circle cx="22" cy="33" r="3.5" fill="#15803d"/>
    <circle cx="38" cy="33" r="3.5" fill="#15803d"/>
    {/* Eye shine */}
    <circle cx="23.4" cy="31.6" r="1.4" fill="white"/>
    <circle cx="39.4" cy="31.6" r="1.4" fill="white"/>
    {/* Nostrils */}
    <ellipse cx="26" cy="47" rx="2.8" ry="2.2" fill="#15803d"/>
    <ellipse cx="34" cy="47" rx="2.8" ry="2.2" fill="#15803d"/>
  </svg>
);

const InputField = ({ icon: Icon, ...props }: any) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
    <input
      {...props}
      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-400 text-sm"
    />
  </div>
);

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, resetPasswordForEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next); setError(null); setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error } = await resetPasswordForEmail(email);
        if (error) setError(error.message || 'Could not send reset link');
        else setInfo("Reset link sent! Check your inbox.");
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message || 'Failed to login');
      } else {
        if (!username.startsWith('@')) { setError('Username must start with @'); setLoading(false); return; }
        const { error } = await signUp(email, password, username, name);
        if (error) setError(error.message || 'Failed to create account');
        else setInfo("Account created! Check your inbox if confirmation is needed.");
      }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #052e16 0%, #14532d 45%, #166534 100%)' }}>

      {/* Decorative bg elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.15), transparent 70%)' }} />
        <div className="absolute top-36 -left-16 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(134,239,172,0.1), transparent 70%)' }} />
        <svg className="absolute bottom-56 w-full opacity-5" height="60" viewBox="0 0 390 60" preserveAspectRatio="none">
          <polyline points="0,45 60,30 120,40 180,15 240,28 300,10 360,22 390,18" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Hero top section */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-10 px-6">
        {/* Logo */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, #22c55e, #16a34a, #15803d)', boxShadow: '0 16px 48px rgba(22,163,74,0.45), 0 0 0 1px rgba(255,255,255,0.08)' }}>
            <BullLogo className="w-16 h-14" />
          </div>
          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 -z-10 scale-125"
            style={{ background: 'linear-gradient(145deg, #4ade80, #16a34a)' }} />
        </div>

        <h1 className="text-4xl font-black text-white tracking-tight mb-1 drop-shadow-lg">BullsGo</h1>
        <p className="text-green-300 text-sm font-medium tracking-widest uppercase">The Social Network for Investors</p>

        {/* Floating badges */}
        <div className="flex gap-3 mt-5">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-white/10" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse block" />
            <span className="text-white/75 text-xs font-medium">Live Markets</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-white/10" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
            <span className="text-green-400 text-xs">📈</span>
            <span className="text-white/75 text-xs font-medium">Portfolio Tracker</span>
          </div>
        </div>
      </div>

      {/* White card - grows to fill remaining space */}
      <div className="relative z-10 flex-1 bg-white rounded-t-3xl shadow-2xl px-6 pt-8 pb-10" style={{ minHeight: 0 }}>

        {mode === 'forgot' ? (
          <>
            <button onClick={() => switchMode('login')} className="flex items-center gap-1 text-green-600 font-semibold text-sm mb-5 -ml-1">
              <ChevronLeft className="w-4 h-4" /> Back to login
            </button>
            <h2 className="text-2xl font-black text-slate-900">Reset Password</h2>
            <p className="text-slate-500 text-sm mt-1 mb-6">Enter your email and we'll send a link to reset it.</p>
          </>
        ) : (
          <>
            {/* Pill tab switcher */}
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
              {(['login', 'register'] as const).map(m => (
                <button key={m} onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {m === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            <div className="mb-5">
              {mode === 'login' ? (
                <><h2 className="text-2xl font-black text-slate-900">Welcome back 👋</h2>
                <p className="text-slate-500 text-sm mt-0.5">Sign in to your BullsGo account</p></>
              ) : (
                <><h2 className="text-2xl font-black text-slate-900">Join BullsGo 🚀</h2>
                <p className="text-slate-500 text-sm mt-0.5">Connect, learn and invest better</p></>
              )}
            </div>
          </>
        )}

        {/* Alert boxes */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <p className="text-red-600 text-sm leading-snug">{error}</p>
          </div>
        )}
        {info && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">✅</span>
            <p className="text-green-700 text-sm leading-snug">{info}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <InputField icon={User} type="text" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                <InputField icon={AtSign} type="text" value={username}
                  onChange={(e: any) => { let v = e.target.value; if (!v.startsWith('@')) v = '@' + v; setUsername(v); }}
                  placeholder="@username" required />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
            <InputField icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-green-600 font-bold hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 text-slate-900 placeholder-slate-400 text-sm"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'register' && <p className="text-xs text-slate-400 mt-1 ml-1">Minimum 6 characters</p>}
            </div>
          )}

          {/* Submit button */}
          <div className="pt-1">
            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(22, 163, 74, 0.40)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {mode === 'login' && (
          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <button onClick={() => switchMode('register')} className="text-green-600 font-black hover:underline">
              Sign up free
            </button>
          </p>
        )}
        {mode === 'register' && (
          <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed px-2">
            By signing up, you agree to our{' '}
            <span className="text-green-600 font-semibold">Terms of Use</span>
            {' '}and{' '}
            <span className="text-green-600 font-semibold">Privacy Policy</span>
          </p>
        )}
      </div>
    </div>
  );
};
