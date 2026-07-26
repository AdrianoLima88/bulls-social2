import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

const STORAGE_KEY = 'bullsCookieConsent';

type ConsentLevel = 'all' | 'essential' | null;

interface ConsentData {
  level: ConsentLevel;
  timestamp: number;
  region: string;
}

function getSavedConsent(): ConsentData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentData;
  } catch {
    return null;
  }
}

function saveConsent(level: ConsentLevel, region: string) {
  const data: ConsentData = { level, timestamp: Date.now(), region };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// Region-aware copy
const REGION_CONFIG: Record<string, {
  law: string;
  title: string;
  body: string;
  showReject: boolean;
  showCustomize: boolean;
}> = {
  EU: {
    law: 'GDPR',
    title: 'We use cookies',
    body: 'Under the EU General Data Protection Regulation (GDPR), we need your consent to use cookies and similar technologies. Essential cookies keep the app running. Analytics and marketing cookies help us improve your experience.',
    showReject: true,
    showCustomize: true,
  },
  UK: {
    law: 'UK GDPR',
    title: 'We use cookies',
    body: 'Under UK GDPR, we need your consent to use cookies. Essential cookies are required for the app to function. You may decline non-essential cookies without affecting core features.',
    showReject: true,
    showCustomize: true,
  },
  BR: {
    law: 'LGPD',
    title: 'Usamos cookies',
    body: 'De acordo com a Lei Geral de Proteção de Dados (LGPD), precisamos do seu consentimento para usar cookies. Cookies essenciais são necessários para o funcionamento do app. Você pode recusar os não essenciais.',
    showReject: true,
    showCustomize: false,
  },
  US: {
    law: 'CCPA',
    title: 'Cookie notice',
    body: 'We use cookies to improve your experience. California residents have the right to opt out of the sale of personal information. See our Privacy Policy for details.',
    showReject: false,
    showCustomize: false,
  },
  default: {
    law: '',
    title: 'We use cookies',
    body: 'We use essential cookies to keep the app running and optional cookies to improve your experience. By continuing, you accept our use of cookies.',
    showReject: false,
    showCustomize: false,
  },
};

export const CookieConsentBanner: React.FC = () => {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const saved = getSavedConsent();
    if (!saved) setVisible(true);
  }, []);

  if (!visible) return null;

  const config = REGION_CONFIG[locale.region] ?? REGION_CONFIG['default'];

  const handleAcceptAll = () => {
    saveConsent('all', locale.region);
    setVisible(false);
  };

  const handleRejectNonEssential = () => {
    saveConsent('essential', locale.region);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-20 sm:pb-4 sm:p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cookie className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">{config.title}</span>
            {config.law && (
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {config.law}
              </span>
            )}
          </div>
          <button
            onClick={handleRejectNonEssential}
            className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p className="text-sm text-slate-600 leading-relaxed">{config.body}</p>

          {/* Details toggle (GDPR/UK) */}
          {config.showCustomize && (
            <button
              onClick={() => setShowDetails(v => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-green-600 font-semibold hover:underline"
            >
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showDetails ? 'Hide details' : 'Show cookie categories'}
            </button>
          )}

          {showDetails && (
            <div className="mt-3 space-y-2">
              {[
                { name: 'Essential', desc: 'Authentication, security, and core app functions. Cannot be disabled.', required: true },
                { name: 'Analytics', desc: 'Anonymous usage data to improve the app experience.', required: false },
                { name: 'Marketing', desc: 'Personalised content and targeted features based on your activity.', required: false },
              ].map(cat => (
                <div key={cat.name} className="flex items-start justify-between gap-3 py-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                    <p className="text-xs text-slate-500">{cat.desc}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${cat.required ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {cat.required ? 'Always on' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-2 flex-wrap">
          <button
            onClick={handleAcceptAll}
            className="flex-1 min-w-[120px] py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition"
          >
            Accept all
          </button>
          {config.showReject && (
            <button
              onClick={handleRejectNonEssential}
              className="flex-1 min-w-[120px] py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              Essential only
            </button>
          )}
          <a
            href="/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition px-1 self-center"
          >
            <Shield className="w-3 h-3" />
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};
