"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers/getInitials";
import { useCompetitorMetadataExtraction } from "@/hooks/useCompetitorMetadataExtraction";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type CompetitorColumn = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logoImage?: string | null;
  attributes: Record<string, string | number | boolean>;
  isNew?: boolean;
  workflowId?: string;
};

// Simple input component (reverted to normal state)
function HybridInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  className,
  disabled = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <Input
      variant="underline"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={cn("w-full", className)}
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
}


// Cell component that manages its own draft state and auto-saves on blur
function EditableCell({
  initialValue,
  competitorId,
  field,
  onSave,
  onNewRowFieldChange,
  onNewRowBlur,
  onSaveNew,
  isNewRow,
  placeholder,
  autoFocus = false,
  className,
}: {
  initialValue: string;
  competitorId: string;
  field: string;
  onSave: (competitorId: string, field: string, value: string) => void;
  onNewRowFieldChange?: (field: string, value: string) => void;
  onNewRowBlur?: (field: string, value: string) => void;
  onSaveNew?: () => void;
  isNewRow?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const [draftValue, setDraftValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Update draft when initialValue changes (external updates)
  useEffect(() => {
    setDraftValue(initialValue);
  }, [initialValue]);

  // Listen for Ctrl key press/release for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    // Add event listeners to document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDraftValue(value);
      setIsEditing(true); // Mark as editing when user starts typing

      // For new rows, update the parent state immediately
      if (isNewRow && onNewRowFieldChange) {
        onNewRowFieldChange(field, value);
      }
    },
    [isNewRow, onNewRowFieldChange, field]
  );

  const handleBlur = useCallback(async () => {
    if (isNewRow) {
      // For new rows: if name is empty, discard; if has value, save
      if (field === "name" && !draftValue.trim()) {
        // Name is empty, discard the row
        onNewRowBlur?.(field, draftValue);
        return;
      }
      // Has value, save the row
      onSaveNew?.();
      return;
    }

    // For existing rows: auto-save on change
    if (isEditing && draftValue !== initialValue) {
      setIsSaving(true);
      try {
        await onSave(competitorId, field, draftValue);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  }, [
    isNewRow,
    field,
    draftValue,
    isEditing,
    initialValue,
    onSave,
    competitorId,
    onNewRowBlur,
    onSaveNew,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (isNewRow) {
          // For new rows, Enter saves if name has value
          if (field === "name" && draftValue.trim()) {
            // Trigger save
            return;
          }
          // Move to next field
          return;
        }
        e.currentTarget.blur(); // Trigger save on blur for existing rows
      } else if (e.key === "Escape") {
        setDraftValue(initialValue);
        setIsEditing(false);
        e.currentTarget.blur();
      }
    },
    [initialValue, isNewRow, field, draftValue]
  );

  // Check if the value looks like a URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hasValidUrl = draftValue.trim() && isValidUrl(draftValue.trim());

  return (
    <div className="flex items-center gap-2">
      {hasValidUrl ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "flex-1 transition-all duration-150",
                )}
                onMouseDown={(e: React.MouseEvent) => {
                  // Handle Ctrl+click to open URL
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const url = draftValue.trim();
                    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <HybridInput  
                  value={draftValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={cn(
                    "w-full transition-colors duration-150",
                    isNewRow && "border-2 border-dashed border-primary/50 bg-primary/5",
                    isCtrlPressed && "hover:underline hover:cursor-pointer",
                    className
                  )}
                  disabled={isSaving}
                  autoFocus={autoFocus}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ctrl+click to open</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <HybridInput
          value={draftValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full",
            isNewRow && "border-2 border-dashed border-primary/50 bg-primary/5",
            className
          )}
          disabled={isSaving}
          autoFocus={autoFocus}
        />
      )}
      {isSaving && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

// Website cell with metadata extraction
function WebsiteCell({
  initialValue,
  competitorId,
  field,
  onSave,
  onNewRowFieldChange,
  onNewRowBlur,
  onSaveNew,
  isNewRow,
  placeholder,
  autoFocus = false,
  onMetadataExtracted,
}: {
  initialValue: string;
  competitorId: string;
  field: string;
  onSave: (competitorId: string, field: string, value: string) => void;
  onNewRowFieldChange?: (field: string, value: string) => void;
  onNewRowBlur?: (field: string, value: string) => void;
  onSaveNew?: () => void;
  isNewRow?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onMetadataExtracted?: (metadata: { name: string; description: string; faviconUrl?: string; website?: string }) => void;
}) {
  const [draftValue, setDraftValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const { extractMetadata, isLoading: isExtractingMetadata } = useCompetitorMetadataExtraction();

  // Update draft when initialValue changes (external updates)
  useEffect(() => {
    setDraftValue(initialValue);
  }, [initialValue]);

  // Listen for Ctrl key press/release for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    // Add event listeners to document
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDraftValue(value);
      setIsEditing(true); // Mark as editing when user starts typing

      // For new rows, update the parent state immediately
      if (isNewRow && onNewRowFieldChange) {
        onNewRowFieldChange(field, value);
      }
    },
    [isNewRow, onNewRowFieldChange, field]
  );

  const handleBlur = useCallback(async () => {
    if (isNewRow) {
      // For new rows: if name is empty, discard; if has value, save
      if (field === "name" && !draftValue.trim()) {
        // Name is empty, discard the row
        onNewRowBlur?.(field, draftValue);
        return;
      }
      // Has value, save the row
      onSaveNew?.();
      return;
    }

    // For existing rows: auto-save on change
    if (isEditing && draftValue !== initialValue) {
      setIsSaving(true);
      try {
        await onSave(competitorId, field, draftValue);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  }, [
    isNewRow,
    field,
    draftValue,
    isEditing,
    initialValue,
    onSave,
    competitorId,
    onNewRowBlur,
    onSaveNew,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (isNewRow) {
          // For new rows, Enter saves if name has value
          if (field === "name" && draftValue.trim()) {
            // Trigger save
            return;
          }
          // Move to next field
          return;
        }
        e.currentTarget.blur(); // Trigger save on blur for existing rows
      } else if (e.key === "Escape") {
        setDraftValue(initialValue);
        setIsEditing(false);
        e.currentTarget.blur();
      }
    },
    [initialValue, isNewRow, field, draftValue]
  );

  // Check if the value looks like a URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hasValidUrl = draftValue.trim() && isValidUrl(draftValue.trim());

  const handleExtractMetadata = async () => {
    if (!hasValidUrl) return;
    
    const urlToSave = draftValue.trim();
    
    // Always save the URL first to ensure it's persisted, even if it matches initialValue
    setIsSaving(true);
    try {
      await onSave(competitorId, field, urlToSave);
      // Mark as no longer editing since we just saved
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
    
    const metadata = await extractMetadata(urlToSave);
    if (metadata && onMetadataExtracted) {
      onMetadataExtracted({
        name: metadata.name,
        description: metadata.description,
        faviconUrl: metadata.faviconUrl,
        website: urlToSave, // Pass the URL so it can be preserved
      });
    }
  };

  return (
    <div className="flex items-center gap-2 relative group/website">
      {hasValidUrl ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "flex-1 transition-all duration-150",
                )}
                onMouseDown={(e: React.MouseEvent) => {
                  // Handle Ctrl+click to open URL
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const url = draftValue.trim();
                    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <HybridInput  
                  value={draftValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={cn(
                    "w-full transition-colors duration-150",
                    isNewRow && "border-2 border-dashed border-primary/50 bg-primary/5",
                    isCtrlPressed && "hover:underline hover:cursor-pointer"
                  )}
                  disabled={isSaving}
                  autoFocus={autoFocus}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ctrl+click to open</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <HybridInput
          value={draftValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full",
            isNewRow && "border-2 border-dashed border-primary/50 bg-primary/5"
          )}
          disabled={isSaving}
          autoFocus={autoFocus}
        />
      )}
      
      {/* Metadata extraction button */}
      {hasValidUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="default"
                className="opacity-0 cursor-pointer group-hover/website:opacity-100 transition-opacity duration-100 shrink-0 absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleExtractMetadata}
              >
                {isExtractingMetadata ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Extract</span>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Extract metadata</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {isSaving && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

// Editable column header component
function EditableColumnHeader({
  columnId,
  columnName,
  onEdit,
  onDelete,
  isDeleting = false,
}: {
  columnId: string;
  columnName: string;
  onEdit: (columnId: string, newName: string) => void;
  onDelete: (columnId: string) => void;
  isDeleting?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(columnName);
  const [isSelected, setIsSelected] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setIsSelected(false);
  };

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== columnName) {
      onEdit(columnId, editValue.trim());
    }
    setIsEditing(false);
    setEditValue(columnName);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(columnName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 w-full capitalize">
        <Input
          variant="underline"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="h-8 text-sm border-0 p-0 focus:ring-0 focus:border-b-2 focus:border-primary"

        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between w-full group cursor-pointer capitalize"
      onMouseEnter={() => setIsSelected(true)}
      onMouseLeave={() => setIsSelected(false)}
    >
      <div
        className="flex-1 rounded hover:bg-accent/50 transition-colors"
        onClick={handleEdit}
        title="Click to edit column name"
      >
        {columnName}
      </div>
      {isSelected && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2 hover:bg-destructive/10 hover:text-destructive transition-all"
          onClick={(e) => {
            e.stopPropagation();
            if (
              window.confirm(
                `Are you sure you want to delete the column "${columnName}"? This will remove all data in this column.`
              )
            ) {
              onDelete(columnId);
            }
          }}
          title="Delete column"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-6" />
          )}
        </Button>
      )}
    </div>
  );
}

export const createCompetitorColumns = (
  onSaveEdit: (competitorId: string, field: string, value: string) => void,
  onNewRowFieldChange?: (field: string, value: string) => void,
  onNewRowBlur?: (field: string, value: string) => void,
  onSaveNew?: () => void,
  onDelete?: (competitorId: string) => void,
  customColumns?: Array<{
    id: string;
    name: string;
    type: string;
    options?: string[];
  }>,
  onAddColumn?: (columnName: string) => void,
  onEditColumn?: (columnId: string, columnName: string) => void,
  onDeleteColumn?: (columnId: string) => void,
  deletingColumns?: Set<string>,
  onMetadataExtracted?: (competitorId: string, metadata: { name: string; description: string; faviconUrl?: string }) => void
): ColumnDef<CompetitorColumn>[] => [
  // Name
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="relative">
          <Avatar className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 z-10">
            <AvatarImage 
              src={c.logoImage || undefined} 
              alt={c.name}
              className="bg-foreground"
            />
            <AvatarFallback className="text-xs font-medium bg-accent">
              {getInitials(c.name)}
            </AvatarFallback>
          </Avatar>
          <EditableCell
            initialValue={c.name}
            competitorId={c.id}
            field="name"
            onSave={onSaveEdit}
            onNewRowFieldChange={onNewRowFieldChange}
            onNewRowBlur={onNewRowBlur}
            onSaveNew={onSaveNew}
            isNewRow={c.isNew}
            autoFocus={c.isNew}
            className="pl-10"
          />
        </div>
      );
    },
  },

  // Website
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <WebsiteCell
          initialValue={c.website || ""}
          competitorId={c.id}
          field="website"
          onSave={onSaveEdit}
          onNewRowFieldChange={onNewRowFieldChange}
          onNewRowBlur={onNewRowBlur}
          onSaveNew={onSaveNew}
          isNewRow={c.isNew}
          placeholder="https://example.com"
          onMetadataExtracted={onMetadataExtracted ? (metadata) => onMetadataExtracted(c.id, metadata) : undefined}
        />
      );
    },
  },

  // Description
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <EditableCell
          initialValue={c.description || ""}
          competitorId={c.id}
          field="description"
          onSave={onSaveEdit}
          onNewRowFieldChange={onNewRowFieldChange}
          onNewRowBlur={onNewRowBlur}
          onSaveNew={onSaveNew}
          isNewRow={c.isNew}
        />
      );
    },
  },

  // Dynamic custom columns
  ...(customColumns || []).map((customCol) => ({
    id: customCol.id,
    accessorKey: `attributes.${customCol.name}`,
    header: () => (
      <EditableColumnHeader
        columnId={customCol.id}
        columnName={customCol.name}
        onEdit={onEditColumn || (() => {})}
        onDelete={onDeleteColumn || (() => {})}
        isDeleting={deletingColumns?.has(customCol.id) || false}
      />
    ),
    cell: ({ row }: { row: { original: CompetitorColumn } }) => {
      const c = row.original;
      const currentValue = String(c.attributes?.[customCol.name] || "");

      return (
        <EditableCell
          initialValue={currentValue}
          competitorId={c.id}
          field={`attributes.${customCol.name}`}
          onSave={onSaveEdit}
          onNewRowFieldChange={onNewRowFieldChange}
          onNewRowBlur={onNewRowBlur}
          onSaveNew={onSaveNew}
          isNewRow={c.isNew}
        />
      );
    },
  })),

  // New Attribute Column - Fixed at the end, editable header
  {
    id: "newAttribute",
    header: () => (
      <div className="flex items-center gap-2 sticky right-0">
        <Input
          variant="underline"
          placeholder="Add attribute..."
          className="h-8 text-sm border-0 p-0 focus:ring-0 focus:border-b-2 focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = e.currentTarget.value.trim();
              if (value) {
                onAddColumn?.(value); // Pass the column name
                e.currentTarget.value = ""; // Clear the input
              }
            }
          }}
          onBlur={(e) => {
            const value = e.currentTarget.value.trim();
            if (value) {
              onAddColumn?.(value); // Pass the column name
              e.currentTarget.value = ""; // Clear the input
            }
          }}
        />
      </div>
    ),
    cell: () => (
      <div className="h-8 flex items-center justify-center text-muted-foreground text-sm"></div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Actions
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const c = row.original;

      // Don't show actions for new rows
      if (c.isNew) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this competitor?"
                  )
                ) {
                  onDelete?.(c.id);
                }
              }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
