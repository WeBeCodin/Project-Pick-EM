import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  try {
    await deleteSession();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}