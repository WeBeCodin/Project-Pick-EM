import * as bcrypt from 'bcrypt';
import { logger } from '../../utils/logger';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordService {
  private readonly saltRounds = 12; // OWASP recommended

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      logger.debug('Hashing password');
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      logger.debug('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain text password with a hashed password
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      logger.debug('Comparing password');
      const isMatch = await bcrypt.compare(password, hashedPassword);
      logger.debug(`Password comparison result: ${isMatch}`);
      return isMatch;
    } catch (error) {
      logger.error('Error comparing password:', error);
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Validate password strength according to OWASP guidelines
   */
  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    // Minimum length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length check (prevent DoS)
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common password patterns (basic check)
    const commonPatterns = [
      /^123456/,
      /^password/i,
      /^qwerty/i,
      /^admin/i,
      /^letmein/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns and is not secure');
        break;
      }
    }

    // Sequential characters check
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password should not contain repeated characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Check if password has been compromised (placeholder for future integration with HaveIBeenPwned API)
   */
  async isPasswordCompromised(password: string): Promise<boolean> {
    // TODO: Integrate with HaveIBeenPwned API
    // For now, just check against a small list of most common passwords
    const commonPasswords = [
      '123456', 'password', '123456789', '12345678', '12345',
      '111111', '1234567', 'sunshine', 'qwerty', 'iloveyou',
      'admin', 'welcome', 'monkey', 'login', 'abc123'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }
}
