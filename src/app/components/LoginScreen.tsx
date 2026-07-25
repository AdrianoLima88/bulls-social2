import React, { useState } from 'react';
import { Mail, Lock, User, AtSign, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BullsGoLogo = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lime green outer */}
    <rect width="200" height="200" rx="44" fill="#5ab82e"/>
    {/* Dark inner — same as app header color */}
    <rect x="12" y="12" width="176" height="176" rx="30" fill="#14532d"/>

    {/* ── Bold Letter B ── */}

    {/* White outer B shape */}
    <path
      d="M 44 30 L 118 30 Q 160 30 160 65 Q 160 98 118 100 Q 162 104 162 140 Q 162 174 118 174 L 44 174 Z"
      fill="white"
    />

    {/* Top bowl cutout (dark) */}
    <path
      d="M 72 50 L 112 50 Q 136 50 136 65 Q 136 84 112 84 L 72 84 Z"
      fill="#14532d"
    />

    {/* Bottom bowl cutout (dark) — slightly larger than top */}
    <path
      d="M 72 106 L 116 106 Q 142 106 142 140 Q 142 158 116 158 L 72 158 Z"
      fill="#14532d"
    />

    {/* Lime green spine */}
    <rect x="44" y="30" width="28" height="144" fill="#5ab82e"/>
  </svg>
);

interface FieldProps {
  label: string;
  icon: React.FC<any>;
  right?: React.ReactNode;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

const Field: React.FC<FieldProps> = ({
  label, icon: Icon, right, type = 'text', value, onChange, placeholder, required, minLength, autoComplete,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        color: '#6B7280',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 18,
          height: 18,
          color: focused ? '#16a34a' : '#9CA3AF',
          transition: 'color 0.15s',
        }} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box' as const,
            paddingLeft: 44,
            paddingRight: right ? 48 : 16,
            paddingTop: 14,
            paddingBottom: 14,
            background: focused ? '#ffffff' : '#F9FAFB',
            border: focused ? '1.5px solid #16a34a' : '1.5px solid #E5E7EB',
            borderRadius: 12,
            fontSize: 15,
            color: '#111827',
            outline: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(22,163,74,0.12)' : 'none',
            transition: 'all 0.15s ease',
          }}
        />
        {right && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            {right}
          </div>
        )}
      </div>
    </div>
  );
};

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, resetPasswordForEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

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
        else setInfoMessage("If that email exists, we've sent a password reset link.");
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message || 'Failed to login');
      } else {
        if (!username.startsWith('@')) {
          setError('Username must start with @');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username, name);
        if (error) setError(error.message || 'Failed to create account');
        else setInfoMessage("Account created! Check your inbox to confirm your email.");
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  /* ── Tab styles — active matches the Login button gradient ── */
  const activeTabStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 0',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
    transition: 'all 0.2s ease',
  };
  const inactiveTabStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 0',
    background: 'transparent',
    color: '#6B7280',
    fontWeight: 600,
    fontSize: 15,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F1F5F9',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(175deg, #14532d 0%, #166534 50%, #15803d 100%)',
        padding: '52px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <BullsGoLogo size={84} />
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
            BullsGo
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>
            The Social Network for Investors
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
          {['📈 Stocks', '₿ Crypto', '🏦 ETFs'].map(chip => (
            <span key={chip} style={{
              padding: '5px 14px',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 999,
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
            }}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* ── WHITE CARD ── */}
      <div style={{
        background: '#ffffff',
        flex: 1,
        borderRadius: '28px 28px 0 0',
        marginTop: -36,
        padding: '28px 24px 40px',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.10)',
      }}>

        {mode === 'forgot' ? (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
              Reset your password
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
              Enter your email and we'll send a reset link.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            background: '#F3F4F6',
            borderRadius: 14,
            padding: 4,
            marginBottom: 24,
          }}>
            <button onClick={() => switchMode('login')} style={mode === 'login' ? activeTabStyle : inactiveTabStyle}>
              Login
            </button>
            <button onClick={() => switchMode('register')} style={mode === 'register' ? activeTabStyle : inactiveTabStyle}>
              Register
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
          }}>
            <p style={{ color: '#DC2626', fontSize: 14, margin: 0 }}>{error}</p>
          </div>
        )}

        {infoMessage && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
          }}>
            <p style={{ color: '#15803d', fontSize: 14, margin: 0 }}>{infoMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <>
              <Field
                label="Full Name"
                icon={User}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoComplete="name"
              />
              <Field
                label="Username"
                icon={AtSign}
                type="text"
                value={username}
                onChange={e => {
                  let v = e.target.value;
                  if (!v.startsWith('@')) v = '@' + v;
                  setUsername(v);
                }}
                placeholder="@username"
                required
                autoComplete="username"
              />
            </>
          )}

          <Field
            label="Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />

          {mode !== 'forgot' && (
            <div>
              <Field
                label="Password"
                icon={Lock}
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}
                  >
                    {showPwd
                      ? <EyeOff style={{ width: 18, height: 18 }} />
                      : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                }
              />
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  style={{
                    marginTop: 6,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#16a34a',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Forgot password?
                </button>
              )}
              {mode === 'register' && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                  Minimum 6 characters
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 0',
              background: loading
                ? '#9CA3AF'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              borderRadius: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(22,163,74,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
              transition: 'all 0.2s ease',
            }}
          >
            {loading && (
              <span style={{
                width: 18,
                height: 18,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
            )}
            {loading
              ? 'Please wait…'
              : mode === 'login'
                ? 'Login →'
                : mode === 'register'
                  ? 'Create Account'
                  : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginTop: 20, marginBottom: 0 }}>
            Don't have an account?{' '}
            <button
              onClick={() => switchMode('register')}
              style={{ background: 'none', border: 'none', padding: 0, color: '#16a34a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Sign up
            </button>
          </p>
        )}

        {mode === 'forgot' && (
          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginTop: 20, marginBottom: 0 }}>
            <button
              onClick={() => switchMode('login')}
              style={{ background: 'none', border: 'none', padding: 0, color: '#16a34a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              ← Back to login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
