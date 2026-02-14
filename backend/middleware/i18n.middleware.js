const i18n = require('i18next');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const logger = require('../utils/logger');

/**
 * i18n Middleware
 * 
 * Language detection and translation middleware
 */

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'sw', 'fr', 'ar'];
const DEFAULT_LANGUAGE = 'en';
const FALLBACK_LANGUAGE = 'en';

/**
 * Initialize i18n middleware
 */
const initI18n = async () => {
  await i18n
    .use(Backend)
    .init({
      lng: DEFAULT_LANGUAGE,
      fallbackLng: FALLBACK_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      debug: process.env.NODE_ENV === 'development',
      
      // Detection order
      detection: {
        order: ['querystring', 'cookie', 'header', 'session'],
        caches: ['cookie', 'session'],
        lookupQuerystring: 'lang',
        lookupCookie: 'language',
        lookupHeader: 'accept-language',
        lookupSession: 'language',
        cookieMinutes: 60 * 24 * 7, // 7 days
        ignoreCase: true
      },
      
      // Backend
      backend: {
        loadPath: './locales/{{lng}}/{{ns}}.json'
      },
      
      // Interpolation
      interpolation: {
        escapeValue: false
      },
      
      // Default namespace
      ns: ['common', 'auth', 'booking', 'room', 'payment', 'guest', 'activity', 'restaurant', 'spa', 'events', 'staff', 'notification', 'feedback', 'errors', 'validation'],
      defaultNS: 'common'
    });
  
  logger.info(`i18n middleware initialized with language: ${i18n.language}`);
  return i18n;
};

/**
 * Language detection middleware
 */
const detectLanguage = (req, res, next) => {
  // Check query string
  if (req.query.lang && SUPPORTED_LANGUAGES.includes(req.query.lang)) {
    req.language = req.query.lang;
    i18n.changeLanguage(req.query.lang);
  }
  // Check cookie
  else if (req.cookies?.language && SUPPORTED_LANGUAGES.includes(req.cookies.language)) {
    req.language = req.cookies.language;
    i18n.changeLanguage(req.language);
  }
  // Check header
  else if (req.headers['accept-language']) {
    const acceptedLang = req.acceptsLanguages(...SUPPORTED_LANGUAGES);
    if (acceptedLang) {
      req.language = acceptedLang;
      i18n.changeLanguage(acceptedLang);
    }
  }
  // Default
  else {
    req.language = DEFAULT_LANGUAGE;
    i18n.changeLanguage(DEFAULT_LANGUAGE);
  }
  
  // Set language header
  res.setHeader('Content-Language', req.language);
  next();
};

/**
 * Translation middleware - adds t() function to request
 */
const translate = (req, res, next) => {
  // Translation function
  req.t = (key, options) => {
    return i18n.t(key, {
      lng: req.language,
      ...options
    });
  };
  
  // Get current language
  req.getLanguage = () => req.language;
  
  // Get supported languages
  req.getSupportedLanguages = () => SUPPORTED_LANGUAGES;
  
  // Change language
  req.setLanguage = async (lang) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      await i18n.changeLanguage(lang);
      req.language = lang;
      res.cookie('language', lang, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
      return true;
    }
    return false;
  };
  
  next();
};

/**
 * Local variables middleware for templates
 */
const locals = (req, res, next) => {
  res.locals.language = req.language;
  res.locals.supportedLanguages = SUPPORTED_LANGUAGES.map(code => ({
    code,
    name: getLanguageName(code),
    nativeName: getNativeName(code),
    isCurrent: code === req.language
  }));
  res.locals.t = req.t;
  res.locals.isRTL = ['ar'].includes(req.language);
  next();
};

/**
 * Get language name
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
 * Language switcher middleware
 */
const languageSwitcher = (req, res, next) => {
  req.switchLanguage = async (lang) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      await i18n.changeLanguage(lang);
      req.language = lang;
      
      // Set cookie
      res.cookie('language', lang, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return true;
    }
    return false;
  };
  
  next();
};

/**
 * API response localization
 */
const localizeApiResponse = (req, res, next) => {
  // Wrap res.json to add localization info
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    return originalJson({
      ...data,
      language: req.language,
      translations: {
        ...data.translations,
        timestamp: new Date().toISOString()
      }
    });
  };
  next();
};

/**
 * RTL support middleware
 */
const rtlSupport = (req, res, next) => {
  const rtlLanguages = ['ar'];
  const isRTL = rtlLanguages.includes(req.language);
  
  res.locals.isRTL = isRTL;
  res.setHeader('X-RTL-Support', isRTL ? 'true' : 'false');
  
  if (isRTL) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
  
  next();
};

/**
 * Get translations for frontend
 */
const getClientTranslations = (namespaces = ['common']) => {
  const translations = {};
  
  namespaces.forEach(ns => {
    translations[ns] = i18n.getResourceBundle(i18n.language, ns);
  });
  
  return translations;
};

/**
 * Middleware to load namespace translations
 */
const loadNamespace = (namespace) => {
  return (req, res, next) => {
    req.namespace = namespace;
    req.t = (key, options) => {
      return i18n.t(`${namespace}:${key}`, {
        lng: req.language,
        ...options
      });
    };
    next();
  };
};

/**
 * Force language for specific routes
 */
const forceLanguage = (lang) => {
  return (req, res, next) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      i18n.changeLanguage(lang);
      req.language = lang;
    }
    next();
  };
};

/**
 * Language validation middleware
 */
const validateLanguage = (req, res, next) => {
  const lang = req.query.lang || req.params.lang;
  
  if (lang && !SUPPORTED_LANGUAGES.includes(lang)) {
    return res.status(400).json({
      success: false,
      message: `Language '${lang}' is not supported. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`,
      supportedLanguages: SUPPORTED_LANGUAGES
    });
  }
  
  next();
};

module.exports = {
  initI18n,
  detectLanguage,
  translate,
  locals,
  languageSwitcher,
  localizeApiResponse,
  rtlSupport,
  getClientTranslations,
  loadNamespace,
  forceLanguage,
  validateLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageName,
  getNativeName
};
