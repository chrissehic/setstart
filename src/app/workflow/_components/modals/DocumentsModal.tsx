"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import { motion } from "framer-motion";

// Keep the data model SUPER simple (as agreed):
export type ImportedFile = {
  id: string;
  name: string;
  type: "pdf" | "image";
  url: string; // blob url for now
};

// Props keep state lifting minimal and predictable
interface DocumentsModalProps {
  workflowId: string;
  children?: React.ReactNode;
  onImport: (files: ImportedFile[]) => void; // returns normalized files
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
  };
}

const DEFAULT_MAX = 25 * 1024 * 1024; // 25MB

// Main component
export const DocumentsModal: React.FC<DocumentsModalProps> = ({ workflowId, children, onImport, maxFileSizeBytes = DEFAULT_MAX }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ImportedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        if (imp) next.push(imp);
      });

      setErrors((prev) => [...prev, ...newErrors]);
      if (next.length) setItems((prev) => [...prev, ...next]);
    },
    [maxFileSizeBytes]
  );

  const handleInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.target.files) addFiles(e.target.files);
      // reset input so the same file can be selected again if needed
      if (inputRef.current) inputRef.current.value = "";
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
    const onEnter = (e: DragEvent) => {
      prevent(e);
      setIsDragging(true);
    };
    const onOver = (e: DragEvent) => {
      prevent(e);
    };
    const onLeave = (e: DragEvent) => {
      prevent(e);
      setIsDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      prevent(e);
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
    };

    el.addEventListener("dragenter", onEnter);
    el.addEventListener("dragover", onOver);
    el.addEventListener("dragleave", onLeave);
    el.addEventListener("drop", onDrop);

    return () => {
      el.removeEventListener("dragenter", onEnter);
      el.removeEventListener("dragover", onOver);
      el.removeEventListener("dragleave", onLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [addFiles]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const importDisabled = items.length === 0;

  const description = useMemo(
    () => "Import PDF or image files. No categories, statuses, or extra metadata—keeping it simple.",
    []
  );

  const handleImport = useCallback(() => {
    onImport(items);
    setOpen(false);
  }, [onImport, items]);

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
          <motion.div
            ref={dropRef}
            initial={{ scale: 1 }}
            animate={{ scale: isDragging ? 1.01 : 1 }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-3 transition ${
              isDragging ? "border-muted-foreground/70 bg-muted/40" : "border-muted-foreground/30"
            }`}
          >
            <Upload className="w-8 h-8" aria-hidden="true" />
            <div className="text-sm">Drag & drop files here</div>
            <div className="text-xs text-muted-foreground">or</div>
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl"
              onClick={() => inputRef.current?.click()}
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
            />
            <div className="text-xs text-muted-foreground mt-2">Accepted: PDF, images • Max {Math.round(maxFileSizeBytes / (1024 * 1024))}MB each</div>
          </motion.div>

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
                  <Button variant="ghost" size="icon" onClick={() => removeItem(it.id)} aria-label={`Remove ${it.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="ghost" className="rounded-2xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-2xl"
              disabled={importDisabled}
              onClick={handleImport}
            >
              Import {items.length > 0 ? `(${items.length})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentsModal;

