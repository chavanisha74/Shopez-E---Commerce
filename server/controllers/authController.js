const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'shopez_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// Helper to send cookie + user JSON
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token, // Also provided in payload for clients preferring Bearer authorization
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        pincode: user.pincode,
        savedAddresses: user.savedAddresses || [],
        userType: user.userType,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, username, email, password, mobile, address, pincode } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, username, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another one.'
      });
    }

    // Enforce role security: Prevent customer from becoming admin via request body
    const newUser = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      mobile: mobile || '',
      address: address || '',
      pincode: pincode || '',
      userType: 'customer', // strictly enforce customer role
      isActive: true
    });

    sendTokenResponse(newUser, 201, res, 'Registration successful. Welcome to SHOPEZ!');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { loginId, email, username, password } = req.body;
    const identifier = (loginId || email || username || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/username and password.'
      });
    }

    // Find user by either email or username, including password
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your login details.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact customer support.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your login details.'
      });
    }

    sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update current user profile
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, mobile, address, pincode, savedAddresses } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (address !== undefined) user.address = address;
    if (pincode !== undefined) user.pincode = pincode;
    if (Array.isArray(savedAddresses)) user.savedAddresses = savedAddresses;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change user password
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
};
