"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { useState, useCallback, useEffect } from "react"

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
  placeholder,
}: {
  initialValue: string
  competitorId: string
  field: string
  onSave: (competitorId: string, field: string, value: string) => void
  placeholder?: string
}) {
  const [draftValue, setDraftValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update draft when initialValue changes (external updates)
  useEffect(() => {
    setDraftValue(initialValue)
  }, [initialValue])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftValue(e.target.value)
    setIsEditing(true)
  }, [])

  const handleBlur = useCallback(async () => {
    if (isEditing && draftValue !== initialValue) {
      setIsSaving(true)
      try {
        await onSave(competitorId, field, draftValue)
      } finally {
        setIsSaving(false)
      }
    }
    setIsEditing(false)
  }, [isEditing, draftValue, initialValue, onSave, competitorId, field])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur() // Trigger save on blur
    } else if (e.key === 'Escape') {
      setDraftValue(initialValue)
      setIsEditing(false)
      e.currentTarget.blur()
    }
  }, [initialValue])

  return (
    <div className="flex items-center gap-2">
      <Input
        variant="underline"
        value={draftValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
        disabled={isSaving}
      />
      {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}

export const createCompetitorColumns = (
  onSaveEdit: (competitorId: string, field: string, value: string) => void,
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
          placeholder="Competitor name"
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
          placeholder="Description"
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
          placeholder="Website URL"
        />
      )
    },
  },

  // Actions
  {
    id: "actions",
    header: "Actions",
    cell: () => {
      return (
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-full ">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )
    },
  },
]
