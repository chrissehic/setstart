import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This will be the Clerk userId

    if (!code || !state) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head><title>Google Drive Auth Error</title></head>
          <body>
            <h1>Authentication Error</h1>
            <p>Authorization code or user ID not found. Please try again.</p>
            <script>window.close();</script>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in database
    const expiresAt = new Date(tokens.expiry_date || Date.now() + 3600000);
    
    await prisma.googleDriveToken.upsert({
      where: { userId: state },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type || 'Bearer',
        scope: tokens.scope || '',
        expiresAt,
      },
      create: {
        userId: state,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type || 'Bearer',
        scope: tokens.scope || '',
        expiresAt,
      },
    });

    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head><title>Google Drive Auth Success</title></head>
        <body>
          <h1>Authentication Successful!</h1>
          <p>Google Drive has been connected to your account. You can close this window.</p>
          <script>
            window.opener?.postMessage({ type: 'GOOGLE_DRIVE_AUTH_SUCCESS' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Google Drive callback error:', error);
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head><title>Google Drive Auth Error</title></head>
        <body>
          <h1>Authentication Error</h1>
          <p>Failed to authenticate with Google Drive. Please try again.</p>
          <script>
            window.opener?.postMessage({ type: 'GOOGLE_DRIVE_AUTH_ERROR' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
