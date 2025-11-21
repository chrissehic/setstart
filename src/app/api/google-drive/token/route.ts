import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get stored tokens
    const tokenData = await prisma.googleDriveToken.findUnique({
      where: { userId }
    });

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Google Drive not connected. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Check if token is expired
    const now = new Date();
    if (tokenData.expiresAt <= now) {
      return NextResponse.json(
        { error: 'Token expired. Please re-authenticate.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      accessToken: tokenData.accessToken 
    });
  } catch (error) {
    console.error('Google Drive token error:', error);
    return NextResponse.json(
      { error: 'Failed to get access token' },
      { status: 500 }
    );
  }
}
