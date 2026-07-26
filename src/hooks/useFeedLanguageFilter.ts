/**
 * Manages the user's feed language filter preference.
 * Stored in localStorage as `bullsFeedLangs` — array of language codes.
 * null means "show all" (no filter applied).
 */

import { useState, useCallback } from 'react';

export type FeedLang = 'en' | 'pt' | 'es' | 'fr';

export const FEED_LANG_OPTIONS: { code: FeedLang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const STORAGE_KEY = 'bullsFeedLangs';

const loadFilter = (): FeedLang[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null; // no preference set → show all
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as FeedLang[];
  } catch {
    return null;
  }
};

const saveFilter = (langs: FeedLang[] | null) => {
  try {
    if (!langs || langs.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(langs));
    }
  } catch {
    // ignore
  }
};

export const useFeedLanguageFilter = () => {
  const [feedLangs, setFeedLangsState] = useState<FeedLang[] | null>(loadFilter);

  const setFeedLangs = useCallback((langs: FeedLang[] | null) => {
    saveFilter(langs);
    setFeedLangsState(langs);
  }, []);

  const toggleLang = useCallback((lang: FeedLang) => {
    setFeedLangsState(prev => {
      const current = prev ?? FEED_LANG_OPTIONS.map(l => l.code);
      const next = current.includes(lang)
        ? current.filter(l => l !== lang)
        : [...current, lang];
      // If all selected, treat as "no filter"
      const all = FEED_LANG_OPTIONS.map(l => l.code);
      const result = next.length === all.length ? null : (next.length === 0 ? null : next as FeedLang[]);
      saveFilter(result);
      return result;
    });
  }, []);

  const isLangEnabled = useCallback((lang: FeedLang) => {
    if (!feedLangs) return true; // no filter → all enabled
    return feedLangs.includes(lang);
  }, [feedLangs]);

  return { feedLangs, setFeedLangs, toggleLang, isLangEnabled };
};
