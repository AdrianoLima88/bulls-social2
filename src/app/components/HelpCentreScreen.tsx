import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle, HelpCircle, Zap, Shield, CreditCard, User, BarChart3 } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

interface Category {
  icon: React.FC<any>;
  color: string;
  bg: string;
  title: string;
  faqs: FAQ[];
}

const CATEGORIES: Category[] = [
  {
    icon: User,
    color: 'text-green-600',
    bg: 'bg-green-100',
    title: 'Account & Profile',
    faqs: [
      { q: 'How do I edit my profile?', a: 'Go to your profile page, tap the "Edit Profile" button, then update your name, bio, photo, and other information. Changes are saved immediately.' },
      { q: 'How do I change my username?', a: 'Go to Settings → Account → and edit your profile. Your username must be unique and can contain letters, numbers, and underscores.' },
      { q: 'Can I make my account private?', a: 'Yes. Go to Settings → Privacy & Security → toggle "Private Account". Only approved followers will see your posts.' },
      { q: 'How do I delete my account?', a: 'Go to Settings → scroll to the bottom → "Delete My Account". Type DELETE to confirm. This action is permanent and cannot be undone.' },
    ],
  },
  {
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    title: 'Portfolio & Markets',
    faqs: [
      { q: 'How do I add assets to my portfolio?', a: 'Go to the Portfolio tab, tap the "+" button, search for a stock, crypto, or ETF, enter your purchase price and quantity, and confirm.' },
      { q: 'How many assets can I track for free?', a: 'Free accounts can track up to 5 assets. Upgrade to Premium or above to track unlimited assets.' },
      { q: 'Where does the market data come from?', a: 'Bulls uses real-time and delayed pricing data from leading financial data providers. Prices may be delayed up to 15 minutes for free accounts.' },
      { q: 'How do I set price alerts?', a: 'Available on Premium and above. Go to the Portfolio, tap an asset, then tap the bell icon to set a target price alert.' },
    ],
  },
  {
    icon: Zap,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    title: 'Feed & Posts',
    faqs: [
      { q: 'What kind of posts can I share?', a: 'You can share text, images, charts, documents, and video content. All posts must comply with our Community Guidelines and focus on financial topics.' },
      { q: 'What are Premium posts?', a: 'Premium members can mark posts as exclusive, which blurs the content for non-subscribers. This lets creators monetise their analysis and insights.' },
      { q: 'How does the feed algorithm work?', a: 'Your feed shows posts from people you follow first, then suggested content based on your interests in the "Discover" filter. You can also filter by "Following" only.' },
      { q: 'Can I save posts to read later?', a: 'Yes. Tap the bookmark icon on any post to save it. Access saved posts from your profile → the bookmark tab.' },
    ],
  },
  {
    icon: Shield,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    title: 'Safety & Privacy',
    faqs: [
      { q: 'How do I block someone?', a: 'Go to a user\'s profile or open a conversation, tap the three-dot menu, and select "Block". They will no longer be able to see your profile or contact you.' },
      { q: 'How do I report a post or user?', a: 'Tap the three-dot menu on any post or profile and select "Report". Choose the reason and submit. Our moderation team reviews all reports.' },
      { q: 'What is two-factor authentication?', a: 'Two-factor authentication (2FA) adds a second layer of security to your account. Go to Settings → Privacy & Security → Two-Factor Authentication to enable it.' },
      { q: 'How does Bulls protect my data?', a: 'All data is encrypted in transit and at rest. We comply with GDPR. You can export or delete all your data at any time from Settings → Data & Privacy.' },
    ],
  },
  {
    icon: CreditCard,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    title: 'Subscriptions & Billing',
    faqs: [
      { q: 'What plans are available?', a: 'Bulls offers Free, Premium, Pro, and Business plans. Each plan unlocks more features such as unlimited portfolio assets, exclusive content tools, advanced analytics, and more.' },
      { q: 'How do I upgrade my plan?', a: 'Go to Settings → Account → Subscription, or tap "Premium" anywhere in the app. Select your plan and billing cycle, then complete the secure checkout via Stripe.' },
      { q: 'Can I cancel my subscription?', a: 'Yes, at any time. Go to Settings → Account → Subscription → Manage Subscription. Your access continues until the end of the current billing period.' },
      { q: 'Are there refunds?', a: 'We offer refunds within 7 days of a charge if you haven\'t used the premium features. Contact support@bulls.app with your order details to request a refund.' },
    ],
  },
];

export const HelpCentreScreen = ({ onBack }: { onBack: () => void }) => {
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (key: string) => setOpenFaq(openFaq === key ? null : key);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-green-600 flex-shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Help Centre</h1>
            <p className="text-green-100 text-xs">How can we help you?</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">

        {/* Hero */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500 mt-0.5">Browse answers to common questions below, or contact our support team.</p>
          </div>
        </div>

        {/* FAQ Categories */}
        {CATEGORIES.map((cat, ci) => {
          const Icon = cat.icon;
          const isOpen = openCategory === ci;
          return (
            <div key={ci} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenCategory(isOpen ? null : ci)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${cat.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <span className="font-bold text-slate-900">{cat.title}</span>
                </div>
                {isOpen
                  ? <ChevronUp className="w-5 h-5 text-slate-400" />
                  : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {cat.faqs.map((faq, fi) => {
                    const key = `${ci}-${fi}`;
                    const faqOpen = openFaq === key;
                    return (
                      <div key={fi}>
                        <button
                          onClick={() => toggleFaq(key)}
                          className="w-full px-4 py-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition text-left"
                        >
                          <span className="text-sm font-semibold text-slate-800 flex-1">{faq.q}</span>
                          {faqOpen
                            ? <ChevronUp className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />}
                        </button>
                        {faqOpen && (
                          <div className="px-4 pb-3">
                            <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Contact Support */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Still need help?</h3>
              <p className="text-white/80 text-sm">Our support team is here for you</p>
            </div>
          </div>
          <a
            href="mailto:support@bulls.app"
            className="w-full bg-white text-cyan-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition"
          >
            <Mail className="w-5 h-5" />
            Email support@bulls.app
          </a>
          <p className="text-center text-white/70 text-xs mt-2">We reply within 24 hours on business days</p>
        </div>

      </div>
    </div>
  );
};
