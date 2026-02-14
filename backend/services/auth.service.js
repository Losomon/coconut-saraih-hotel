const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

/**
 * Auth Service - Authentication business logic
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      ...userData,
      role: 'guest'
    });

    // Generate tokens
    const tokens = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is disabled');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const tokens = this.generateTokens(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    };
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      return this.generateTokens(user._id);
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });

    // Don't reveal if user exists
    if (!user) {
      return { message: 'If the email exists, a reset link will be sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // TODO: Send reset email
    // await emailService.sendPasswordReset(user.email, resetToken);

    return { message: 'If the email exists, a reset link will be sent' };
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Verify email
   */
  async verifyEmail(userId, token) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    if (user.verified) {
      throw new ApiError(400, 'Email already verified');
    }

    if (user.verificationToken !== token) {
      throw new ApiError(400, 'Invalid verification token');
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    return User.findById(userId).select('-password');
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return user;
  }
}

module.exports = new AuthService();
