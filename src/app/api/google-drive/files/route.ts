import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { OAuth2Client } from 'google-auth-library';
import { drive_v3 } from '@googleapis/drive';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { folderId = 'root', pageToken } = await request.json();

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

    // Check if token is expired and refresh if needed
    const now = new Date();
    if (tokenData.expiresAt <= now && tokenData.refreshToken) {
      // Refresh token logic would go here
      return NextResponse.json(
        { error: 'Token expired. Please re-authenticate.' },
        { status: 401 }
      );
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
    });

    const drive = new drive_v3.Drive({ auth: oauth2Client });

    const query = folderId === 'root' 
      ? "'root' in parents and trashed=false"
      : `'${folderId}' in parents and trashed=false`;

    const response = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, thumbnailLink)',
      pageSize: 50,
      pageToken: pageToken || undefined,
      orderBy: 'folder,name'
    });

    const files = response.data.files?.map((file: {
      id?: string | null;
      name?: string | null;
      mimeType?: string | null;
      size?: string | null;
      modifiedTime?: string | null;
      webViewLink?: string | null;
      thumbnailLink?: string | null;
    }) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder'
    })) || [];

    return NextResponse.json({
      files,
      nextPageToken: response.data.nextPageToken
    });
  } catch (error) {
    console.error('Google Drive files error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files from Google Drive' },
      { status: 500 }
    );
  }
}
