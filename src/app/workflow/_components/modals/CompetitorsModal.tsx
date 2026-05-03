"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, FileSpreadsheet, Trash2, Loader2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AddTableIllustration,
  ReplaceTableIllustration,
} from "./CompetitorImportIllustrations";

// Keep the data model simple for CSV import
export type ImportedCsvFile = {
  id: string;
  name: string;
  url: string; // blob url for preview
  file: File; // actual file for processing
};

export type CompetitorCsvImportMode = "append" | "replace";

// Props following the same pattern as DocumentsModal
interface CompetitorsModalProps {
  workflowId: string;
  children?: React.ReactNode;
  /** Controlled open state. When set, `children` is not used as a trigger. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, show append vs replace radios (replace clears other competitors; company row is kept). */
  showImportModeChoice?: boolean;
  onImport?: (files: ImportedCsvFile[], mode: CompetitorCsvImportMode) => void;
  /** optional max size per file, default 10MB */
  maxFileSizeBytes?: number;
}

// Utility: check if file is CSV/Excel
function isAcceptedType(mime: string, fileName: string): boolean {
  const validTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];
  
  const validExtensions = [".csv", ".xls", ".xlsx"];
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  
  return validTypes.includes(mime) || validExtensions.includes(fileExtension);
}

// Convert File -> ImportedCsvFile with an object URL
function fileToImported(f: File): ImportedCsvFile | null {
  if (!isAcceptedType(f.type, f.name)) return null;
  
  return {
    id: uuid(),
    name: f.name,
    url: URL.createObjectURL(f),
    file: f,
  };
}

const DEFAULT_MAX = 10 * 1024 * 1024; // 10MB

// Main component
export const CompetitorsModal: React.FC<CompetitorsModalProps> = ({ 
  workflowId,
  children, 
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showImportModeChoice = false,
  onImport, 
  maxFileSizeBytes = DEFAULT_MAX 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      controlledOnOpenChange?.(next);
    },
    [isControlled, controlledOnOpenChange]
  );
  const [importMode, setImportMode] = useState<CompetitorCsvImportMode>("append");
  const [items, setItems] = useState<ImportedCsvFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [items]);

  // Reset state when closed; default import mode when opened
  useEffect(() => {
    if (!open) {
      setItems([]);
      setErrors([]);
      setIsUploading(false);
    } else {
      setImportMode("append");
    }
  }, [open]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newErrors: string[] = [];
      const next: ImportedCsvFile[] = [];

      Array.from(files).forEach((file) => {
        if (!isAcceptedType(file.type, file.name)) {
          newErrors.push(`Unsupported file type: ${file.name}. Please use CSV, XLS, or XLSX files.`);
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
        // Reset input value
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }, 100);
      }
    },
    [addFiles]
  );

  // Drag & drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onDragEnter = (e: DragEvent) => {
      prevent(e);
      setIsDragging(true);
    };

    const onDragOver = (e: DragEvent) => {
      prevent(e);
      e.dataTransfer!.dropEffect = 'copy';
    };

    const onDragLeave = (e: DragEvent) => {
      prevent(e);
      if (!el.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };

    const onDrop = (e: DragEvent) => {
      prevent(e);
      setIsDragging(false);
      
      if (e.dataTransfer?.files?.length) {
        addFiles(e.dataTransfer.files);
      }
    };

    // Add event listeners
    el.addEventListener("dragenter", onDragEnter);
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("dragleave", onDragLeave);
    el.addEventListener("drop", onDrop);

    // Prevent default browser behavior
    const handleDocumentDrag = (e: DragEvent) => {
      if (e.target === el) return;
      e.preventDefault();
    };

    document.addEventListener("dragover", handleDocumentDrag);
    document.addEventListener("drop", handleDocumentDrag);

    return () => {
      el.removeEventListener("dragenter", onDragEnter);
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("dragleave", onDragLeave);
      el.removeEventListener("drop", onDrop);
      document.removeEventListener("dragover", handleDocumentDrag);
      document.removeEventListener("drop", handleDocumentDrag);
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
    () => "Import competitor data from CSV or Excel files.",
    []
  );

  const handleImport = useCallback(async () => {
    if (items.length === 0) return;

    setIsUploading(true);
    
    try {
      if (onImport) {
        await Promise.resolve(onImport(items, importMode));
      } else {
        toast.info("CSV import functionality will be implemented soon");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      handleOpenChange(false);
    } catch (error) {
      console.error('Error during import:', error);
      toast.error('Failed to import competitors');
    } finally {
      setIsUploading(false);
    }
  }, [items, onImport, importMode, handleOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        className="sm:max-w-xl rounded-2xl p-0 overflow-hidden"
        id={`competitors-import-dialog-${workflowId}`}
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Import competitors</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {showImportModeChoice ? (
            <div className="space-y-2">
              <Label>
                Table update
              </Label>
              <RadioGroup
                value={importMode}
                onValueChange={(v) =>
                  setImportMode(v as CompetitorCsvImportMode)
                }
                className="grid grid-cols-2 gap-2"
                aria-label="How to import"
              >
                <label
                  className={cn(
                    "flex cursor-pointer flex-col gap-3 rounded-2xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring sm:p-4",
                    importMode === "append"
                      ? "border-primary bg-primary/30"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-start">
                    <AddTableIllustration />
                  </div>
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value="append"
                      id="csv-import-append"
                      className="mt-0.5 shrink-0 hidden"
                    />
                    <span className="min-w-0 space-y-0.5">
                      <span className="block font-medium">
                        Keep existing competitors
                      </span>
                      <span className="block text-sm text-muted-foreground leading-snug">
                        Add after current table and append rows from your file.
                      </span>
                    </span>
                  </div>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer flex-col gap-3 rounded-2xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring sm:p-4",
                    importMode === "replace"
                      ? "border-primary bg-primary/30"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-start">
                    <ReplaceTableIllustration />
                  </div>
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value="replace"
                      id="csv-import-replace"
                      className="mt-0.5 shrink-0 hidden"
                    />
                    <span className="min-w-0 space-y-0.5">
                      <span className="block font-medium">
                        Replace table completely
                      </span>
                      <span className="block text-sm text-muted-foreground leading-snug">
                        Remove other competitors first (your company row stays).
                        Then apply the import.
                      </span>
                    </span>
                  </div>
                </label>
              </RadioGroup>
            </div>
          ) : null}

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
              {isDragging ? "Drop CSV file here!" : "Drag & drop CSV file here"}
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
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={handleInputChange}
              disabled={isUploading}
            />
            <div className="text-xs text-muted-foreground mt-2">
              Accepted: CSV, XLS, XLSX • Max {Math.round(maxFileSizeBytes / (1024 * 1024))}MB
            </div>
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
                    <FileSpreadsheet className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(it.file.size / 1024).toFixed(1)} KB
                    </div>
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
            <Button variant="ghost" className="rounded-2xl" onClick={() => handleOpenChange(false)} disabled={isUploading}>
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
                  Processing...
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

export default CompetitorsModal;
