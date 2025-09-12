import bcrypt from 'bcrypt';
import { config } from '../../config';

/**
 * PasswordService handles hashing and comparing passwords using bcrypt.
 */
export class PasswordService {
  /** Hash a plain password using configured rounds (default 12). */
  async hash(plain: string): Promise<string> {
    const rounds = Number(config.BCRYPT_ROUNDS) || 12;
    return bcrypt.hash(plain, rounds);
  }

  /** Compare a plain password to a bcrypt hash. */
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}

export const passwordService = new PasswordService();
