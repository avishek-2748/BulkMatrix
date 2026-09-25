import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../services/emailService.js';

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  res.status(statusCode).json({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, company, role, phoneNumber, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const assignedRole = role || 'LOGISTIC_MANAGER';
    const user = await User.create({ 
      name, 
      email, 
      password, 
      company,
      role: assignedRole,
      phoneNumber,
      address,
      isEmailVerified: false
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // For VESSEL_OWNER, they must verify before fully using. But we still return a token or success message.
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded._id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phoneNumber: user.phoneNumber,
        address: user.address,
        rating: user.rating,
        reviewCount: user.reviewCount,
      });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { name, company, phoneNumber, address } = req.body;
    if (name) user.name = name;
    if (company !== undefined) user.company = company;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phoneNumber: user.phoneNumber,
      address: user.address,
      rating: user.rating,
      reviewCount: user.reviewCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
