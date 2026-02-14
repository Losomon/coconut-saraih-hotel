/**
 * Encryption and Cryptography Utilities
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Configuration
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // AES block size
const SALT_ROUNDS = 12; // bcrypt rounds

/**
 * Encrypt string using AES-256-CBC
 */
const encrypt = (text) => {
  if (!text) return null;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt string using AES-256-CBC
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
};

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Generate numeric OTP
 */
const generateOTP = (length = 6) => {
  return crypto.randomInt(0, Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

/**
 * Generate UUID v4
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Hash string using SHA-256
 */
const hashSHA256 = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Hash string using SHA-512
 */
const hashSHA512 = (text) => {
  return crypto.createHash('sha512').update(text).digest('hex');
};

/**
 * Generate HMAC signature
 */
const generateHMAC = (text, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');
};

/**
 * Verify HMAC signature
 */
const verifyHMAC = (text, signature, secret) => {
  const expected = generateHMAC(text, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
};

/**
 * Generate token for email verification
 */
const generateEmailVerificationToken = () => {
  return generateRandomString(64);
};

/**
 * Generate token for password reset
 */
const generatePasswordResetToken = () => {
  const token = generateRandomString(32);
  const expiry = Date.now() + 3600000; // 1 hour
  
  return {
    token,
    expiry,
    hash: hashSHA256(token)
  };
};

/**
 * Mask sensitive data (e.g., credit card)
 */
const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || data.length <= visibleChars) {
    return '*'.repeat(data?.length || 0);
  }
  
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
};

/**
 * Mask email address
 */
const maskEmail = (email) => {
  if (!email) return null;
  
  const [username, domain] = email.split('@');
  
  if (!username || !domain) {
    return maskSensitiveData(email);
  }
  
  const maskedUsername = username.length > 2
    ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
    : username[0] + '*';
  
  return `${maskedUsername}@${domain}`;
};

/**
 * Mask phone number
 */
const maskPhone = (phone) => {
  if (!phone) return null;
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length <= 4) {
    return '*'.repeat(cleaned.length);
  }
  
  const visible = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  
  // Re-add any formatting characters at the start
  const prefix = phone.match(/^\+/)?.[0] || '';
  
  return prefix + masked + visible;
};

/**
 * Encrypt object (for storing sensitive data)
 */
const encryptObject = (obj) => {
  const json = JSON.stringify(obj);
  return encrypt(json);
};

/**
 * Decrypt object
 */
const decryptObject = (encryptedStr) => {
  const json = decrypt(encryptedStr);
  if (!json) return null;
  
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Secure random number generation
 */
const secureRandom = (min, max) => {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const threshold = maxValue - (maxValue % range);
  
  let randomValue;
  do {
    randomValue = parseInt(crypto.randomBytes(bytesNeeded).toString('hex'), 16);
  } while (randomValue >= threshold);
  
  return min + (randomValue % range);
};

/**
 * Generate secure API key
 */
const generateAPIKey = (prefix = 'csh') => {
  const key = `${prefix}_${generateRandomString(32)}`;
  const hash = hashSHA256(key);
  
  return {
    key,
    hash,
    createdAt: new Date()
  };
};

/**
 * Time-safe string comparison (prevent timing attacks)
 */
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
};

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  comparePassword,
  generateRandomString,
  generateOTP,
  generateUUID,
  hashSHA256,
  hashSHA512,
  generateHMAC,
  verifyHMAC,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  maskSensitiveData,
  maskEmail,
  maskPhone,
  encryptObject,
  decryptObject,
  secureRandom,
  generateAPIKey,
  safeCompare,
  ENCRYPTION_KEY,
  SALT_ROUNDS
};
