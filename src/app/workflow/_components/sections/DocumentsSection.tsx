"use client";

import React, { useState, useMemo, memo, useCallback, Suspense } from "react";
import Image from "next/image";
import { useQueryState, parseAsString } from "nuqs";

declare global {
  interface Window {
    gapi: typeof gapi;
    google: unknown;
  }
}

import {
  FileText,
  Upload,
  Trash2,
  MoreVertical,
  FileImage,
  X,
  ChevronDown,
  Plus,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { GoogleDriveIcon } from "@/components/ui/GoogleDriveIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  useDocuments,
  useDeleteDocument,
  useCreateDocument,
  useCreateEditableDocument,
} from "@/hooks/useDocuments";
import { DocumentsModal } from "../modals/DocumentsModal";
import DocumentDetailPane from "../documents/DocumentDetailPane";
// Removed GoogleDrivePicker import - using native Google Picker instead
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DocumentsSectionProps {
  workflowId: string;
}

export function DocumentsSection({ workflowId }: DocumentsSectionProps) {
  const [search] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showGoogleDriveCard, setShowGoogleDriveCard] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{
    open: boolean;
    documentId: string | null;
    documentName: string | null;
  }>({ open: false, documentId: null, documentName: null });
  const [selectedDocumentId, setSelectedDocumentId] = useQueryState(
    "document",
    parseAsString.withOptions({ history: "push" })
  );
  // Remove modal state since we're using native picker

  // Handle Google Drive file selection
  const handleGoogleDriveFilesSelected = async (
    files: Array<{
      id: string;
      name: string;
      mimeType: string;
      size?: string;
      modifiedTime?: string;
      webViewLink?: string;
      thumbnailLink?: string;
      isFolder: boolean;
    }>
  ) => {
    console.log("Files imported from Google Drive:", files);

    // Process each file
    for (const file of files) {
      if (file.isFolder) {
        console.log("Skipping folder:", file.name);
        continue;
      }

      try {
        // Download the file from Google Drive using the correct API
        const downloadResponse = await fetch("/api/google-drive/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: file.id,
            fileName: file.name,
            workflowId: workflowId,
          }),
        });

        if (!downloadResponse.ok) {
          console.error("Failed to download file:", file.name);
          continue;
        }

        const downloadResult = await downloadResponse.json();

        if (!downloadResult.success) {
          console.error("Download failed:", downloadResult.error);
          continue;
        }

        // Save to database using the file info from the download API
        await createDocumentMutation.mutateAsync({
          workflowId,
          name: downloadResult.file.name,
          fileUrl: downloadResult.file.fileUrl,
          fileType: downloadResult.file.fileType,
          sizeBytes: parseInt(downloadResult.file.size || "0"),
          metadata: JSON.stringify({
            googleDriveId: file.id,
            webViewLink: file.webViewLink,
            thumbnailLink: file.thumbnailLink,
            mimeType: file.mimeType,
            modifiedTime: file.modifiedTime,
          }),
        });

        console.log("Successfully imported file:", file.name);
      } catch (error) {
        console.error("Error importing file:", file.name, error);
      }
    }
  };

  const { data: documents = [], isLoading } = useDocuments(workflowId);
  const deleteDocumentMutation = useDeleteDocument();
  const createDocumentMutation = useCreateDocument();
  const createEditableDocumentMutation = useCreateEditableDocument();

  // Handle Google Drive file selection using native picker
  const handleGoogleDriveAuth = async () => {
    try {
      // First check if we already have a valid token
      const tokenResponse = await fetch("/api/google-drive/token");
      if (tokenResponse.ok) {
        // We have a valid token, open picker directly
        openGooglePicker();
        return;
      }

      // No valid token, start auth flow
      const response = await fetch("/api/google-drive/auth");
      const { authUrl } = await response.json();

      // Open popup for OAuth
      window.open(
        authUrl,
        "google-drive-auth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      // Listen for postMessage from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "GOOGLE_DRIVE_AUTH_SUCCESS") {
          // Open Google Picker after successful auth
          openGooglePicker();
          window.removeEventListener("message", handleMessage);
        } else if (event.data.type === "GOOGLE_DRIVE_AUTH_ERROR") {
          console.error("Google Drive authentication failed");
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const openGooglePicker = async () => {
    try {
      // Get the access token from our API
      const tokenResponse = await fetch("/api/google-drive/token");
      const { accessToken } = await tokenResponse.json();

      if (!accessToken) {
        console.error("No access token available");
        return;
      }

      // Load Google Picker API
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load("picker", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const googlePicker = window.google as any;
          const picker = new googlePicker.picker.PickerBuilder()
            .addView(googlePicker.picker.ViewId.DOCS)
            .setOAuthToken(accessToken)
            .enableFeature(googlePicker.picker.Feature.MULTISELECT_ENABLED)
            .setCallback(
              (data: {
                action: string;
                docs: Array<{
                  id: string;
                  name: string;
                  mimeType: string;
                  sizeBytes?: string;
                  url?: string;
                  thumbnailUrl?: string;
                }>;
              }) => {
                if (data.action === googlePicker.picker.Action.PICKED) {
                  const files = data.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.name,
                    mimeType: doc.mimeType,
                    size: doc.sizeBytes?.toString(),
                    webViewLink: doc.url,
                    thumbnailLink: doc.thumbnailUrl,
                    isFolder:
                      doc.mimeType === "application/vnd.google-apps.folder",
                  }));
                  handleGoogleDriveFilesSelected(files);
                }
              }
            )
            .build();
          picker.setVisible(true);
        });
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error("Error opening Google Picker:", error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return (
          <div className="text-destructive">
          <svg
            className="size-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-4 0 40 40"
            fill="currentColor"
          >
            <path
              d="M25.6686 26.0962C25.1812 26.2401 24.4656 26.2563 23.6984 26.145C22.875 26.0256 22.0351 25.7739 21.2096 25.403C22.6817 25.1888 23.8237 25.2548 24.8005 25.6009C25.0319 25.6829 25.412 25.9021 25.6686 26.0962ZM17.4552 24.7459C17.3953 24.7622 17.3363 24.7776 17.2776 24.7939C16.8815 24.9017 16.4961 25.0069 16.1247 25.1005L15.6239 25.2275C14.6165 25.4824 13.5865 25.7428 12.5692 26.0529C12.9558 25.1206 13.315 24.178 13.6667 23.2564C13.9271 22.5742 14.193 21.8773 14.468 21.1894C14.6075 21.4198 14.7531 21.6503 14.9046 21.8814C15.5948 22.9326 16.4624 23.9045 17.4552 24.7459ZM14.8927 14.2326C14.958 15.383 14.7098 16.4897 14.3457 17.5514C13.8972 16.2386 13.6882 14.7889 14.2489 13.6185C14.3927 13.3185 14.5105 13.1581 14.5869 13.0744C14.7049 13.2566 14.8601 13.6642 14.8927 14.2326ZM9.63347 28.8054C9.38148 29.2562 9.12426 29.6782 8.86063 30.0767C8.22442 31.0355 7.18393 32.0621 6.64941 32.0621C6.59681 32.0621 6.53316 32.0536 6.44015 31.9554C6.38028 31.8926 6.37069 31.8476 6.37359 31.7862C6.39161 31.4337 6.85867 30.8059 7.53527 30.2238C8.14939 29.6957 8.84352 29.2262 9.63347 28.8054ZM27.3706 26.1461C27.2889 24.9719 25.3123 24.2186 25.2928 24.2116C24.5287 23.9407 23.6986 23.8091 22.7552 23.8091C21.7453 23.8091 20.6565 23.9552 19.2582 24.2819C18.014 23.3999 16.9392 22.2957 16.1362 21.0733C15.7816 20.5332 15.4628 19.9941 15.1849 19.4675C15.8633 17.8454 16.4742 16.1013 16.3632 14.1479C16.2737 12.5816 15.5674 11.5295 14.6069 11.5295C13.948 11.5295 13.3807 12.0175 12.9194 12.9813C12.0965 14.6987 12.3128 16.8962 13.562 19.5184C13.1121 20.5751 12.6941 21.6706 12.2895 22.7311C11.7861 24.0498 11.2674 25.4103 10.6828 26.7045C9.04334 27.3532 7.69648 28.1399 6.57402 29.1057C5.8387 29.7373 4.95223 30.7028 4.90163 31.7107C4.87693 32.1854 5.03969 32.6207 5.37044 32.9695C5.72183 33.3398 6.16329 33.5348 6.6487 33.5354C8.25189 33.5354 9.79489 31.3327 10.0876 30.8909C10.6767 30.0029 11.2281 29.0124 11.7684 27.8699C13.1292 27.3781 14.5794 27.011 15.985 26.6562L16.4884 26.5283C16.8668 26.4321 17.2601 26.3257 17.6635 26.2153C18.0904 26.0999 18.5296 25.9802 18.976 25.8665C20.4193 26.7844 21.9714 27.3831 23.4851 27.6028C24.7601 27.7883 25.8924 27.6807 26.6589 27.2811C27.3486 26.9219 27.3866 26.3676 27.3706 26.1461ZM30.4755 36.2428C30.4755 38.3932 28.5802 38.5258 28.1978 38.5301H3.74486C1.60224 38.5301 1.47322 36.6218 1.46913 36.2428L1.46884 3.75642C1.46884 1.6039 3.36763 1.4734 3.74457 1.46908H20.263L20.2718 1.4778V7.92396C20.2718 9.21763 21.0539 11.6669 24.0158 11.6669H30.4203L30.4753 11.7218L30.4755 36.2428ZM28.9572 10.1976H24.0169C21.8749 10.1976 21.7453 8.29969 21.7424 7.92417V2.95307L28.9572 10.1976ZM31.9447 36.2428V11.1157L21.7424 0.871022V0.823357H21.6936L20.8742 0H3.74491C2.44954 0 0 0.785336 0 3.75711V36.2435C0 37.5427 0.782956 40 3.74491 40H28.2001C29.4952 39.9997 31.9447 39.2143 31.9447 36.2428Z"
              fill="currentColor"
            />
          </svg>
          </div>
        );
      case "image":
        return (
          <FileImage className="size-12 stroke-muted-foreground stroke-1" />
        );
      default:
        return (
          <FileText className="size-12 text-foreground stroke-1" />
        );
    }
  };

  const formatFileSize = (size?: string | number) => {
    if (size === undefined || size === null) return "";
    const bytes = typeof size === "number" ? size : parseInt(size);
    if (isNaN(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatFileName = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) return fileName; // No extension

    const name = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);

    // Only truncate if the total length would be too long for the container
    // Allow more characters since we removed CSS truncation
    if (fileName.length > 30) {
      return `${name.substring(0, 27)}...${extension}`;
    }

    return fileName;
  };

  // Calculate document counts
  const documentCounts = useMemo(() => {
    const total = documents.length;
    const pdfs = documents.filter((d) => d.fileType === "pdf").length;
    const images = documents.filter((d) => d.fileType === "image").length;

    return { total, pdfs, images };
  }, [documents]);

  // Filter documents based on search and type filter
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (search) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((doc) => doc.fileType === typeFilter);
    }

    return filtered;
  }, [search, typeFilter, documents]);

  // Handle filter toggle
  const handleFilterToggle = useCallback((filterType: string) => {
    setTypeFilter((current) => (current === filterType ? "all" : filterType));
  }, []);

  // Memoize document deletion handler
  const handleDeleteDocument = useCallback(
    async (documentId: string) => {
      try {
        await deleteDocumentMutation.mutateAsync({ documentId, workflowId });
        setShowDeleteDialog({
          open: false,
          documentId: null,
          documentName: null,
        });
        // If the deleted document was selected, close the detail pane
        if (selectedDocumentId === documentId) {
          setSelectedDocumentId(null);
        }
      } catch {
        // Error handling is now done in the hook
      }
    },
    [
      deleteDocumentMutation,
      workflowId,
      selectedDocumentId,
      setSelectedDocumentId,
    ]
  );

  const confirmDeleteDocument = useCallback(() => {
    if (showDeleteDialog.documentId) {
      handleDeleteDocument(showDeleteDialog.documentId);
    }
  }, [showDeleteDialog.documentId, handleDeleteDocument]);

  // Image component with skeleton loading state
  const ImageWithSkeleton = memo(
    ({ src, alt }: { src: string; alt: string }) => {
      const [isLoading, setIsLoading] = useState(true);
      const [hasError, setHasError] = useState(false);

      if (hasError) {
        return (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, 
              hsl(var(--primary) / 0.1) 0%, 
              hsl(var(--primary) / 0.05) 50%, 
              hsl(var(--accent) / 0.1) 100%)`,
            }}
          >
            <div className="text-center">{getFileIcon("image")}</div>
          </div>
        );
      }

      return (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-accent animate-pulse z-0">
              <Skeleton className="h-full w-full rounded-none" />
            </div>
          )}
          <Image
            src={src}
            alt={alt}
            fill
            className={`object-cover group-hover/document:scale-105 transition-all duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            loading="lazy"
            unoptimized={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </>
      );
    }
  );

  ImageWithSkeleton.displayName = "ImageWithSkeleton";

  // Memoize document card component with comparison function
  const DocumentCard = memo(
    ({ document }: { document: (typeof documents)[0] }) => (
      <Card
        key={document.id}
        className="hover:shadow-md col-span-1 py-0 w-full h-fill cursor-pointer group/document hover:bg-muted transition-all duration-300 overflow-hidden"
        onClick={() => {
          if (document.isEditable) {
            setSelectedDocumentId(document.id);
          } else if (document.fileUrl) {
            window.open(document.fileUrl, "_blank");
          }
        }}
      >
        {/* Document Preview Header */}
        <div className="relative h-32 w-full overflow-hidden">
          {document.fileType === "image" && document.fileUrl ? (
            <Suspense
              fallback={
                <div className="absolute inset-0 bg-accent animate-pulse">
                  <Skeleton className="h-full w-full rounded-none" />
                </div>
              }
            >
              <ImageWithSkeleton src={document.fileUrl} alt={document.name} />
            </Suspense>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, 
                hsl(var(--primary) / 0.1) 0%, 
                hsl(var(--primary) / 0.05) 50%, 
                hsl(var(--accent) / 0.1) 100%)`,
              }}
            >
              <div className="text-center">
                {getFileIcon(document.fileType || "default")}
              </div>
            </div>
          )}
        </div>

        {/* Document Content */}
        <CardHeader className="">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 w-full">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-medium text-accent-foreground group-hover/document:text-primary-foreground transition-colors">
                  {formatFileName(document.name)}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {formatFileSize(document.sizeBytes ?? undefined)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover/document:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog({
                        open: true,
                        documentId: document.id,
                        documentName: document.name,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>
    ),
    (prevProps, nextProps) => {
      // Return true if props are equal (skip re-render), false if different (re-render)
      return (
        prevProps.document.id === nextProps.document.id &&
        prevProps.document.name === nextProps.document.name &&
        prevProps.document.fileUrl === nextProps.document.fileUrl &&
        prevProps.document.fileType === nextProps.document.fileType &&
        prevProps.document.sizeBytes === nextProps.document.sizeBytes
      );
    }
  );

  DocumentCard.displayName = "DocumentCard";

  // Helper function for table icon (smaller size)
  const getTableFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return (
          <svg
            className="size-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-4 0 40 40"
            fill="none"
          >
            <path
              d="M25.6686 26.0962C25.1812 26.2401 24.4656 26.2563 23.6984 26.145C22.875 26.0256 22.0351 25.7739 21.2096 25.403C22.6817 25.1888 23.8237 25.2548 24.8005 25.6009C25.0319 25.6829 25.412 25.9021 25.6686 26.0962ZM17.4552 24.7459C17.3953 24.7622 17.3363 24.7776 17.2776 24.7939C16.8815 24.9017 16.4961 25.0069 16.1247 25.1005L15.6239 25.2275C14.6165 25.4824 13.5865 25.7428 12.5692 26.0529C12.9558 25.1206 13.315 24.178 13.6667 23.2564C13.9271 22.5742 14.193 21.8773 14.468 21.1894C14.6075 21.4198 14.7531 21.6503 14.9046 21.8814C15.5948 22.9326 16.4624 23.9045 17.4552 24.7459ZM14.8927 14.2326C14.958 15.383 14.7098 16.4897 14.3457 17.5514C13.8972 16.2386 13.6882 14.7889 14.2489 13.6185C14.3927 13.3185 14.5105 13.1581 14.5869 13.0744C14.7049 13.2566 14.8601 13.6642 14.8927 14.2326ZM9.63347 28.8054C9.38148 29.2562 9.12426 29.6782 8.86063 30.0767C8.22442 31.0355 7.18393 32.0621 6.64941 32.0621C6.59681 32.0621 6.53316 32.0536 6.44015 31.9554C6.38028 31.8926 6.37069 31.8476 6.37359 31.7862C6.39161 31.4337 6.85867 30.8059 7.53527 30.2238C8.14939 29.6957 8.84352 29.2262 9.63347 28.8054ZM27.3706 26.1461C27.2889 24.9719 25.3123 24.2186 25.2928 24.2116C24.5287 23.9407 23.6986 23.8091 22.7552 23.8091C21.7453 23.8091 20.6565 23.9552 19.2582 24.2819C18.014 23.3999 16.9392 22.2957 16.1362 21.0733C15.7816 20.5332 15.4628 19.9941 15.1849 19.4675C15.8633 17.8454 16.4742 16.1013 16.3632 14.1479C16.2737 12.5816 15.5674 11.5295 14.6069 11.5295C13.948 11.5295 13.3807 12.0175 12.9194 12.9813C12.0965 14.6987 12.3128 16.8962 13.562 19.5184C13.1121 20.5751 12.6941 21.6706 12.2895 22.7311C11.7861 24.0498 11.2674 25.4103 10.6828 26.7045C9.04334 27.3532 7.69648 28.1399 6.57402 29.1057C5.8387 29.7373 4.95223 30.7028 4.90163 31.7107C4.87693 32.1854 5.03969 32.6207 5.37044 32.9695C5.72183 33.3398 6.16329 33.5348 6.6487 33.5354C8.25189 33.5354 9.79489 31.3327 10.0876 30.8909C10.6767 30.0029 11.2281 29.0124 11.7684 27.8699C13.1292 27.3781 14.5794 27.011 15.985 26.6562L16.4884 26.5283C16.8668 26.4321 17.2601 26.3257 17.6635 26.2153C18.0904 26.0999 18.5296 25.9802 18.976 25.8665C20.4193 26.7844 21.9714 27.3831 23.4851 27.6028C24.7601 27.7883 25.8924 27.6807 26.6589 27.2811C27.3486 26.9219 27.3866 26.3676 27.3706 26.1461ZM30.4755 36.2428C30.4755 38.3932 28.5802 38.5258 28.1978 38.5301H3.74486C1.60224 38.5301 1.47322 36.6218 1.46913 36.2428L1.46884 3.75642C1.46884 1.6039 3.36763 1.4734 3.74457 1.46908H20.263L20.2718 1.4778V7.92396C20.2718 9.21763 21.0539 11.6669 24.0158 11.6669H30.4203L30.4753 11.7218L30.4755 36.2428ZM28.9572 10.1976H24.0169C21.8749 10.1976 21.7453 8.29969 21.7424 7.92417V2.95307L28.9572 10.1976ZM31.9447 36.2428V11.1157L21.7424 0.871022V0.823357H21.6936L20.8742 0H3.74491C2.44954 0 0 0.785336 0 3.75711V36.2435C0 37.5427 0.782956 40 3.74491 40H28.2001C29.4952 39.9997 31.9447 39.2143 31.9447 36.2428Z"
              fill="#EB5757"
            />
          </svg>
        );
      case "image":
        return (
          <FileImage className="size-5 stroke-muted-foreground stroke-1" />
        );
      default:
        return (
          <FileText className="size-5 fill-primary stroke-secondary stroke-1.5" />
        );
    }
  };

  // Define table columns
  const columns = useMemo<ColumnDef<(typeof documents)[0]>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const document = row.original;
          return (
            <div
              className="flex items-center gap-3 text-sm text-accent-foreground transition-colors"
              onClick={() => {
                if (document.isEditable) {
                  setSelectedDocumentId(document.id);
                } else if (document.fileUrl) {
                  window.open(document.fileUrl, "_blank");
                }
              }}
            >
              <div className="flex-shrink-0">
                {getTableFileIcon(document.fileType || "default")}
              </div>
              <span className="font-medium">{document.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "fileType",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.fileType || "document";
          return (
            <span className="text-sm text-muted-foreground">
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: "sizeBytes",
        header: "Size",
        cell: ({ row }) => {
          const size = formatFileSize(row.original.sizeBytes ?? undefined);
          return (
            <span className="text-sm text-muted-foreground">{size || "-"}</span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const document = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog({
                        open: true,
                        documentId: document.id,
                        documentName: document.name,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [setSelectedDocumentId, setShowDeleteDialog]
  );

  // Table view component
  const DocumentsTableView = memo(() => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
      data: filteredDocuments,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnFiltersChange: () => {},
      state: { sorting, columnFilters },
    });

    return (
      <div className="rounded-md border">
        <div className="relative overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  });

  DocumentsTableView.displayName = "DocumentsTableView";

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 space-y-6 pb-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Documents grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <div className="relative h-32 w-full overflow-hidden">
                  <Skeleton className="h-full w-full rounded-none" />
                </div>
                <CardHeader>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If a document is selected, show its detail pane and hide the header/list
  if (selectedDocumentId) {
    const selectedDocument = documents.find(
      (doc) => doc.id === selectedDocumentId
    );
    if (selectedDocument && selectedDocument.isEditable) {
      return (
        <div className="flex flex-col w-full h-full">
          <DocumentDetailPane
            document={selectedDocument}
            onBack={() => setSelectedDocumentId(null)}
          />
        </div>
      );
    }
  }

  // Always render the main structure
  return (
    <div className="flex flex-col w-full">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 backdrop-blur-3xl bg-card border-b border-border/50 py-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
            <p className="text-sm text-muted-foreground">
              Store and manage PDFs and images for your business
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4" />
                  Add Document
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const result =
                        await createEditableDocumentMutation.mutateAsync({
                          workflowId,
                          name: "Untitled Document",
                        });
                      if (result.success && result.document) {
                        setSelectedDocumentId(result.document.id);
                      }
                    } catch (error) {
                      console.error("Failed to create document:", error);
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create new document
                </DropdownMenuItem>
                <DocumentsModal
                  workflowId={workflowId}
                  onGoogleDriveClick={handleGoogleDriveAuth}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Upload className="h-4 w-4" />
                    Upload a file
                  </DropdownMenuItem>
                </DocumentsModal>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filter Badges - only show when there are documents and multiple types */}
        {documents.length > 0 && (
          <div className="flex items-center gap-2 justify-between">
            {(documentCounts.pdfs > 0 || documentCounts.images > 0) && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={typeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterToggle("all")}
                  className="h-8"
                >
                  All ({documentCounts.total})
                </Button>
                {documentCounts.pdfs > 0 && (
                  <Button
                    variant={typeFilter === "pdf" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterToggle("pdf")}
                    className="h-8"
                  >
                    PDFs ({documentCounts.pdfs})
                  </Button>
                )}
                {documentCounts.images > 0 && (
                  <Button
                    variant={typeFilter === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterToggle("image")}
                    className="h-8"
                  >
                    Images ({documentCounts.images})
                  </Button>
                )}
              </div>
            )}

            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value === "grid" || value === "table") {
                  setViewMode(value);
                }
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-h-0">
        {/* Conditional content based on whether documents exist */}
        {documents.length === 0 ? (
          /* Empty state with Google Drive card */
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="space-y-4">
                {/* Google Drive Connection Card */}
                {showGoogleDriveCard && (
                  <Card className="hover:shadow-md col-span-1 w-full justify-between cursor-pointer group/document hover:bg-muted transition-all duration-300 border-solid border-2 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 w-full">
                          <GoogleDriveIcon className="size-6 mt-1" />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium text-accent-foreground truncate overflow-hidden wrap-anywhere text-ellipsis line-clamp-2 group-hover/document:text-primary-foreground transition-colors">
                              Connect Google Drive
                            </CardTitle>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              Import documents from Google Drive
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowGoogleDriveCard(false);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoogleDriveAuth();
                          }}
                        >
                          Connect Google Drive
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Empty state */}
                <Card className="border-none shadow-none">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <FileText className="size-8 stroke-muted-foreground stroke-1" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No documents yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                      Start building your document library by uploading PDFs and
                      images that are relevant to your business.
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Upload className="h-4 w-4" />
                          Add Document
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const result =
                                await createEditableDocumentMutation.mutateAsync(
                                  {
                                    workflowId,
                                    name: "Untitled Document",
                                  }
                                );
                              if (result.success && result.document) {
                                setSelectedDocumentId(result.document.id);
                              }
                            } catch (error) {
                              console.error(
                                "Failed to create document:",
                                error
                              );
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Create new document
                        </DropdownMenuItem>
                        <DocumentsModal
                          workflowId={workflowId}
                          onGoogleDriveClick={handleGoogleDriveAuth}
                        >
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Upload className="h-4 w-4" />
                            Upload a file
                          </DropdownMenuItem>
                        </DocumentsModal>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const result =
                      await createEditableDocumentMutation.mutateAsync({
                        workflowId,
                        name: "Untitled Document",
                      });
                    if (result.success && result.document) {
                      setSelectedDocumentId(result.document.id);
                    }
                  } catch (error) {
                    console.error("Failed to create document:", error);
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                Create new document
              </ContextMenuItem>
              <DocumentsModal workflowId={workflowId}>
                <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                  <Upload className="h-4 w-4" />
                  Import a file
                </ContextMenuItem>
              </DocumentsModal>
              {/* <ContextMenuItem onClick={(e) => {
              e.stopPropagation();
              handleGoogleDriveAuth();
            }}>
              <GoogleDriveIcon className="h-4 w-4" />
              Connect to Drive
            </ContextMenuItem> */}
            </ContextMenuContent>
          </ContextMenu>
        ) : /* Documents list when documents exist */
        viewMode === "grid" ? (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index}>
                    <div className="relative h-32 w-full overflow-hidden">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardHeader>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </Suspense>
        ) : (
          <DocumentsTableView />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog.open}
        onOpenChange={(open) =>
          setShowDeleteDialog({ ...showDeleteDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {showDeleteDialog.documentName}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setShowDeleteDialog({
                  open: false,
                  documentId: null,
                  documentName: null,
                })
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
