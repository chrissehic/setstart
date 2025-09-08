"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Folder,
  Search,
  ArrowLeft,
  Download,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { GoogleDriveIcon } from "@/components/ui/GoogleDriveIcon";
import { cn } from "@/lib/utils";

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  isFolder: boolean;
}

interface GoogleDrivePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelected: (files: GoogleDriveFile[]) => void;
  workflowId: string;
}

export function GoogleDrivePicker({ 
  open, 
  onOpenChange, 
  onFilesSelected, 
  workflowId 
}: GoogleDrivePickerProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize authentication
  useEffect(() => {
    if (open && !isAuthenticated) {
      handleAuth();
    }
  }, [open, isAuthenticated]);

  // Load files when folder changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadFiles();
    }
  }, [currentFolder, isAuthenticated, accessToken]);

  const handleAuth = async () => {
    try {
      const response = await fetch('/api/google-drive/auth');
      const { authUrl } = await response.json();
      
      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        'google-drive-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for auth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check if we have tokens in localStorage
          const tokens = localStorage.getItem('google-drive-tokens');
          if (tokens) {
            const { access_token } = JSON.parse(tokens);
            setAccessToken(access_token);
            setIsAuthenticated(true);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const loadFiles = async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-drive/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, folderId: currentFolder })
      });
      
      const { files: fetchedFiles } = await response.json();
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folder: GoogleDriveFile) => {
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolder(folder.id);
  };

  const handleBackClick = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1].id : 'root');
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleDownloadSelected = async () => {
    if (selectedFiles.size === 0) return;

    setIsDownloading(true);
    try {
      const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));
      
      for (const file of selectedFileObjects) {
        if (!file.isFolder) {
          await fetch('/api/google-drive/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken,
              fileId: file.id,
              fileName: file.name,
              workflowId
            })
          });
        }
      }

      onFilesSelected(selectedFileObjects);
      onOpenChange(false);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (file: GoogleDriveFile) => {
    if (file.isFolder) {
      return <Folder className="h-6 w-6 text-blue-500" />;
    }
    
    if (file.mimeType?.startsWith('image/')) {
      return <FileText className="h-6 w-6 text-green-500" />;
    }
    
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (size?: string) => {
    if (!size) return '';
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GoogleDriveIcon className="h-6 w-6" />
            Select Files from Google Drive
          </DialogTitle>
          <DialogDescription>
            Choose files to import into your document library
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-12">
            <GoogleDriveIcon className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">Connect to Google Drive</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              You need to authenticate with Google Drive to access your files
            </p>
            <Button onClick={handleAuth}>
              <GoogleDriveIcon className="h-4 w-4 mr-2" />
              Connect Google Drive
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                disabled={folderPath.length === 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Drive</span>
                {folderPath.map((folder, index) => (
                  <span key={folder.id}>
                    <span className="mx-1">/</span>
                    <span>{folder.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Files Grid */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-6 w-6" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => (
                    <Card
                      key={file.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedFiles.has(file.id) && "ring-2 ring-primary"
                      )}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium truncate">
                              {file.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {file.isFolder ? (
                                <Badge variant="secondary">Folder</Badge>
                              ) : (
                                <>
                                  <span>{file.mimeType?.split('/')[1]?.toUpperCase()}</span>
                                  {file.size && <span>• {formatFileSize(file.size)}</span>}
                                </>
                              )}
                            </div>
                          </div>
                          {selectedFiles.has(file.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDownloadSelected}
                  disabled={selectedFiles.size === 0 || isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Import Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
