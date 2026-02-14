/**
 * Central Configuration for Coconut Saraih Hotel Backend
 */

require('dotenv').config();

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: 'v1',
    apiPrefix: '/api'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/coconut-saraih',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      family: 4,
      connectTimeout: 10000,
      maxRetriesPerRequest: 3
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'coconut-saraih-secret-key-2024',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'coconut-saraih-refresh-secret-2024',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    cookieName: 'refreshToken',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  },

  // Email Configuration
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || '"Coconut Saraih Hotel" <noreply@coconutsaraih.com>',
    sendGridApiKey: process.env.SENDGRID_API_KEY,
    awsSesConfig: {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  },

  // SMS Configuration
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    },
    africaTalking: {
      username: process.env.AFRICA_TALKING_USERNAME,
      apiKey: process.env.AFRICA_TALKING_API_KEY,
      shortCode: process.env.AFRICA_TALKING_SHORT_CODE
    }
  },

  // Payment Configuration
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      apiVersion: '2023-10-16'
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.PAYPAL_MODE || 'sandbox'
    },
    mpesa: {
      consumerKey: process.env.MPESA_CONSUMER_KEY,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET,
      shortCode: process.env.MPESA_SHORT_CODE,
      passkey: process.env.MPESA_PASSKEY,
      callbackUrl: process.env.MPESA_CALLBACK_URL,
      environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
    }
  },

  // Cloud Storage Configuration
  cloudStorage: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: 'coconut-saraih'
    },
    aws: {
      s3: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: process.env.S3_BUCKET || 'coconut-saraih-uploads'
      },
      cloudfront: {
        distributionDomain: process.env.CLOUDFRONT_DOMAIN
      }
    }
  },

  // Internationalization Configuration
  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'sw', 'fr', 'ar'],
    fallbackLng: 'en',
    lng: 'en',
    fallbackLngDefault: 'en',
    resources: {
      en: { translation: require('../locales/en.json') },
      sw: { translation: require('../locales/sw.json') },
      fr: { translation: require('../locales/fr.json') },
      ar: { translation: require('../locales/ar.json') }
    },
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupHeader: 'accept-language'
    }
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    tiers: {
      anonymous: { windowMs: 15 * 60 * 1000, max: 10 },
      authenticated: { windowMs: 15 * 60 * 1000, max: 100 },
      premium: { windowMs: 15 * 60 * 1000, max: 1000 }
    }
  },

  // Security Configuration
  security: {
    bcryptRounds: 12,
    encryptionAlgorithm: 'aes-256-cbc',
    encryptionKey: process.env.ENCRYPTION_KEY || 'coconut-saraih-encryption-key-32',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:8080'],
    helmetOptions: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          connectSrc: ["'self'", 'https://api.stripe.com'],
          frameSrc: ["'self'", 'https://js.stripe.com']
        }
      },
      crossOriginEmbedderPolicy: false
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    logDir: process.env.LOG_DIR || './logs',
    maxFiles: 30,
    maxSize: '20m',
    console: process.env.NODE_ENV !== 'production'
  },

  // Monitoring & Error Tracking
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: `coconut-saraih@${process.env.npm_package_version || '1.0.0'}`
    },
    newRelic: {
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
      appName: 'Coconut Saraih Hotel API'
    }
  },

  // Pagination Configuration
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']
  },

  // Cache Configuration
  cache: {
    // Route-level cache TTL (in seconds)
    routes: {
      '/api/rooms': 300,        // 5 minutes
      '/api/activities': 900,   // 15 minutes
      '/api/menu': 3600,        // 1 hour
      '/api/events': 600        // 10 minutes
    },
    // Query-level cache TTL (in seconds)
    queries: {
      default: 300,
      availability: 60,
      analytics: 900
    },
    // Object-level cache TTL (in seconds)
    objects: {
      default: 3600,
      user: 1800,
      settings: 7200
    }
  },

  // Socket.io Configuration
  socket: {
    cors: {
      origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    namespace: {
      main: '/',
      admin: '/admin',
      booking: '/booking'
    }
  },

  // Job Queue Configuration
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    },
    jobs: {
      email: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      },
      notification: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      },
      report: {
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 5000
        }
      }
    }
  },

  // Booking Configuration
  booking: {
    confirmationExpiry: 30 * 60 * 1000, // 30 minutes
    checkInTime: '14:00',
    checkOutTime: '11:00',
    defaultNights: 1,
    maxNights: 30,
    minAdvanceBooking: 0, // Same day booking allowed
    maxAdvanceBooking: 365, // 1 year in advance
    cancellationDeadline: 24 * 60 * 60 * 1000, // 24 hours before check-in
    noShowTime: 24 * 60 * 60 * 1000 // 24 hours after check-in time
  },

  // Pricing Configuration
  pricing: {
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'KES', 'SAR'],
    taxRate: 0.16, // 16% VAT
    serviceFee: 0.05, // 5% service fee
    seasonalPricing: true,
    dynamicPricing: false,
    discountTypes: ['promo', 'loyalty', 'corporate', 'early-bird', 'last-minute']
  },

  // Analytics Configuration
  analytics: {
    aggregationInterval: 'daily',
    retentionDays: 365,
    realTimeMetrics: ['occupancy', 'revenue', 'bookings'],
    dashboard: {
      refreshInterval: 60000, // 1 minute
      defaultRange: '30d'
    }
  },

  // Feature Flags
  features: {
    enablePayment: process.env.ENABLE_PAYMENT === 'true',
    enableSMS: process.env.ENABLE_SMS === 'true',
    enablePushNotifications: process.env.ENABLE_PUSH === 'true',
    enableSocketIO: process.env.ENABLE_SOCKET !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableCache: process.env.ENABLE_CACHE !== 'false',
    enableMpesa: process.env.ENABLE_MPESA === 'true',
    enablePayPal: process.env.ENABLE_PAYPAL === 'true'
  }
};
