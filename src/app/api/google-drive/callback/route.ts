import { NextRequest, NextResponse } from 'next/server';
import google from '@googleapis/drive';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not found' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in session or database
    // For now, we'll return them to the client
    return NextResponse.json({ 
      success: true, 
      tokens,
      redirectUrl: state ? decodeURIComponent(state) : '/workflow'
    });
  } catch (error) {
    console.error('Google Drive callback error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Google Drive' },
      { status: 500 }
    );
  }
}
