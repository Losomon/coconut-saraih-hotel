/**
 * Cloud Storage Configuration (Cloudinary & AWS S3)
 */

const config = require('./index');

let cloudinaryClient = null;
let s3Client = null;

/**
 * Initialize Cloudinary
 */
const initializeCloudinary = () => {
  const cloudinaryConfig = config.cloudStorage.cloudinary;
  
  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey) {
    console.warn('Cloudinary credentials not configured');
    return null;
  }

  try {
    const cloudinary = require('cloudinary').v2;
    
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
      secure: true
    });

    cloudinaryClient = cloudinary;
    console.log('Cloudinary initialized');
    return cloudinary;
  } catch (error) {
    console.error('Failed to initialize Cloudinary:', error.message);
    return null;
  }
};

/**
 * Initialize AWS S3
 */
const initializeS3 = () => {
  const s3Config = config.cloudStorage.aws.s3;
  
  if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
    console.warn('AWS S3 credentials not configured');
    return null;
  }

  try {
    const { S3Client } = require('@aws-sdk/client-s3');
    
    s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey
      }
    });

    console.log('AWS S3 client initialized');
    return s3Client;
  } catch (error) {
    console.error('Failed to initialize AWS S3:', error.message);
    return null;
  }
};

/**
 * Get Cloudinary client
 */
const getCloudinaryClient = () => cloudinaryClient;

/**
 * Get S3 client
 */
const getS3Client = () => s3Client;

/**
 * Upload to Cloudinary
 */
const uploadToCloudinary = async (file, options = {}) => {
  if (!cloudinaryClient) {
    throw new Error('Cloudinary not initialized');
  }

  try {
    const defaultOptions = {
      folder: config.cloudStorage.cloudinary.folder,
      resource_type: 'auto',
      ...options
    };

    const result = await cloudinaryClient.uploader.upload(file, defaultOptions);
    
    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!cloudinaryClient) {
    throw new Error('Cloudinary not initialized');
  }

  try {
    const result = await cloudinaryClient.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    return { success: result.result === 'ok' };
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Generate Cloudinary transformation URL
 */
const getCloudinaryUrl = (publicId, transformations = {}) => {
  if (!cloudinaryClient) {
    return null;
  }

  try {
    return cloudinaryClient.url(publicId, {
      secure: true,
      ...transformations
    });
  } catch (error) {
    console.error('Cloudinary URL generation error:', error.message);
    return null;
  }
};

/**
 * Upload to S3
 */
const uploadToS3 = async (file, key, options = {}) => {
  if (!s3Client) {
    throw new Error('AWS S3 not initialized');
  }

  try {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    
    const command = new PutObjectCommand({
      Bucket: config.cloudStorage.aws.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: options.acl || 'public-read',
      ...options
    });

    await s3Client.send(command);
    
    const url = `https://${config.cloudStorage.aws.s3.bucket}.s3.${config.cloudStorage.aws.s3.region}.amazonaws.com/${key}`;
    
    return {
      success: true,
      key,
      url
    };
  } catch (error) {
    console.error('S3 upload error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete from S3
 */
const deleteFromS3 = async (key) => {
  if (!s3Client) {
    throw new Error('AWS S3 not initialized');
  }

  try {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    
    const command = new DeleteObjectCommand({
      Bucket: config.cloudStorage.aws.s3.bucket,
      Key: key
    });

    await s3Client.send(command);
    
    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get signed S3 URL
 */
const getSignedS3Url = async (key, expiresIn = 3600) => {
  if (!s3Client) {
    throw new Error('AWS S3 not initialized');
  }

  try {
    const { GetSignedUrlCommand } = require('@aws-sdk/client-s3');
    
    const command = new GetSignedUrlCommand({
      Bucket: config.cloudStorage.aws.s3.bucket,
      Key: key,
      Expires: expiresIn
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    
    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('S3 signed URL error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Unified upload function (prefers Cloudinary)
 */
const uploadFile = async (file, options = {}) => {
  // Try Cloudinary first
  if (cloudinaryClient) {
    return uploadToCloudinary(file, options);
  }
  
  // Fallback to S3
  if (s3Client) {
    const key = `${config.cloudStorage.aws.s3.folder}/${Date.now()}-${file.originalname}`;
    return uploadToS3(file, key, options);
  }
  
  throw new Error('No cloud storage configured');
};

/**
 * Initialize all cloud storage
 */
const initializeCloudStorage = () => {
  initializeCloudinary();
  initializeS3();
};

module.exports = {
  initializeCloudStorage,
  initializeCloudinary,
  initializeS3,
  getCloudinaryClient,
  getS3Client,
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
  uploadToS3,
  deleteFromS3,
  getSignedS3Url,
  uploadFile
};
