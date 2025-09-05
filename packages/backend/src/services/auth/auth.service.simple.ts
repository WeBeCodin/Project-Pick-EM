import { UnauthorizedError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { prisma } from '../../database';

// Simplified interfaces for MVP
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    emailVerified: boolean;
  };
  token: string; // Single token for now
}

export class AuthService {
  /**
   * Register a new user (simplified)
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      logger.info('Attempting user registration', { email: data.email, username: data.username });

      // Check for existing user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new ConflictError('Email address is already registered');
        }
        if (existingUser.username === data.username) {
          throw new ConflictError('Username is already taken');
        }
      }

      // For now, using a simple password (in production, would hash)
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: data.password, // TODO: Hash password
          displayName: data.displayName || null
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          emailVerified: true
        }
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user,
        token: `mock-token-${user.id}` // Mock token for now
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user (simplified)
   */
  async login(data: LoginData): Promise<AuthResult> {
    try {
      logger.info('Attempting user login', { identifier: data.emailOrUsername });

      // Find user by email or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.emailOrUsername },
            { username: data.emailOrUsername }
          ]
        },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          displayName: true,
          emailVerified: true,
          isActive: true
        }
      });

      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      if (!user.isActive) {
        throw new UnauthorizedError('Account has been deactivated');
      }

      // Simple password check (in production, would compare hashed)
      if (user.password !== data.password) {
        throw new UnauthorizedError('Invalid credentials');
      }

      logger.info('User login successful', { userId: user.id });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        token: `mock-token-${user.id}` // Mock token for now
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Validate user by ID (for middleware)
   */
  async validateUser(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      logger.error('User validation failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
