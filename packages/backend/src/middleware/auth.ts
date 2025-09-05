import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Extended Request interface to include user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Temporary auth middleware - replace with JWT implementation later
 * For now, uses x-user-id header for testing purposes
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Temporary: Use x-user-id header for testing
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      throw new AppError('Authentication required. Please provide x-user-id header.', 401);
    }

    // Set user on request object
    req.user = {
      id: userId,
      email: `${userId}@test.com`,
      role: 'user'
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin authentication middleware
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Temporary: Check for admin header
    const isAdmin = req.headers['x-admin'] === 'true';
    
    if (!isAdmin) {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Sets user if present but doesn't require it
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (userId) {
      req.user = {
        id: userId,
        email: `${userId}@test.com`,
        role: 'user'
      };
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
};
