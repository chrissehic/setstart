import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public/uploads');

  try {
    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    return NextResponse.json({ success: false, error: 'Could not create upload directory' }, { status: 500 });
  }

  // Create a unique filename to avoid overwriting
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const path = join(uploadDir, filename);

  try {
    await writeFile(path, buffer);

    // Return the public URL of the file
    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Error saving file' }, { status: 500 });
  }
}
