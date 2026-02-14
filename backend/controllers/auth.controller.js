const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../../middleware/auth');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
exports.register = catchAsync(async (req, res) => {
  const { name, email, password, phone, firstName, lastName } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  // Create user
  const user = await User.create({
    name: name || `${firstName} ${lastName}`,
    email,
    password,
    phone,
    role: 'guest'
  });

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  ApiResponse.created(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token,
    refreshToken
  }, 'Registration successful');
});

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, 'Account is disabled');
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile
    },
    token,
    refreshToken
  }, 'Login successful');
});

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  // Verify refresh token
  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  );

  // Find user
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Generate new tokens
  const newToken = generateToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  ApiResponse.success(res, {
    token: newToken,
    refreshToken: newRefreshToken
  }, 'Token refreshed');
});

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  ApiResponse.success(res, { user });
});

// @route   PUT /api/v1/auth/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, phone, language, preferences } = req.body;
  
  const updateData = {};
  if (firstName) updateData['profile.firstName'] = firstName;
  if (lastName) updateData['profile.lastName'] = lastName;
  if (phone) updateData['profile.phone'] = phone;
  if (language) updateData['profile.language'] = language;
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  ApiResponse.success(res, { user }, 'Profile updated successfully');
});

// @route   POST /api/v1/auth/change-password
// @desc    Change password
// @access  Private
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Please provide current and new password');
  }

  const user = await User.findById(req.user._id);

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, 'Password changed successfully');
});

// @route   POST /api/v1/auth/forgot-password
// @desc    Forgot password
// @access  Public
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Please provide email');
  }

  const user = await User.findOne({ email });

  // Don't reveal if user exists
  if (!user) {
    return ApiResponse.success(res, null, 'If the email exists, a reset link will be sent');
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Send reset email
  // await sendResetEmail(user.email, resetToken);

  ApiResponse.success(res, null, 'If the email exists, a reset link will be sent');
});

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password
// @access  Public
exports.resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, 'Please provide token and new password');
  }

  // Hash token and find user
  const resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  ApiResponse.success(res, null, 'Password reset successful');
});

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = catchAsync(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we just return success
  ApiResponse.success(res, null, 'Logout successful');
});
