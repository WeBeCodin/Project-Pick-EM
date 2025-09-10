import { NextRequest, NextResponse } from 'next/server';

interface MockUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  isActive: boolean;
  role: string;
}

// This route provides user authentication data, primarily for development/testing
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would verify JWT tokens and return user data
    // For now, we'll simulate user authentication based on headers or query params
    
    const authHeader = request.headers.get('authorization');
    const userIdHeader = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get('userId');
    
    // Mock user data - in production this would come from JWT verification
    const mockUsers: Record<string, MockUser> = {
      'demo-user': {
        id: 'demo-user',
        username: 'demo-user',
        email: 'demo@example.com',
        displayName: 'Demo User',
        emailVerified: true,
        isActive: true,
        role: 'user'
      },
      'user_tfcdesigns': {
        id: 'user_tfcdesigns',
        username: 'tfcdesigns',
        email: 'tfc@designs.com',
        displayName: 'TFC Designs',
        emailVerified: true,
        isActive: true,
        role: 'user'
      },
      'tfcdesigns': {
        id: 'user_tfcdesigns',
        username: 'tfcdesigns',
        email: 'tfc@designs.com',
        displayName: 'TFC Designs',
        emailVerified: true,
        isActive: true,
        role: 'user'
      }
    };

    // Determine which user to return
    let userId = 'demo-user'; // default
    
    if (queryUserId && mockUsers[queryUserId]) {
      userId = queryUserId;
    } else if (userIdHeader && mockUsers[userIdHeader]) {
      userId = userIdHeader;
    } else if (authHeader) {
      // In real implementation, decode JWT here
      // For now, try to extract user info from auth header
      try {
        const token = authHeader.replace('Bearer ', '');
        // Mock JWT decode - in reality would verify signature
        if (token.includes('tfcdesigns') || token.includes('tfc')) {
          userId = 'user_tfcdesigns';
        }
      } catch (error) {
        console.log('Token parsing error:', error);
      }
    }

    const user = mockUsers[userId] || mockUsers['demo-user'];

    console.log('🔐 Auth/me returning user:', userId, user.displayName);

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 401 });
  }
}
