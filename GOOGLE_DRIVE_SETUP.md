# Google Drive Integration Setup

This project includes Google Drive integration for importing documents. Follow these steps to set it up:

## 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and enable it

## 2. OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Set application type to "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/google-drive/callback` (for development)
   - `https://yourdomain.com/api/google-drive/callback` (for production)
5. Copy the Client ID and Client Secret

## 3. Environment Variables

Add these to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Package Used

This integration uses `@googleapis/drive` - a lightweight, focused package that only includes Google Drive API functionality, minimizing bundle size compared to the full `googleapis` package.

## 5. Features

- **Authentication**: Users can connect their Google Drive account
- **File Browser**: Browse folders and files in Google Drive
- **File Selection**: Select multiple files for import
- **File Download**: Automatically download and save files to your document library
- **File Types**: Supports PDFs and images

## 6. Usage

1. Click "Add Document" in the Documents section
2. Select "Connect Google Drive" from the dropdown
3. Authenticate with Google Drive
4. Browse and select files to import
5. Click "Import Selected" to add them to your document library

## 7. API Endpoints

- `GET /api/google-drive/auth` - Get Google Drive authentication URL
- `GET /api/google-drive/callback` - Handle OAuth callback
- `POST /api/google-drive/files` - List files from Google Drive
- `POST /api/google-drive/download` - Download files from Google Drive
