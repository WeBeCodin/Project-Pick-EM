import { NextRequest, NextResponse } from 'next/server';
import { createSession, getPersistentUserId } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrUsername } = body;

    // Validate required fields
    if (!emailOrUsername) {
      return NextResponse.json({
        success: false,
        error: 'Email or username is required'
      }, { status: 400 });
    }

    // Determine if it's an email or username
    const isEmail = emailOrUsername.includes('@');
    const email = isEmail ? emailOrUsername : `${emailOrUsername}@demo.com`;
    const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername;

    // Generate persistent ID from email
    const persistentId = getPersistentUserId(email);

    // Create session with persistent ID
    const sessionData = {
      userId: `session_${Date.now()}`, // Temporary session ID
      persistentId, // Permanent ID that survives logout/login
      username,
      email
    };

    await createSession(sessionData);

    // Return user data with persistent ID
    const mockUser = {
      id: persistentId, // Use persistent ID as the main ID
      username,
      email,
      displayName: username,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      user: mockUser, // Simplified response format
      message: 'Login successful with persistent session'
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Login failed',
      message: 'Demo mode: Login simulation failed'
    }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}
