import { cookies } from 'next/headers';
import crypto from 'crypto';

// Create a persistent user ID based on email (survives logout/login)
export function getPersistentUserId(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex').substring(0, 16);
}

export interface SessionData {
  userId: string;
  username: string;
  email: string;
  persistentId: string;
}

// Simple session management using cookies
export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set('session', JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) return null;
    
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = cookies();
  cookieStore.delete('session');
}