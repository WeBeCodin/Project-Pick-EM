import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Registration request body:', body);
    
    const { username, email, displayName } = body;

    // Validate required fields
    if (!username || !email) {
      return NextResponse.json({
        success: false,
        error: 'Username and email are required'
      }, { status: 400 });
    }

    // Mock registration success
    const mockUser = {
      id: `user_${Date.now()}`,
      username,
      email,
      displayName: displayName || username,
      createdAt: new Date().toISOString()
    };

    const mockToken = `mock_token_${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        user: mockUser,
        token: mockToken,
        refreshToken: `refresh_${mockToken}`
      },
      message: 'User registered successfully (Demo Mode)'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Registration failed',
      message: 'Demo mode: Registration simulation failed'
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
