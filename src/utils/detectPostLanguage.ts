/**
 * Lightweight post language detector for EN / PT-BR / ES / FR.
 * No external dependencies — pure regex/wordlist matching.
 */

type PostLang = 'en' | 'pt' | 'es' | 'fr';

// Common function words per language (high-frequency, unambiguous)
const PATTERNS: Record<PostLang, RegExp> = {
  pt: /\b(que|não|uma|com|por|para|mais|são|mas|isso|tem|ele|ela|muito|foi|aqui|sobre|também|até|nos|das|dos|pelo|pela|como|quando|onde|porque|então|agora|ainda|já|pode|deve|seria|fazer|estar|sempre|cada|depois|antes|entre|mesmo|outra|outras|outros|estou|estão|somos|vocês|você)\b/gi,
  es: /\b(que|no|una|con|por|para|más|son|pero|esto|tiene|él|ella|muy|fue|aquí|sobre|también|hasta|los|las|del|por|como|cuando|donde|porque|entonces|ahora|todavía|ya|puede|debe|sería|hacer|estar|siempre|cada|después|antes|entre|mismo|otra|otras|otros|estoy|están|somos|ustedes|usted)\b/gi,
  fr: /\b(que|ne|une|avec|par|pour|plus|sont|mais|cela|a|il|elle|très|était|ici|sur|aussi|jusqu|les|des|du|comme|quand|où|parce|alors|maintenant|encore|déjà|peut|doit|serait|faire|être|toujours|chaque|après|avant|entre|même|autre|autres|je|vous|nous|ils|elles)\b/gi,
  en: /\b(the|and|that|with|for|are|but|this|has|he|she|very|was|here|about|also|until|from|how|when|where|because|then|now|still|already|can|should|would|make|being|always|each|after|before|between|same|other|others|I|you|we|they|is|in|it|be|have|do|at|by|an|or|as|if|not|so|its|our|your|their)\b/gi,
};

/**
 * Detects the language of post content.
 * Returns ISO 639-1 code ('en' | 'pt' | 'es' | 'fr').
 * Falls back to 'en' for very short or ambiguous text.
 */
export function detectPostLanguage(text: string): PostLang {
  if (!text || text.trim().length < 20) return 'en';

  const clean = text.toLowerCase();
  const scores: Record<PostLang, number> = { en: 0, pt: 0, es: 0, fr: 0 };

  for (const lang of Object.keys(PATTERNS) as PostLang[]) {
    const matches = clean.match(PATTERNS[lang]);
    scores[lang] = matches ? matches.length : 0;
    // Reset lastIndex (global flag)
    PATTERNS[lang].lastIndex = 0;
  }

  // Find highest score
  let best: PostLang = 'en';
  let bestScore = 0;
  for (const [lang, score] of Object.entries(scores) as [PostLang, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }

  // Require at least 2 matches to be confident; fallback to 'en'
  return bestScore >= 2 ? best : 'en';
}
