import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Copy, CheckCircle, ArrowLeft, Loader2, X, ShieldOff, Key, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface MFAManageScreenProps {
  onClose: () => void;
}

type View = 'loading' | 'status' | 'setup_scan' | 'setup_verify' | 'setup_success' | 'recovery_codes' | 'disable_confirm';

export const MFAManageScreen: React.FC<MFAManageScreenProps> = ({ onClose }) => {
  const [view, setView] = useState<View>('loading');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [recoveryCodes] = useState<string[]>([
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    `BULLS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  ]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.find(f => f.status === 'verified');
      if (verified) {
        setMfaEnabled(true);
        setFactorId(verified.id);
      }
      setView('status');
    } catch {
      setView('status');
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Bulls Authenticator',
      });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setView('setup_scan');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      digits.forEach((d, i) => { if (index + i < 6) newCode[index + i] = d; });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: fullCode,
      });
      if (verifyError) throw verifyError;
      setView('setup_success');
      setMfaEnabled(true);
    } catch {
      setError('Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setMfaEnabled(false);
      setFactorId('');
      setView('status');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyOne = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isComplete = code.every(d => d !== '');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Two-Factor Auth</h2>
              <p className="text-xs text-slate-500">
                {mfaEnabled ? '🟢 Active' : '🔴 Inactive'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Loading */}
        {view === 'loading' && (
          <div className="p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-slate-500 text-sm">Checking status...</p>
          </div>
        )}

        {/* Status View */}
        {view === 'status' && (
          <div className="p-6 space-y-4">
            {/* Status Card */}
            <div className={`rounded-2xl p-4 ${mfaEnabled ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mfaEnabled ? 'bg-green-600' : 'bg-slate-400'}`}>
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-bold ${mfaEnabled ? 'text-green-800' : 'text-slate-700'}`}>
                    {mfaEnabled ? '2FA is Active' : '2FA is Inactive'}
                  </p>
                  <p className={`text-xs ${mfaEnabled ? 'text-green-600' : 'text-slate-500'}`}>
                    {mfaEnabled
                      ? 'Your account is protected with an authenticator app'
                      : 'Enable 2FA for extra account security'}
                  </p>
                </div>
              </div>
            </div>

            {/* Enable Button */}
            {!mfaEnabled && (
              <button
                onClick={handleEnroll}
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Enable 2FA
              </button>
            )}

            {/* Recovery Codes Button */}
            {mfaEnabled && (
              <button
                onClick={() => setView('recovery_codes')}
                className="w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200"
              >
                <Key className="w-4 h-4" />
                View Recovery Codes
              </button>
            )}

            {/* Disable Button */}
            {mfaEnabled && (
              <button
                onClick={() => setView('disable_confirm')}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2 border border-red-200"
              >
                <ShieldOff className="w-4 h-4" />
                Disable 2FA
              </button>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800">
                <strong>⚠️ Important:</strong> If you lose access to your authenticator app and don't have recovery codes, you won't be able to sign in. Save your recovery codes in a safe place.
              </p>
            </div>
          </div>
        )}

        {/* Setup - Scan QR */}
        {view === 'setup_scan' && (
          <div className="p-6 space-y-5">
            <p className="text-slate-600 text-sm text-center">
              Scan this QR code with your authenticator app
              <br /><span className="text-slate-400 text-xs">(Google Authenticator, Authy, etc.)</span>
            </p>

            {qrCode && (
              <div className="flex justify-center">
                <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {secret && (
              <div>
                <p className="text-xs text-slate-500 text-center mb-2">Can't scan? Enter this code manually:</p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <code className="flex-1 text-xs text-slate-700 font-mono break-all">
                    {showSecret ? secret : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button onClick={() => setShowSecret(!showSecret)} className="shrink-0 w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition">
                    {showSecret ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="shrink-0 w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition">
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => { setView('setup_verify'); setError(null); setTimeout(() => inputRefs.current[0]?.focus(), 100); }}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              I've scanned it → Continue
            </button>
          </div>
        )}

        {/* Setup - Verify Code */}
        {view === 'setup_verify' && (
          <div className="p-6 space-y-5">
            <p className="text-slate-600 text-sm text-center">
              Enter the 6-digit code from your authenticator app
            </p>

            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition focus:outline-none
                    ${digit ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-800'}
                    focus:border-green-500 focus:bg-green-50`}
                />
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || !isComplete}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Enable 2FA'}
            </button>

            <button
              onClick={() => { setView('setup_scan'); setError(null); }}
              className="w-full py-2 text-slate-500 text-sm rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}

        {/* Setup Success */}
        {view === 'setup_success' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">2FA Enabled!</h3>
                <p className="text-slate-500 text-sm">Your account is now protected. Save your recovery codes in case you lose access to your authenticator.</p>
              </div>
            </div>

            <button
              onClick={() => setView('recovery_codes')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              View & Save Recovery Codes
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Done
            </button>
          </div>
        )}

        {/* Recovery Codes */}
        {view === 'recovery_codes' && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Recovery Codes</h3>
              <p className="text-xs text-slate-500">Save these codes somewhere safe. Each code can only be used once to access your account if you lose your authenticator.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              {recoveryCodes.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <code className="text-sm font-mono text-slate-700">{c}</code>
                  <button
                    onClick={() => copyOne(c)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition"
                  >
                    {copiedCode === c
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      : <Copy className="w-3.5 h-3.5 text-slate-400" />
                    }
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800">
                <strong>⚠️ Warning:</strong> These codes will only be shown once. Copy and store them in a password manager or secure location.
              </p>
            </div>

            <button
              onClick={copyAll}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy All Codes</>}
            </button>

            <button
              onClick={() => setView('status')}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}

        {/* Disable Confirm */}
        {view === 'disable_confirm' && (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Disable 2FA?</h3>
              <p className="text-sm text-slate-500">
                This will remove two-factor authentication from your account. Your account will be less secure.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-700">
                <strong>⚠️ Warning:</strong> Anyone with your password will be able to access your account without a second verification step.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleDisable}
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Disabling...</> : <><ShieldOff className="w-4 h-4" /> Yes, Disable 2FA</>}
            </button>

            <button
              onClick={() => { setView('status'); setError(null); }}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
