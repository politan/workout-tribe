import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// Extend Express Request interface to include user property with proper typing
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: mongoose.Types.ObjectId;
        [key: string]: any;
      };
    }
  }
}

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, location, preferences } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      location,
      preferences,
    });

    if (user) {
      const userId = user._id as mongoose.Types.ObjectId;
      res.status(201).json({
        success: true,
        user: {
          _id: userId.toString(),
          name: user.name,
          email: user.email,
          location: user.location,
          preferences: user.preferences,
          token: generateToken(userId.toString()),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      const userId = user._id as mongoose.Types.ObjectId;
      res.status(200).json({
        success: true,
        user: {
          _id: userId.toString(),
          name: user.name,
          email: user.email,
          location: user.location,
          preferences: user.preferences,
          token: generateToken(userId.toString()),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      const userId = user._id as mongoose.Types.ObjectId;
      res.status(200).json({
        success: true,
        user: {
          _id: userId.toString(),
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          location: user.location,
          preferences: user.preferences,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio || user.bio;
      
      if (req.body.location) {
        user.location = {
          ...user.location,
          ...req.body.location,
        };
      }
      
      if (req.body.preferences) {
        user.preferences = {
          ...user.preferences,
          ...req.body.preferences,
        };
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      const updatedUserId = updatedUser._id as mongoose.Types.ObjectId;
      
      res.status(200).json({
        success: true,
        user: {
          _id: updatedUserId.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
          bio: updatedUser.bio,
          location: updatedUser.location,
          preferences: updatedUser.preferences,
          token: generateToken(updatedUserId.toString()),
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Find nearby users
// @route   GET /api/users/nearby
// @access  Private
export const getNearbyUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { longitude, latitude, distance = 10, activities } = req.query;
    
    // Convert distance from kilometers to meters
    const radius = Number(distance) * 1000;
    
    let query: any = {
      _id: { $ne: (req.user._id as mongoose.Types.ObjectId).toString() }, // Exclude current user
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: radius,
        },
      },
    };
    
    // Filter by activities if provided
    if (activities) {
      const activitiesArray = (activities as string).split(',');
      query['preferences.activities'] = { $in: activitiesArray };
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(20);
    
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
