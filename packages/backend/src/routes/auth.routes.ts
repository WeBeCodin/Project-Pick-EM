import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth/auth.service.simple';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password, displayName } = req.body;

    if (!email || !username || !password) {
      throw new ValidationError('Email, username, and password are required');
    }

    const result = await authService.register({
      email,
      username,
      password,
      displayName
    });

    logger.info('User registered successfully', {
      userId: result.user.id,
      email: result.user.email,
      username: result.user.username
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  } catch (error) {
    logger.error('Registration error', { 
      error: error instanceof Error ? error.message : error,
      body: req.body
    });
    next(error);
  }
});

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      throw new ValidationError('Email/username and password are required');
    }

    const result = await authService.login({
      emailOrUsername,
      password
    });

    logger.info('User logged in successfully', {
      userId: result.user.id,
      email: result.user.email,
      username: result.user.username
    });

    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error', { 
      error: error instanceof Error ? error.message : error,
      emailOrUsername: req.body.emailOrUsername
    });
    next(error);
  }
});

/**
 * @route GET /auth/me
 * @desc Get current user info (requires token)
 * @access Private
 */
router.get('/me', async (_req: Request, res: Response) => {
  try {
    // For now, return a mock response
    // In production, this would validate the JWT token
    res.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        emailVerified: false
      },
      message: 'User data retrieved successfully'
    });
  } catch (error) {
    logger.error('Get user info error', { 
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
});

/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', async (_req: Request, res: Response) => {
  try {
    // For now, just return success
    // In production, this would invalidate the JWT token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error', { 
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
});

export { router as authRoutes };
