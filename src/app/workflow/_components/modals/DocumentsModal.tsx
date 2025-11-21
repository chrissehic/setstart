"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useCreateDocument } from "@/hooks/useDocuments";
import { toast } from "sonner";

// Keep the data model SUPER simple (as agreed):
export type ImportedFile = {
  id: string;
  name: string;
  type: "pdf" | "image";
  url: string; // blob url for now
  file: File; // Add the actual file for upload
};

// Props keep state lifting minimal and predictable
interface DocumentsModalProps {
  workflowId: string;
  children?: React.ReactNode;
  onImport?: (files: ImportedFile[]) => void; // Make optional since we're now handling uploads
  /** optional max size per file, default 25MB */
  maxFileSizeBytes?: number;
}

// Utility: narrow mime to our 2 allowed families
function toAcceptedType(mime: string): "pdf" | "image" | null {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  return null;
}

// Convert File -> ImportedFile with an object URL
function fileToImported(f: File): ImportedFile | null {
  const t = toAcceptedType(f.type);
  if (!t) return null;
  return {
    id: uuid(),
    name: f.name,
    type: t,
    url: URL.createObjectURL(f),
    file: f, // Store the actual file
  };
}

const DEFAULT_MAX = 25 * 1024 * 1024; // 25MB

// Main component
export const DocumentsModal: React.FC<DocumentsModalProps> = ({ workflowId, children, onImport, maxFileSizeBytes = DEFAULT_MAX }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ImportedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const createDocumentMutation = useCreateDocument();


  // Clean up blob URLs
  useEffect(() => {
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [items]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setItems([]);
      setErrors([]);
      setIsUploading(false);
    }
  }, [open]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newErrors: string[] = [];
      const next: ImportedFile[] = [];

      Array.from(files).forEach((file) => {
        const type = toAcceptedType(file.type);
        if (!type) {
          newErrors.push(`Unsupported file type: ${file.name}`);
          return;
        }
        if (file.size > maxFileSizeBytes) {
          newErrors.push(`File too large (> ${(maxFileSizeBytes / (1024 * 1024)).toFixed(0)}MB): ${file.name}`);
          return;
        }
        const imp = fileToImported(file);
        if (imp) {
          next.push(imp);
        }
      });

      setErrors((prev) => [...prev, ...newErrors]);
      if (next.length) setItems((prev) => [...prev, ...next]);
    },
    [maxFileSizeBytes]
  );

  const handleInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.target.files) {
        addFiles(e.target.files);
        // Reset input value after a small delay to prevent file explorer from reopening
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }, 100);
      }
    },
    [addFiles]
  );

  // Drag & drop with improved handling for nested elements and external files
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    let dragCounter = 0; // Counter to handle nested elements properly

    // Helper to check if the drag event contains files
    // For external files, types might not be available until drop, so we check multiple indicators
    const hasFiles = (e: DragEvent): boolean => {
      if (!e.dataTransfer) return false;
      
      // Check if files are already present (usually only on drop)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) return true;
      
      // Check dataTransfer types for file indicators
      const types = Array.from(e.dataTransfer.types || []);
      
      // Common file drag indicators
      if (types.includes('Files')) return true;
      if (types.includes('application/x-moz-file')) return true;
      
      // For external drags, if there are no text/html types, it's likely files
      // (web content drags usually have text/html or text/plain)
      if (types.length > 0 && !types.includes('text/html') && !types.includes('text/plain')) {
        // Likely external files
        return true;
      }
      
      // If no types at all, assume it might be external files (some browsers don't expose types)
      if (types.length === 0) return true;
      
      return false;
    };

    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onDragEnter = (e: DragEvent) => {
      // Be permissive - allow all drags over drop zone
      // External files might not expose types until drop
      const types = Array.from(e.dataTransfer?.types || []);
      
      // Skip if it's clearly web content (has text/html or text/uri-list but no Files)
      if (types.includes('text/html') && !types.includes('Files')) {
        return;
      }
      
      prevent(e);
      dragCounter++;
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      setIsDragging(true);
    };

    const onDragOver = (e: DragEvent) => {
      // Be permissive - allow all drags over drop zone
      // External files might not expose types until drop
      const types = Array.from(e.dataTransfer?.types || []);
      
      // Skip if it's clearly web content (has text/html but no Files)
      if (types.includes('text/html') && !types.includes('Files')) {
        return;
      }
      
      prevent(e);
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const onDragLeave = (e: DragEvent) => {
      prevent(e);
      dragCounter--;
      // Only set dragging to false when we've left the drop zone entirely
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const onDrop = (e: DragEvent) => {
      prevent(e);
      dragCounter = 0;
      setIsDragging(false);
      
      if (e.dataTransfer?.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    };

    // Add event listeners
    el.addEventListener("dragenter", onDragEnter, false);
    el.addEventListener("dragover", onDragOver, false);
    el.addEventListener("dragleave", onDragLeave, false);
    el.addEventListener("drop", onDrop, false);

    // Handle document-level drag events to prevent default browser behavior
    // This is important for external file drags
    const handleDocumentDragEnter = (e: DragEvent) => {
      // Don't prevent if it's over our drop zone
      if (el && el.contains(e.target as Node)) return;
      
      const types = Array.from(e.dataTransfer?.types || []);
      // Allow file drags but prevent web content drags
      if (types.length === 0 || hasFiles(e) || !types.includes('text/html')) {
        e.preventDefault();
      }
    };

    const handleDocumentDragOver = (e: DragEvent) => {
      // Don't prevent if it's over our drop zone
      if (el && el.contains(e.target as Node)) return;
      
      const types = Array.from(e.dataTransfer?.types || []);
      // Allow file drags but prevent web content drags
      if (types.length === 0 || hasFiles(e) || !types.includes('text/html')) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'none';
        }
      }
    };

    const handleDocumentDrop = (e: DragEvent) => {
      // Don't prevent if it's over our drop zone
      if (el && el.contains(e.target as Node)) return;
      
      // Always prevent default browser behavior for file drops outside drop zone
      // This prevents browser from opening files
      const types = Array.from(e.dataTransfer?.types || []);
      if (types.length === 0 || hasFiles(e) || !types.includes('text/html')) {
        e.preventDefault();
      }
    };

    // Use capture phase for document events to catch them early
    document.addEventListener("dragenter", handleDocumentDragEnter, true);
    document.addEventListener("dragover", handleDocumentDragOver, true);
    document.addEventListener("drop", handleDocumentDrop, true);

    return () => {
      el.removeEventListener("dragenter", onDragEnter, false);
      el.removeEventListener("dragover", onDragOver, false);
      el.removeEventListener("dragleave", onDragLeave, false);
      el.removeEventListener("drop", onDrop, false);
      document.removeEventListener("dragenter", handleDocumentDragEnter, true);
      document.removeEventListener("dragover", handleDocumentDragOver, true);
      document.removeEventListener("drop", handleDocumentDrop, true);
    };
  }, [addFiles]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const importDisabled = items.length === 0 || isUploading;

  const description = useMemo(
    () => "Import PDF or image files.",
    []
  );

  const handleImport = useCallback(async () => {
    if (items.length === 0) return;

    setIsUploading(true);
    const uploadPromises = items.map(async (item) => {
      try {
        // Upload file to server
        const formData = new FormData();
        formData.append('file', item.file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Create document in database
        const documentResult = await createDocumentMutation.mutateAsync({
          workflowId,
          name: item.name,
          fileUrl: uploadResult.url,
          fileType: item.type === 'pdf' ? 'pdf' : 'image',
          sizeBytes: item.file.size,
          metadata: JSON.stringify({
            originalName: item.name,
            mimeType: item.file.type,
            uploadedAt: new Date().toISOString(),
          }),
        });

        if (!documentResult.success) {
          throw new Error(documentResult.error || 'Failed to create document');
        }

        return { success: true, item };
      } catch (error) {
        console.error(`Error processing ${item.name}:`, error);
        return { success: false, item, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        toast.success(`Successfully uploaded ${successful.length} document${successful.length !== 1 ? 's' : ''}`);
      }

      if (failed.length > 0) {
        failed.forEach(f => {
          toast.error(`Failed to upload ${f.item.name}: ${f.error}`);
        });
      }

      // Call onImport callback if provided (for backward compatibility)
      if (onImport && successful.length > 0) {
        onImport(successful.map(r => r.item));
      }

      // Close modal if all uploads were successful
      if (failed.length === 0) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Error during import:', error);
      toast.error('Failed to import documents');
    } finally {
      setIsUploading(false);
    }
  }, [items, workflowId, createDocumentMutation, onImport]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Add documents</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Dropzone */}
          <div
            ref={dropRef}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-1 transition-all duration-200 cursor-pointer ${
              isDragging 
                ? "border-primary bg-primary/10 shadow-lg" 
                : "border-accent hover:border-primary/60 hover:bg-accent/5"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <div
              className={`transition-transform duration-200 ${
                isDragging ? "scale-110" : "scale-100"
              }`}
            >
              <Upload className="size-6" aria-hidden="true" />
            </div>
            <div 
              className={`transition-colors duration-200 ${
                isDragging ? "text-primary" : "text-foreground"
              }`}
            >
              {isDragging ? "Drop files here!" : "Drag & drop files here"}
            </div>
            <div className="text-xs text-muted-foreground">or</div>
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={isUploading}
            >
              Browse files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/*"
              multiple
              className="hidden"
              onChange={handleInputChange}
              disabled={isUploading}
            />
            <div className="text-xs text-muted-foreground mt-2">Accepted: PDF, images • Max {Math.round(maxFileSizeBytes / (1024 * 1024))}MB each</div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 text-sm text-red-600 space-y-1">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}

          {/* Preview list */}
          {items.length > 0 && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((it) => (
                <div key={it.id} className="border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden rounded-lg border">
                    {it.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.url} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-6 h-6" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground uppercase">{it.type}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(it.id)} 
                    aria-label={`Remove ${it.name}`}
                    disabled={isUploading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="ghost" className="rounded-2xl" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              className="rounded-2xl"
              disabled={importDisabled}
              onClick={handleImport}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Import ${items.length > 0 ? `(${items.length})` : ""}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentsModal;

