import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Copy, CheckCircle, ArrowLeft, Loader2, X } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface MFASetupScreenProps {
  onClose: () => void;
  onEnabled: () => void;
}

type Step = 'loading' | 'scan' | 'verify' | 'success';

export const MFASetupScreen: React.FC<MFASetupScreenProps> = ({ onClose, onEnabled }) => {
  const [step, setStep] = useState<Step>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Bulls Authenticator',
      });

      if (error) {
        setError(error.message);
        setStep('scan');
        return;
      }

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('scan');
    } catch {
      setError('Failed to set up MFA. Please try again.');
      setStep('scan');
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];

    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (index + i < 6) newCode[index + i] = d;
      });
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
    if (fullCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        setError(challengeError.message);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: fullCode,
      });

      if (verifyError) {
        setError('Invalid code. Please check your authenticator app.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      setStep('success');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isComplete = code.every(d => d !== '');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Set Up 2FA</h2>
              <p className="text-xs text-slate-500">Authenticator App (TOTP)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Loading */}
        {step === 'loading' && (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-slate-500 text-sm">Generating QR code...</p>
          </div>
        )}

        {/* Scan Step */}
        {step === 'scan' && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-slate-600 text-sm">
                Scan this QR code with your authenticator app
                <br />
                <span className="text-slate-400 text-xs">(Google Authenticator, Authy, etc.)</span>
              </p>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="flex justify-center">
                <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {/* Manual Secret */}
            {secret && (
              <div>
                <p className="text-xs text-slate-500 text-center mb-2">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <code className="flex-1 text-xs text-slate-700 font-mono break-all">{secret}</code>
                  <button
                    onClick={copySecret}
                    className="shrink-0 w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition"
                  >
                    {copied
                      ? <CheckCircle className="w-4 h-4 text-green-600" />
                      : <Copy className="w-4 h-4 text-slate-500" />
                    }
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={() => {
                setStep('verify');
                setError(null);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
              }}
              disabled={!qrCode}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              I've scanned it → Continue
            </button>
          </div>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-slate-600 text-sm">
                Enter the 6-digit code from your authenticator app to confirm setup
              </p>
            </div>

            {/* OTP Inputs */}
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
                    ${digit
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                    }
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
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                'Enable 2FA'
              )}
            </button>

            <button
              onClick={() => { setStep('scan'); setError(null); }}
              className="w-full py-2 text-slate-500 text-sm rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">2FA Enabled!</h3>
              <p className="text-slate-500 text-sm">
                Your account is now protected with two-factor authentication.
                You'll need your authenticator app each time you log in.
              </p>
            </div>
            <button
              onClick={onEnabled}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
