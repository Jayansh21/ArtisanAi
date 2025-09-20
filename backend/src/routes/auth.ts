import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// JWT Secret - Load dynamically to ensure consistency
const getJWTSecret = (): string => process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

// Validation rules
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Business name must be less than 100 characters'),
  body('businessType')
    .optional()
    .isIn(['Textiles', 'Handicrafts', 'Jewelry', 'Pottery', 'Woodwork', 'Metalwork', 'Other'])
    .withMessage('Invalid business type'),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Generate JWT token
const generateToken = (userId: string, email: string): string => {
  const payload = { 
    userId, 
    email
  };
  
  const options: jwt.SignOptions = {
    // @ts-ignore - JWT types issue with expiresIn
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'artisan-ai',
    audience: 'artisan-ai-users'
  };
  
  const secret = getJWTSecret();
  return jwt.sign(payload, secret, options);
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, async (req: any, res: any) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, businessName, businessType, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      businessName,
      businessType,
      phone,
      location
    });

    // Save user to database
    const savedUser = await user.save();
    
    // Verify user was saved successfully
    if (!savedUser._id) {
      throw new Error('Failed to save user to database');
    }

    // Generate JWT token
    const token = generateToken(savedUser._id.toString(), savedUser.email);

    logger.info(`New user registered and saved to database: ${email} with ID: ${savedUser._id}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully and saved to database',
      data: {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          businessName: savedUser.businessName,
          businessType: savedUser.businessType,
          phone: savedUser.phone,
          location: savedUser.location,
          isEmailVerified: savedUser.isEmailVerified,
          createdAt: savedUser.createdAt
        },
        token
      }
    });

  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req: any, res: any) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          businessType: user.businessType,
          phone: user.phone,
          location: user.location,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          businessType: user.businessType,
          phone: user.phone,
          location: user.location,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Business name must be less than 100 characters'),
  body('businessType')
    .optional()
    .isIn(['Textiles', 'Handicrafts', 'Jewelry', 'Pottery', 'Woodwork', 'Metalwork', 'Other'])
    .withMessage('Invalid business type'),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
], async (req: any, res: any) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          businessType: user.businessType,
          phone: user.phone,
          location: user.location,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authMiddleware, (req: any, res: any) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint is mainly for logging purposes
  logger.info(`User logged out: ${req.user?.id}`);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Development-only: quick user verification endpoint
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug-users', async (req: any, res: any) => {
    try {
      const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
      const count = await User.countDocuments();
      res.json({ success: true, count, recent: users.map(u => ({ id: u._id, email: u.email, createdAt: u.createdAt })) });
    } catch (error) {
      logger.error('Debug users fetch failed:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  });
}

export default router;
