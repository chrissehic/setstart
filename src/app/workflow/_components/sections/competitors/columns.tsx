"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Loader2, MoreHorizontal, Trash2, Edit, Plus } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export type CompetitorColumn = {
  id: string
  name: string
  description?: string | null
  website?: string | null
  logoImage?: string | null
  attributes: Record<string, string | number | boolean>
  isNew?: boolean
  workflowId?: string
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
}: {
  initialValue: string
  competitorId: string
  field: string
  onSave: (competitorId: string, field: string, value: string) => void
  onNewRowFieldChange?: (field: string, value: string) => void
  onNewRowBlur?: (field: string, value: string) => void
  onSaveNew?: () => void
  isNewRow?: boolean
  placeholder?: string
  autoFocus?: boolean
}) {
  const [draftValue, setDraftValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update draft when initialValue changes (external updates)
  useEffect(() => {
    setDraftValue(initialValue)
  }, [initialValue])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDraftValue(value)
    setIsEditing(true)
    
    // For new rows, update the parent state immediately
    if (isNewRow && onNewRowFieldChange) {
      onNewRowFieldChange(field, value)
    }
  }, [isNewRow, onNewRowFieldChange, field])

  const handleBlur = useCallback(async () => {
    if (isNewRow) {
      // For new rows: if name is empty, discard; if has value, save
      if (field === 'name' && !draftValue.trim()) {
        // Name is empty, discard the row
        onNewRowBlur?.(field, draftValue)
        return
      }
      // Has value, save the row
      onSaveNew?.()
      return
    }
    
    // For existing rows: auto-save on change
    if (isEditing && draftValue !== initialValue) {
      setIsSaving(true)
      try {
        await onSave(competitorId, field, draftValue)
      } finally {
        setIsSaving(false)
      }
    }
    setIsEditing(false)
  }, [isNewRow, field, draftValue, isEditing, initialValue, onSave, competitorId, onNewRowBlur, onSaveNew])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isNewRow) {
        // For new rows, Enter saves if name has value
        if (field === 'name' && draftValue.trim()) {
          // Trigger save
          return
        }
        // Move to next field
        return
      }
      e.currentTarget.blur() // Trigger save on blur for existing rows
    } else if (e.key === 'Escape') {
      setDraftValue(initialValue)
      setIsEditing(false)
      e.currentTarget.blur()
    }
  }, [initialValue, isNewRow, field, draftValue])

  return (
    <div className="flex items-center gap-2">
      <Input
        variant="underline"
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
      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}

export const createCompetitorColumns = (
  onSaveEdit: (competitorId: string, field: string, value: string) => void,
  onNewRowFieldChange?: (field: string, value: string) => void,
  onNewRowBlur?: (field: string, value: string) => void,
  onSaveNew?: () => void,
  onDelete?: (competitorId: string) => void,
  customColumns?: Array<{ id: string; name: string; type: string; options?: string[] }>,
  onAddColumn?: () => void,
): ColumnDef<CompetitorColumn>[] => [
  // Name
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const c = row.original
      return (
        <EditableCell
          initialValue={c.name}
          competitorId={c.id}
          field="name"
          onSave={onSaveEdit}
          onNewRowFieldChange={onNewRowFieldChange}
          onNewRowBlur={onNewRowBlur}
          onSaveNew={onSaveNew}
          isNewRow={c.isNew}
          placeholder="Competitor name"
          autoFocus={c.isNew}
        />
      )
    },
  },

   // Website
   {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const c = row.original
      return (
        <EditableCell
          initialValue={c.website || ""}
          competitorId={c.id}
          field="website"
          onSave={onSaveEdit}
          onNewRowFieldChange={onNewRowFieldChange}
          onNewRowBlur={onNewRowBlur}
          onSaveNew={onSaveNew}
          isNewRow={c.isNew}
          placeholder="Website URL"
        />
      )
    },
  },

  // Description
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const c = row.original
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
          placeholder="Description"
        />
      )
    },
  },

  // Dynamic custom columns
  ...(customColumns || []).map((customCol) => ({
    id: customCol.id,
    accessorKey: `attributes.${customCol.name}`,
    header: () => (
      <div className="flex items-center justify-between w-full">
        <span>{customCol.name}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement column editing
            console.log("Edit column:", customCol.name);
          }}
        >
        </Button>
      </div>
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
          placeholder={customCol.name}
        />
      );
    },
  })),

  // Add Column Button Column
  {
    id: "addColumn",
    header: () => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-primary/10"
        onClick={onAddColumn}
        title="Add new column"
      >
        <Plus className="h-4 w-4" />
      </Button>
    ),
    cell: () => null, // No cell content needed
    enableSorting: false,
    enableHiding: false,
  },

  // Actions
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const c = row.original
      
      // Don't show actions for new rows
      if (c.isNew) {
        return null
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
                if (window.confirm("Are you sure you want to delete this competitor?")) {
                  onDelete?.(c.id);
                }
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
