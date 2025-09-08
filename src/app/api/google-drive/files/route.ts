import { NextRequest, NextResponse } from 'next/server';
import google from '@googleapis/drive';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, folderId = 'root', pageToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

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
