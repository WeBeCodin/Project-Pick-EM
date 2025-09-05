import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AuthService } from '../auth.service.simple';
import { UnauthorizedError, ConflictError } from '../../../utils/errors';

// Mock dependencies
jest.mock('../../../database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    }
  }
}));

jest.mock('../../../utils/logger');

import { prisma } from '../../../database';

describe('AuthService Simple', () => {
  let authService: AuthService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'plainPassword',
    displayName: 'Test User',
    emailVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'simplepass',
      displayName: 'New User'
    };

    it('should register a new user successfully', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);

      const result = await authService.register(validRegistrationData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toContain('mock-token-');
    });

    it('should throw ConflictError for existing email', async () => {
      const existingUserWithSameEmail = {
        ...mockUser,
        email: 'newuser@example.com' // Same as registration data
      };
      (prisma.user.findFirst as any).mockResolvedValue(existingUserWithSameEmail);

      await expect(authService.register(validRegistrationData))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    const validLoginData = {
      emailOrUsername: 'test@example.com',
      password: 'plainPassword'
    };

    it('should login user successfully', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(mockUser);

      const result = await authService.login(validLoginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedError for non-existent user', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      await expect(authService.login(validLoginData))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for wrong password', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(mockUser);

      const wrongPasswordData = {
        emailOrUsername: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(wrongPasswordData))
        .rejects.toThrow(UnauthorizedError);
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const result = await authService.validateUser('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const result = await authService.validateUser('non-existent');

      expect(result).toBeNull();
    });
  });
});
