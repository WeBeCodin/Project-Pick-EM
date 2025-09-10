import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll simulate getting user info from headers or localStorage simulation
    // In a real app, this would validate JWT tokens
    
    // Get user info from query params (for testing)
    const { searchParams } = new URL(request.url);
    const testUserId = searchParams.get('userId');
    
    if (testUserId) {
      return NextResponse.json({
        success: true,
        user: {
          id: testUserId,
          username: testUserId === 'demo-user' ? 'demo-user' : 'tfcdesigns',
          email: testUserId === 'demo-user' ? 'demo@example.com' : 'tfc@example.com',
          displayName: testUserId === 'demo-user' ? 'Demo User' : 'TFC Designs'
        }
      });
    }
    
    // Default user for testing
    return NextResponse.json({
      success: true,
      user: {
        id: 'demo-user',
        username: 'demo-user', 
        email: 'demo@example.com',
        displayName: 'Demo User'
      }
    });
    
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get user info'
    }, { status: 500 });
  }
}
