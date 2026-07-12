import React, { useState } from 'react';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

const TERMS_CONTENT = `
**Last updated: January 2025**

## 1. Acceptance of Terms

By accessing or using the Bulls platform ("Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the Service.

## 2. Description of Service

Bulls is a social network designed for investors, financial professionals, and market enthusiasts. The Service includes a news feed, portfolio tracker, live streaming, direct messaging, and financial education tools.

## 3. User Accounts

You must register an account to use most features. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must be at least 18 years old to use the Service.

## 4. User Content

You retain ownership of content you post on Bulls. By posting content, you grant Bulls a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content on the platform. You are solely responsible for ensuring your content complies with applicable laws.

## 5. Prohibited Conduct

You agree not to:
• Post false, misleading, or fraudulent financial information
• Manipulate markets or engage in pump-and-dump schemes
• Harass, threaten, or abuse other users
• Post spam, malware, or phishing links
• Impersonate other persons or entities
• Violate any applicable laws or regulations

## 6. Financial Disclaimer

Content on Bulls is for informational and educational purposes only. Nothing on the platform constitutes financial, investment, legal, or tax advice. Always consult a qualified financial adviser before making investment decisions. Past performance is not indicative of future results.

## 7. Premium Subscriptions

Paid subscriptions are processed through Stripe. Subscriptions renew automatically until cancelled. Cancellations take effect at the end of the current billing period. Refunds may be issued within 7 days of a charge at our discretion.

## 8. Intellectual Property

The Bulls name, logo, and platform design are proprietary to Bulls. You may not copy, modify, or distribute any part of the Service without our written permission.

## 9. Limitation of Liability

To the maximum extent permitted by law, Bulls shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid us in the past 12 months.

## 10. Termination

We may suspend or terminate your account at any time for violations of these Terms or for any other reason at our sole discretion. You may delete your account at any time from Settings.

## 11. Changes to Terms

We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.

## 12. Governing Law

These Terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dublin, Ireland.

## 13. Contact

For questions about these Terms, contact us at legal@bulls.app.
`;

const PRIVACY_CONTENT = `
**Last updated: January 2025**

## 1. Information We Collect

**Account information:** name, username, email address, profile photo, bio, and other profile data you provide.

**Usage data:** posts, comments, likes, follows, portfolio assets, messages, and other actions you take on the platform.

**Device data:** IP address, browser type, device identifier, and operating system, collected automatically when you use the Service.

**Payment data:** billing information processed securely through Stripe. We do not store full card numbers.

## 2. How We Use Your Information

We use your information to:
• Provide, maintain, and improve the Service
• Process payments and manage subscriptions
• Send notifications about activity on your account
• Personalise your feed and content recommendations
• Detect and prevent fraud, abuse, and security incidents
• Comply with legal obligations

## 3. Data Sharing

We do not sell your personal data. We may share data with:
• **Service providers:** Supabase (database), Stripe (payments), OneSignal (push notifications), Vercel (hosting)
• **Law enforcement:** when required by law or to protect rights and safety
• **Business transfers:** in the event of a merger or acquisition

## 4. Your Rights (GDPR)

If you are in the European Economic Area, you have the right to:
• **Access** — request a copy of all data we hold about you
• **Portability** — export your data in a machine-readable format (Settings → Data & Privacy → Download My Data)
• **Erasure** — request deletion of your account and data (Settings → Delete My Account)
• **Restriction** — request that we limit processing of your data
• **Objection** — object to processing for direct marketing purposes

To exercise your rights, contact privacy@bulls.app or use the in-app controls in Settings.

## 5. Data Retention

We retain your data for as long as your account is active. When you delete your account, we delete your personal data within 30 days, except where we are required to retain it for legal purposes.

## 6. Security

We use industry-standard encryption (TLS in transit, AES-256 at rest) to protect your data. We perform regular security audits. No method of transmission is 100% secure, and we cannot guarantee absolute security.

## 7. Cookies

Bulls uses essential cookies for authentication and session management. We do not use advertising cookies or sell cookie data to third parties.

## 8. Children's Privacy

The Service is not directed to persons under 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, contact us at privacy@bulls.app.

## 9. International Transfers

Your data is processed primarily in the European Union. Where data is transferred outside the EU, we ensure adequate protections are in place (Standard Contractual Clauses).

## 10. Changes to This Policy

We may update this Privacy Policy. We will notify you of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance.

## 11. Contact & DPO

**Data Controller:** Bulls Technologies Ltd, Dublin, Ireland
**Email:** privacy@bulls.app
**For GDPR inquiries:** dpo@bulls.app
`;

export const TermsScreen = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');

  const content = tab === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

  const renderContent = (text: string) => {
    return text.trim().split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-base font-bold text-slate-900 mt-5 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="text-sm font-semibold text-slate-700 mb-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('• ')) {
        return <p key={i} className="text-sm text-slate-600 leading-relaxed pl-3 mb-1">• {line.slice(2)}</p>;
      }
      if (line.startsWith('**') && line.includes(':**')) {
        const colonIdx = line.indexOf(':**');
        const label = line.slice(2, colonIdx);
        const rest = line.slice(colonIdx + 3);
        return (
          <p key={i} className="text-sm text-slate-600 leading-relaxed mb-1.5">
            <strong className="text-slate-800">{label}:</strong>{rest}
          </p>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-1" />;
      }
      return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-1.5">{line}</p>;
    });
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Legal</h1>
            <p className="text-green-100 text-xs">Terms of Use & Privacy Policy</p>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => setTab('terms')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold border-b-2 transition ${
              tab === 'terms' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Use
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold border-b-2 transition ${
              tab === 'privacy' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500'
            }`}
          >
            <Shield className="w-4 h-4" />
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          {renderContent(content)}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 mb-2">
          Questions? Email{' '}
          <a href="mailto:legal@bulls.app" className="text-green-600 font-semibold">legal@bulls.app</a>
        </p>
      </div>
    </div>
  );
};
