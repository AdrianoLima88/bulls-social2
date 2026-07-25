import React, { useState } from 'react';
import { Mail, Lock, User, AtSign, Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ─── Logo SVG — bull head matching reference image ─── */
const BullsGoLogo = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lime-green outer rounded square */}
    <rect width="200" height="200" rx="44" fill="#6dbf3e"/>
    {/* Dark teal inner square */}
    <rect x="14" y="14" width="172" height="172" rx="30" fill="#1b4d3e"/>

    {/* ── LEFT HORN ── thick arc sweeping up-left */}
    <path d="M 80 82
             C 72 70 52 46 36 26
             C 52 22 68 50 78 78 Z"
          fill="white"/>

    {/* ── RIGHT HORN ── mirror */}
    <path d="M 120 82
             C 128 70 148 46 164 26
             C 148 22 132 50 122 78 Z"
          fill="white"/>

    {/* ── FACE ── lime-green geometric bull head */}
    <path d="M 76 80
             Q 65 93 70 110
             L 74 138
             Q 81 160 100 163
             Q 119 160 126 138
             L 130 110
             Q 135 93 124 80
             Q 113 65 100 63
             Q 87 65 76 80 Z"
          fill="#7dc42a"/>

    {/* ── DIAGONAL DARK SLASH ── dynamic angular stripe */}
    <path d="M 76 92 L 122 75 L 126 100 L 80 120 Z"
          fill="#1b4d3e"/>

    {/* ── SNOUT ── dark oval */}
    <ellipse cx="100" cy="147" rx="28" ry="19" fill="#163d30"/>

    {/* ── LEFT NOSTRIL ── */}
    <ellipse cx="87" cy="149" rx="9" ry="10" fill="#0c2920"/>

    {/* ── RIGHT NOSTRIL ── */}
    <ellipse cx="113" cy="149" rx="9" ry="10" fill="#0c2920"/>
  </svg>
);

