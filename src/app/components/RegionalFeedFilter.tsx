import React, { useState } from 'react';
import { Globe, Languages, X, Check } from 'lucide-react';
import { useLocale, Region, Language } from '../contexts/LocaleContext';
import { LANGUAGE_NAMES } from '../utils/translator';

interface RegionalFeedFilterProps {
  onClose: () => void;
}

const REGIONS_DATA: { code: Region; name: string; flag: string }[] = [
  { code: 'GLOBAL', name: 'Global', flag: '🌍' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'EU', name: 'Europe', flag: '🇪🇺' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'LATAM', name: 'Latin America', flag: '🌎' },
];

const LANGUAGES_DATA: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export const RegionalFeedFilter = ({ onClose }: RegionalFeedFilterProps) => {
  const { locale, setRegion, setLanguage } = useLocale();
  const [activeTab, setActiveTab] = useState<'region' | 'language'>('region');
  const [selectedRegion, setSelectedRegion] = useState<Region>(locale.region);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(locale.language);

  const handleApply = () => {
    setRegion(selectedRegion);
    setLanguage(selectedLanguage);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Regional Feed</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/90 text-sm">
            Customize your feed to see posts and news from specific regions and languages
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('region')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'region'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-5 h-5 mx-auto mb-1" />
            Region
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'language'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Languages className="w-5 h-5 mx-auto mb-1" />
            Language
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'region' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-4">
                Select which market region you want to see posts and companies from
              </p>
              {REGIONS_DATA.map((region) => (
                <button
                  key={region.code}
                  onClick={() => setSelectedRegion(region.code)}
                  className={`w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between ${
                    selectedRegion === region.code ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{region.flag}</span>
                    <span className="font-bold text-slate-900">{region.name}</span>
                  </div>
                  {selectedRegion === region.code && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 mb-4">
                Posts will be shown in your selected language with automatic translation
              </p>
              {LANGUAGES_DATA.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between ${
                    selectedLanguage === lang.code ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">{lang.nativeName}</p>
                      <p className="text-sm text-slate-600">{lang.name}</p>
                    </div>
                  </div>
                  {selectedLanguage === lang.code && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
