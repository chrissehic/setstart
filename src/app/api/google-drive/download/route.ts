import { NextRequest, NextResponse } from 'next/server';
import google from '@googleapis/drive';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, fileId, fileName, workflowId } = await request.json();

    if (!accessToken || !fileId || !fileName || !workflowId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get file metadata first
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name, mimeType, size'
    });

    // Download the file
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedFileName}`;
    const filePath = join(uploadDir, filename);

    // Convert stream to buffer and save
    const chunks: Buffer[] = [];
    for await (const chunk of response.data) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    await writeFile(filePath, buffer);

    // Determine file type
    const mimeType = fileMetadata.data.mimeType || '';
    let fileType = 'pdf';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType.includes('pdf')) {
      fileType = 'pdf';
    }

    return NextResponse.json({
      success: true,
      file: {
        name: fileMetadata.data.name,
        fileType,
        fileUrl: `/uploads/${filename}`,
        size: fileMetadata.data.size
      }
    });
  } catch (error) {
    console.error('Google Drive download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file from Google Drive' },
      { status: 500 }
    );
  }
}
