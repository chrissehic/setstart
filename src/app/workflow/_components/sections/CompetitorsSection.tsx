"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import type { Competitor } from "@/types/workflow"
import { cn } from "@/lib/utils"
import { AlertCircleIcon, Loader2, Plus, Trophy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SECTION_CLASS } from "@/lib/constants"
import { useCompetitors, useAddCompetitor, useUpdateCompetitor } from "@/hooks/useCompetitors"
import { DataTable } from "./competitors/data-table"
import { createCompetitorColumns } from "./competitors/columns"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"


type CompetitorsSectionProps = {
  workflowId: string
}

function CompetitorsSection({ workflowId }: CompetitorsSectionProps) {
  const [search, setSearch] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [showValidationError, setShowValidationError] = useState(false)
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    description: "",
    website: "",
  })
  const [rowData, setRowData] = useState<Record<string, { name: string; description: string; website: string }>>({})
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set())

  const { data: competitors = [], isLoading, error, refetch } = useCompetitors(workflowId)
  const addCompetitorMutation = useAddCompetitor(workflowId)
  const updateCompetitorMutation = useUpdateCompetitor(workflowId)

  const initialData = useMemo(() => {
    const data: Record<string, { name: string; description: string; website: string }> = {}
    competitors.forEach((competitor: Competitor) => {
      data[competitor.id] = {
        name: competitor.name,
        description: competitor.description || "",
        website: competitor.website || "",
      }
    })
    return data
  }, [competitors])

  useEffect(() => {
    // Only update rowData when competitors data actually changes
    // Use a ref to track if this is the first load
    setRowData(initialData)
  }, [initialData])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRows.size > 0) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [dirtyRows])

  const filteredCompetitors = useMemo(() => {
    if (!search.trim()) return competitors

    return competitors.filter(
      (competitor: Competitor) =>
        competitor.name.toLowerCase().includes(search.toLowerCase()) ||
        competitor.description?.toLowerCase().includes(search.toLowerCase()) ||
        competitor.website?.toLowerCase().includes(search.toLowerCase()),
    )
  }, [competitors, search])

  const handleAddCompetitor = () => {
    setIsAddingNew(true)
    setShowValidationError(false)
    setNewCompetitor({
      name: "",
      description: "",
      website: "",
    })
  }

  const handleSaveNew = async () => {
    if (!newCompetitor.name.trim()) {
      setShowValidationError(true)
      return
    }

    try {
      await addCompetitorMutation.mutateAsync({
        name: newCompetitor.name.trim(),
        description: newCompetitor.description.trim() || "",
        website: newCompetitor.website.trim() || "",
        logoImage: "",
        attributes: {},
      })

      toast.success("Competitor added successfully")
      setIsAddingNew(false)
      setShowValidationError(false)
      setNewCompetitor({ name: "", description: "", website: "" })
      refetch()
    } catch (error) {
      console.error("Error saving competitor:", error)
      toast.error("Failed to add competitor")
    }
  }

  const handleCancelNew = () => {
    setIsAddingNew(false)
    setShowValidationError(false)
    setNewCompetitor({ name: "", description: "", website: "" })
  }

  const handleNameChange = (name: string) => {
    setNewCompetitor((prev) => ({ ...prev, name }))
    if (showValidationError && name.trim()) {
      setShowValidationError(false)
    }
  }

  const handleDescriptionChange = (description: string) => {
    setNewCompetitor((prev) => ({ ...prev, description }))
  }

  const handleWebsiteChange = (website: string) => {
    setNewCompetitor((prev) => ({ ...prev, website }))
  }





  const handleCancelEdit = useCallback(
    (competitorId: string) => {
      if (window.confirm("Are you sure you want to discard your changes?")) {
        const competitor = competitors.find((c) => c.id === competitorId)
        if (competitor) {
          setRowData((prev) => ({
            ...prev,
            [competitorId]: {
              name: competitor.name,
              description: competitor.description || "",
              website: competitor.website || "",
            },
          }))
        }

        setDirtyRows((prev) => {
          const newSet = new Set(prev)
          newSet.delete(competitorId)
          return newSet
        })
      }
    },
    [competitors],
  )

  const handleFieldChange = useCallback((competitorId: string, field: string, value: string) => {
    setRowData((prev) => ({
      ...prev,
      [competitorId]: {
        ...prev[competitorId],
        [field]: value,
      },
    }))

    setDirtyRows((prev) => new Set(prev).add(competitorId))
  }, [])

  // Simplified save handler for cell-level editing
  const handleCellSave = useCallback((competitorId: string, field: string, value: string) => {
    // Update the rowData immediately for the cell that was edited
    setRowData((prev) => ({
      ...prev,
      [competitorId]: {
        ...prev[competitorId],
        [field]: value,
      },
    }))

    // Mark as dirty so save/cancel buttons show
    setDirtyRows((prev) => new Set(prev).add(competitorId))
  }, [])

  // Auto-save handler that saves to backend when cell loses focus
  const handleAutoSave = useCallback(async (competitorId: string, field: string, value: string) => {
    // First update local state
    handleCellSave(competitorId, field, value)

    try {
      // Get current data for this competitor
      const currentData = rowData[competitorId] || {
        name: '',
        description: '',
        website: '',
      }

      // Update with the new field value
      const updatedData = {
        ...currentData,
        [field]: value,
      }

      // Save to backend
      await updateCompetitorMutation.mutateAsync({
        id: competitorId,
        name: updatedData.name,
        description: updatedData.description,
        website: updatedData.website,
      })

      // Clear dirty state for this row
      setDirtyRows((prev) => {
        const newSet = new Set(prev)
        newSet.delete(competitorId)
        return newSet
      })

      refetch()
    } catch (error) {
      console.error("Error updating competitor:", error)
      toast.error("Failed to update competitor")
      // Revert the local change on error
      handleCancelEdit(competitorId)
    }
  }, [handleCellSave, rowData, updateCompetitorMutation, refetch, handleCancelEdit])

  const getCurrentValue = useCallback(
    (competitorId: string, field: string): string => {
      return rowData[competitorId]?.[field as keyof (typeof rowData)[string]] || ""
    },
    [rowData],
  )



  // Render new competitor input
  const renderNewCompetitorInput = useCallback((field: string, placeholder: string, hasError = false) => {
    const value = newCompetitor[field as keyof typeof newCompetitor] || ""
    
    return (
      <Input
        variant="underline"
        value={value}
        onChange={(e) => {
          if (field === "name") {
            handleNameChange(e.target.value)
          } else if (field === "description") {
            handleDescriptionChange(e.target.value)
          } else if (field === "website") {
            handleWebsiteChange(e.target.value)
          }
        }}
        placeholder={hasError ? "Competitor name is required" : placeholder}
        className={cn(
          "w-full",
          hasError && "bg-destructive/40 !border-destructive placeholder:text-destructive/60"
        )}
      />
    )
  }, [newCompetitor, handleNameChange, handleDescriptionChange, handleWebsiteChange, showValidationError])

  if (error) {
    return (
      <div className={cn("flex flex-col justify-start gap-2 w-full", SECTION_CLASS)}>
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col justify-start gap-2 w-full", SECTION_CLASS)}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">Competitor Analysis</h3>
              <p className="text-sm text-muted-foreground">Track and analyze your competitors to stay ahead</p>
            </div>
            <Button onClick={handleAddCompetitor}>
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                {!isAddingNew && filteredCompetitors.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Trophy className="size-8 stroke-muted-foreground stroke-1" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">No competitors yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start tracking your competitors to understand the market landscape
                    </p>
                    <Button onClick={handleAddCompetitor} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Competitor
                    </Button>
                  </div>
                )}
                


                {(isAddingNew || filteredCompetitors.length > 0) && (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search competitors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    {/* New competitor form */}
                    {isAddingNew && (
                      <div className="border rounded-lg p-4 bg-muted/20">
                        <h4 className="font-medium mb-3">Add New Competitor</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Name</label>
                            {renderNewCompetitorInput("name", "Competitor name", showValidationError)}
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            {renderNewCompetitorInput("description", "Description")}
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Website</label>
                            {renderNewCompetitorInput("website", "https://example.com")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveNew}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelNew}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Existing competitors table */}
                    <DataTable
                      columns={createCompetitorColumns(
                        handleAutoSave,
                      )}
                      data={filteredCompetitors.map((competitor) => {
                        const currentData = rowData[competitor.id] || {
                          name: competitor.name,
                          description: competitor.description || "",
                          website: competitor.website || "",
                        }
                        return {
                          id: competitor.id,
                          name: currentData.name,
                          description: currentData.description,
                          website: currentData.website,
                          logoImage: competitor.logoImage,
                          attributes: competitor.attributes,
                          isNew: false,
                          workflowId: competitor.workflowId,
                        }
                      })}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
  )
}

export default CompetitorsSection
