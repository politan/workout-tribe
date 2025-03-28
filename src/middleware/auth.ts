import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';

// Extend Express Request interface to include user property
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

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }
      
      // Assign user to request object
      req.user = user as any;

      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is creator of resource
export const isCreator = (resourceModel: any) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resource = await resourceModel.findById(req.params.id);
    
    if (!resource) {
      res.status(404).json({ success: false, message: 'Resource not found' });
      return;
    }

    // Check if logged in user is the creator
    if (resource.creator.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized, not the creator' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
