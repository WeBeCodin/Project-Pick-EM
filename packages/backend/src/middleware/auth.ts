import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const getUserIdFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return (req.headers['x-user-id'] as string) || null;
};

export const authenticateToken = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      throw new AppError('Authentication token is required. Use Bearer token or x-user-id header.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn(`Authentication failed: User not found with ID: ${userId}`);
      throw new AppError('User not found. Please provide a valid user ID.', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: 'user',
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const isAdmin = req.headers['x-admin'] === 'true';
    if (!isAdmin) {
      throw new AppError('Admin access required', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: 'user',
        };
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};