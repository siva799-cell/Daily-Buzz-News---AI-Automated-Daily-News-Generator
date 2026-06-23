// State to predominant local language mapping
const STATE_LANGUAGE_MAP = {
  'andhra pradesh': 'te', // Telugu
  'telangana': 'te',
  'tamil nadu': 'ta',     // Tamil
  'karnataka': 'kn',      // Kannada
  'kerala': 'ml',          // Malayalam
  'delhi': 'hi',           // Hindi
  'uttar pradesh': 'hi',
  'bihar': 'hi',
  'madhya pradesh': 'hi',
  'rajasthan': 'hi',
  'haryana': 'hi',
  'himachal pradesh': 'hi',
  'uttarakhand': 'hi',
  'jharkhand': 'hi',
  'chhattisgarh': 'hi',
  'maharashtra': 'hi', // fallback to Hindi from standard filter list
  'gujarat': 'hi',
  'west bengal': 'hi',
  'punjab': 'hi',
};

/**
 * Returns the language code for a given state
 * @param {string} state 
 * @returns {string} Language code (en, te, hi, ta, kn, ml)
 */
export function getLanguageForState(state) {
  if (!state) return 'en';
  const cleanState = state.toLowerCase().trim();
  return STATE_LANGUAGE_MAP[cleanState] || 'en';
}

/**
 * Maps language code to display name
 * @param {string} code 
 * @returns {string} Name
 */
export function getLanguageName(code) {
  const names = {
    en: 'English',
    te: 'తెలుగు (Telugu)',
    hi: 'हिन्दी (Hindi)',
    ta: 'தமிழ் (Tamil)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ml: 'മലയാളம் (Malayalam)',
  };
  return names[code] || 'English';
}
