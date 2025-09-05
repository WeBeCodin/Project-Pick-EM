import { NextRequest, NextResponse } from 'next/server';

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

    // Mock login success
    const mockUser = {
      id: `user_${Date.now()}`,
      username: emailOrUsername,
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@demo.com`,
      displayName: emailOrUsername,
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
      message: 'Login successful (Demo Mode)'
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
