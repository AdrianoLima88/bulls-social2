import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface MFAVerifyScreenProps {
  onVerified: () => void;
  onBack: () => void;
}

export const MFAVerifyScreen: React.FC<MFAVerifyScreenProps> = ({ onVerified, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];

    if (value.length > 1) {
      // Handle paste
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
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        setError('No MFA factor found. Please contact support.');
        return;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        setError(challengeError.message);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code: fullCode,
      });

      if (verifyError) {
        setError('Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      onVerified();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = code.every(d => d !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bulls</h1>
          <p className="text-green-100">The Social Network for Investors</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Two-Factor Auth</h2>
              <p className="text-sm text-slate-500">Enter the code from your authenticator app</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-5" />

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center mb-6">
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
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition focus:outline-none
                  ${digit
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                  }
                  focus:border-green-500 focus:bg-green-50`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || !isComplete}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>

          {/* Back */}
          <button
            onClick={onBack}
            className="w-full mt-3 py-3 text-slate-500 rounded-xl font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>

        <p className="text-center text-green-100 text-sm mt-6">
          Open your authenticator app to get the code
        </p>
      </div>
    </div>
  );
};
