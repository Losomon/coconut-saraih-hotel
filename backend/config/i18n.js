/**
 * Internationalization (i18n) Configuration
 */

const i18next = require('i18next');
const config = require('./index');

/**
 * Initialize i18n with language resources
 */
const initializeI18n = async () => {
  await i18next.init({
    lng: config.i18n.defaultLanguage,
    fallbackLng: config.i18n.fallbackLng,
    supportedLngs: config.i18n.supportedLanguages,
    debug: config.server.nodeEnv === 'development',
    
    // Detection options
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupHeader: 'accept-language',
      cookieMinutes: 60 * 24 * 7, // 7 days
      htmlTag: document.documentElement
    },
    
    // Interpolation
    interpolation: {
      escapeValue: false
    },
    
    // Resources
    resources: config.i18n.resources,
    
    // Default namespace
    ns: ['common', 'auth', 'booking', 'room', 'payment', 'guest', 'activity', 'restaurant', 'spa', 'events', 'staff', 'notification', 'feedback', 'analytics', 'errors', 'validation', 'dates'],
    defaultNS: 'common',
    
    // Backend (for loading translations from API if needed)
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json'
    }
  });

  console.log(`i18n initialized with language: ${i18next.language}`);
  return i18next;
};

/**
 * Get initialized i18n instance
 */
const getI18n = () => i18next;

/**
 * Change language
 */
const changeLanguage = async (lng) => {
  await i18next.changeLanguage(lng);
  return lng;
};

/**
 * Get translation
 */
const t = (key, options) => {
  return i18next.t(key, options);
};

/**
 * Get all available languages
 */
const getSupportedLanguages = () => {
  return config.i18n.supportedLanguages.map(code => ({
    code,
    name: getLanguageName(code),
    nativeName: getNativeName(code)
  }));
};

/**
 * Get language display name
 */
const getLanguageName = (code) => {
  const names = {
    en: 'English',
    sw: 'Swahili',
    fr: 'French',
    ar: 'Arabic'
  };
  return names[code] || code;
};

/**
 * Get native language name
 */
const getNativeName = (code) => {
  const names = {
    en: 'English',
    sw: 'Kiswahili',
    fr: 'Français',
    ar: 'العربية'
  };
  return names[code] || code;
};

/**
 * Middleware for Express
 */
const i18nMiddleware = (req, res, next) => {
  // Get language from query, cookie, or header
  const lng = req.query.lang || req.cookies?.i18next || req.acceptsLanguages('en', 'sw', 'fr', 'ar');
  
  if (lng && config.i18n.supportedLanguages.includes(lng)) {
    i18next.changeLanguage(lng);
  }
  
  // Make translation function available in templates
  req.t = i18next.t.bind(i18next);
  req.i18n = i18next;
  
  next();
};

/**
 * Add language to response locals
 */
const addLanguageToLocals = (req, res, next) => {
  res.locals.language = i18next.language;
  res.locals.supportedLanguages = getSupportedLanguages();
  res.locals.t = req.t;
  next();
};

module.exports = {
  initializeI18n,
  getI18n,
  changeLanguage,
  t,
  getSupportedLanguages,
  getLanguageName,
  getNativeName,
  i18nMiddleware,
  addLanguageToLocals
};