/* ─── Reusable input ─── */
const Field = ({
  label, icon: Icon, right, type = 'text', value, onChange, placeholder, required, minLength, autoComplete
}: any) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9CA3AF', flexShrink: 0 }} />
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required} minLength={minLength} autoComplete={autoComplete}
        style={{
          width: '100%', boxSizing: 'border-box',
          paddingLeft: 44, paddingRight: right ? 44 : 14,
          paddingTop: 14, paddingBottom: 14,
          background: '#F9FAFB', border: '1.5px solid #E5E7EB',
          borderRadius: 12, fontSize: 15, color: '#111827',
          outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
      />
      {right && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          {right}
        </div>
      )}
    </div>
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
        else setInfo('Reset link sent! Check your inbox.');
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message || 'Incorrect email or password');
      } else {
        if (!username.startsWith('@')) { setError('Username must start with @'); setLoading(false); return; }
        const { error } = await signUp(email, password, username, name);
        if (error) setError(error.message || 'Failed to create account');
        else setInfo('Account created! Check your inbox if confirmation is needed.');
      }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const BASE: React.CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(175deg, #14532d 0%, #166534 50%, #15803d 100%)',
  };

  return (
    <div style={BASE}>

      {/* ── Decorative background ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 100, left: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(134,239,172,0.12) 0%, transparent 70%)' }} />
        <svg style={{ position: 'absolute', bottom: '45%', width: '100%', opacity: 0.06 }} height="50" viewBox="0 0 390 50" preserveAspectRatio="none">
          <polyline points="0,38 55,22 110,32 165,10 220,20 275,6 330,16 390,12" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* ── Hero / Logo section ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 52, paddingBottom: 44, paddingLeft: 24, paddingRight: 24 }}>

        {/* Logo with glow */}
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <BullsGoLogo size={88} />
          <div style={{ position: 'absolute', inset: -8, borderRadius: 52, background: 'radial-gradient(circle, rgba(109,191,62,0.35) 0%, transparent 70%)', zIndex: -1 }} />
        </div>

        <h1 style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          BullsGo
        </h1>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: '#86efac', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          The Social Network for Investors
        </p>

        {/* Glassmorphism chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {[
            { dot: true, label: 'Live Markets' },
            { label: '📈 Portfolio Tracker' },
          ].map(({ dot, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'block' }} />}
              <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── White form card ── */}
      <div style={{
        position: 'relative', zIndex: 1, flex: 1,
        background: '#ffffff',
        borderRadius: '28px 28px 0 0',
        padding: '28px 24px 36px',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
      }}>

        {mode === 'forgot' ? (
          <>
            <button
              onClick={() => switchMode('login')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 20, fontFamily: 'inherit' }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} /> Back to login
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#111827' }}>Reset Password</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280' }}>Enter your email and we'll send you a reset link.</p>
          </>
        ) : (
          <>
            {/* ── Segmented control ── */}
            <div style={{
              display: 'flex', background: '#F3F4F6', borderRadius: 14,
              padding: 4, marginBottom: 24,
            }}>
              {(['login', 'register'] as const).map(m => (
                <button key={m} onClick={() => switchMode(m)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 11,
                  border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  background: mode === m ? '#ffffff' : 'transparent',
                  color: mode === m ? '#111827' : '#6B7280',
                  boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,0.10)' : 'none',
                }}>
                  {m === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 22 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {mode === 'login' ? 'Welcome back 👋' : 'Join BullsGo 🚀'}
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
                {mode === 'login' ? 'Sign in to your BullsGo account' : 'Connect, learn and invest better'}
              </p>
            </div>
          </>
        )}

        {/* Alert boxes */}
        {error && (
          <div style={{ marginBottom: 16, padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, color: '#DC2626', lineHeight: 1.45 }}>{error}</p>
          </div>
        )}
        {info && (
          <div style={{ marginBottom: 16, padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
            <p style={{ margin: 0, fontSize: 13, color: '#15803d', lineHeight: 1.45 }}>{info}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <Field label="Full Name" icon={User} type="text" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="John Doe" required autoComplete="name" />
              <Field label="Username" icon={AtSign} type="text" value={username}
                onChange={(e: any) => { let v = e.target.value; if (!v.startsWith('@')) v = '@' + v; setUsername(v); }}
                placeholder="@username" required autoComplete="username" />
            </>
          )}

          <Field label="Email" icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email" />

          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('forgot')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#16a34a', padding: 0, fontFamily: 'inherit' }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9CA3AF' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 44, paddingRight: 44, paddingTop: 14, paddingBottom: 14,
                    background: '#F9FAFB', border: '1.5px solid #E5E7EB',
                    borderRadius: 12, fontSize: 15, color: '#111827',
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
                  {showPwd ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {mode === 'register' && <p style={{ margin: '4px 0 0 2px', fontSize: 12, color: '#9CA3AF' }}>Minimum 6 characters</p>}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 4,
              width: '100%', padding: '15px 0', borderRadius: 14,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#D1FAE5' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
              color: loading ? '#6B7280' : '#ffffff',
              fontSize: 16, fontWeight: 800, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 6px 20px rgba(22,163,74,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '2.5px solid #9CA3AF', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Please wait…
              </>
            ) : (
              <>
                {mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                <ArrowRight style={{ width: 18, height: 18 }} />
              </>
            )}
          </button>
        </form>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginTop: 20, marginBottom: 0 }}>
            Don't have an account?{' '}
            <button onClick={() => switchMode('register')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontWeight: 800, fontSize: 14, padding: 0, fontFamily: 'inherit' }}>
              Sign up free
            </button>
          </p>
        )}
        {mode === 'register' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 16, marginBottom: 0, lineHeight: 1.6, padding: '0 8px' }}>
            By signing up you agree to our{' '}
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Terms of Use</span>
            {' '}and{' '}
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Privacy Policy</span>
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
