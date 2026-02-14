const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Upload Middleware
 * 
 * File upload handling with multer
 */

// Default upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

/**
 * Storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

/**
 * File filter
 */
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    
    // Check extension
    if (allowedTypes.ext && !allowedTypes.ext.includes(ext)) {
      return cb(new ApiError(400, `File type .${ext} not allowed`), false);
    }
    
    // Check mime type
    if (allowedTypes.mime && !allowedTypes.mime.includes(mimeType)) {
      return cb(new ApiError(400, `MIME type ${mimeType} not allowed`), false);
    }
    
    cb(null, true);
  };
};

// Image file filter
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

// Document file filter
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  const allowedExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only document files are allowed'), false);
  }
};

/**
 * Multer configurations
 */

// Single image upload
const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
}).single('image');

// Multiple image upload
const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024,
    files: parseInt(process.env.MAX_IMAGES) || 10
  }
}).array('images', 10);

// Single document upload
const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_DOCUMENT_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
}).single('document');

// Multiple documents upload
const uploadDocuments = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_DOCUMENT_SIZE) || 10 * 1024 * 1024,
    files: parseInt(process.env.MAX_DOCUMENTS) || 5
  }
}).array('documents', 5);

// Generic file upload
const uploadFile = (fieldName, options = {}) => {
  const maxSize = options.maxSize || 5 * 1024 * 1024;
  const allowedExt = options.allowedExt || [];
  const allowedMime = options.allowedMime || [];
  
  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (allowedExt.length > 0 && !allowedExt.includes(ext)) {
        return cb(new ApiError(400, `File type .${ext} not allowed`), false);
      }
      
      if (allowedMime.length > 0 && !allowedMime.includes(file.mimetype)) {
        return cb(new ApiError(400, `MIME type ${file.mimetype} not allowed`), false);
      }
      
      cb(null, true);
    },
    limits: {
      fileSize: maxSize
    }
  }).single(fieldName);
};

// Custom multer with dynamic configuration
const upload = (config) => {
  return multer({
    storage: config.storage || storage,
    fileFilter: config.fileFilter || undefined,
    limits: config.limits || {}
  });
};

/**
 * Error handling wrapper for multer
 */
const handleUpload = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer errors
        let message = 'File upload error';
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = `File size exceeds maximum of ${err.limit / 1024 / 1024}MB`;
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          message = `Maximum number of files (${err.limit}) exceeded`;
        } else if (err.code === 'LIMIT_FIELD_NAME') {
          message = 'Field name too long';
        } else if (err.code === 'LIMIT_FIELD_VALUE') {
          message = 'Field value too long';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = 'Unexpected file field';
        }
        
        return next(new ApiError(400, message));
      } else if (err) {
        // Other errors
        return next(err);
      }
      
      next();
    });
  };
};

/**
 * Cloudinary upload middleware (if configured)
 */
const cloudinaryUpload = async (req, res, next) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return next();
  }
  
  const cloudinary = require('cloudinary').v2;
  const fs = require('fs');
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  if (!req.file) {
    return next();
  }
  
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: process.env.CLOUDINARY_FOLDER || 'coconut-saraih',
      resource_type: 'auto'
    });
    
    // Add cloudinary result to request
    req.file.cloudinary = {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height
    };
    
    // Remove local file after upload
    fs.unlinkSync(req.file.path);
    
    next();
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    next(new ApiError(500, 'Failed to upload file to cloud storage'));
  }
};

/**
 * Multiple cloudinary upload
 */
const cloudinaryUploadMultiple = async (req, res, next) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !req.files) {
    return next();
  }
  
  const cloudinary = require('cloudinary').v2;
  const fs = require('fs');
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  try {
    const uploadPromises = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: process.env.CLOUDINARY_FOLDER || 'coconut-saraih',
        resource_type: 'auto'
      });
      
      // Remove local file after upload
      fs.unlinkSync(file.path);
      
      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height
      };
    });
    
    req.files.cloudinary = await Promise.all(uploadPromises);
    next();
  } catch (error) {
    logger.error('Cloudinary multiple upload error:', error);
    next(new ApiError(500, 'Failed to upload files to cloud storage'));
  }
};

/**
 * Get file info helper
 */
const getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    extension: path.extname(file.originalname).toLowerCase()
  };
};

module.exports = {
  uploadImage,
  uploadImages,
  uploadDocument,
  uploadDocuments,
  uploadFile,
  upload,
  handleUpload,
  cloudinaryUpload,
  cloudinaryUploadMultiple,
  getFileInfo,
  imageFilter,
  documentFilter
};
