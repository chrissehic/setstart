"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Competitor } from "@/types/workflow";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  Loader2,
  Plus,
  Trophy,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SECTION_CLASS } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCompetitors,
  useAddCompetitor,
  useUpdateCompetitor,
  useDeleteCompetitor,
  useCompetitorTableColumns,
  useDeleteCompetitorTableColumn,
} from "@/hooks/useCompetitors";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "./competitors/data-table";
import { createCompetitorColumns } from "./competitors/columns";
import { toast } from "sonner";
import { CompetitorsModal } from "../modals/CompetitorsModal";

type CompetitorsSectionProps = {
  workflowId: string;
};

function CompetitorsSection({ workflowId }: CompetitorsSectionProps) {
  const [search, setSearch] = useState("");
  const [newRowId, setNewRowId] = useState<string | null>(null);
  const [newRowData, setNewRowData] = useState({
    name: "",
    description: "",
    website: "",
  });
  const [rowData, setRowData] = useState<
    Record<string, { 
      name: string; 
      description: string; 
      website: string;
      attributes: Record<string, string | number | boolean>;
    }>
  >({});
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const [deletingColumns, setDeletingColumns] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const {
    data: competitors = [],
    isLoading,
    error,
    refetch,
  } = useCompetitors(workflowId);
  const {
    data: customColumns = [],
  } = useCompetitorTableColumns(workflowId);
  const addCompetitorMutation = useAddCompetitor(workflowId);
  const updateCompetitorMutation = useUpdateCompetitor(workflowId);
  const deleteCompetitorMutation = useDeleteCompetitor(workflowId);
  const deleteColumnMutation = useDeleteCompetitorTableColumn(workflowId);

  // Initialize rowData only when competitors change
  useEffect(() => {
    // Create a stable key based on competitor IDs to prevent unnecessary updates
    const competitorIds = competitors.map(c => c.id).sort().join(',');
    
    setRowData(prevData => {
      // Only update if the competitor IDs have actually changed
      const currentIds = Object.keys(prevData).sort().join(',');
      if (currentIds === competitorIds) {
        return prevData; // No change needed
      }
      
      // Create new data
      const data: Record<
        string,
        { name: string; description: string; website: string; attributes: Record<string, string | number | boolean> }
      > = {};
      competitors.forEach((competitor: Competitor) => {
        data[competitor.id] = {
          name: competitor.name,
          description: competitor.description || "",
          website: competitor.website || "",
          attributes: competitor.attributes || {},
        };
      });
      return data;
    });
  }, [competitors]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRows.size > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirtyRows]);

  const filteredCompetitors = useMemo(() => {
    if (!search.trim()) return competitors;

    return competitors.filter(
      (competitor: Competitor) =>
        competitor.name.toLowerCase().includes(search.toLowerCase()) ||
        competitor.description?.toLowerCase().includes(search.toLowerCase()) ||
        competitor.website?.toLowerCase().includes(search.toLowerCase())
    );
  }, [competitors, search]);

  const handleAddCompetitor = () => {
    const tempId = `new-${Date.now()}`;
    setNewRowId(tempId);
    setNewRowData({
      name: "",
      description: "",
      website: "",
    });
  };

  const handleSaveNew = async () => {
    if (!newRowData.name.trim()) {
      return; // Don't save if name is empty
    }

    try {
      await addCompetitorMutation.mutateAsync({
        name: newRowData.name.trim(),
        description: newRowData.description.trim() || "",
        website: newRowData.website.trim() || "",
        logoImage: "",
        attributes: {},
      });

      toast.success("Competitor added successfully");
      setNewRowId(null);
      setNewRowData({ name: "", description: "", website: "" });
      refetch();
    } catch (error) {
      console.error("Error saving competitor:", error);
      toast.error("Failed to add competitor");
    }
  };

  const handleNewRowFieldChange = (field: string, value: string) => {
    setNewRowData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewRowBlur = (field: string, value: string) => {
    // If name field is blurred and empty, discard the new row
    if (field === "name" && !value.trim()) {
      setNewRowId(null);
      setNewRowData({ name: "", description: "", website: "" });
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    try {
      await deleteCompetitorMutation.mutateAsync(competitorId);
      // Remove from local state
      setRowData((prev) => {
        const newData = { ...prev };
        delete newData[competitorId];
        return newData;
      });
      // Remove from dirty rows
      setDirtyRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(competitorId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting competitor:", error);
      // Error handling is already done in the mutation hook
    }
  };

  // Listen for add row events from the table cue
  useEffect(() => {
    const handleAddRowEvent = (event: CustomEvent) => {
      if (event.detail.source === 'tableCue') {
        handleAddCompetitor();
      }
    };

    window.addEventListener('addCompetitorRow', handleAddRowEvent as EventListener);
    
    return () => {
      window.removeEventListener('addCompetitorRow', handleAddRowEvent as EventListener);
    };
  }, []);

  const handleAddColumn = async (columnName: string) => {
    if (!columnName.trim()) return;
    
    try {
      // Create a new column with default settings
      const newColumn = {
        name: columnName.trim(),
        type: 'text' as const, // Default to text type
        required: false, // Default to not required
        options: [], // No options for text type
        order: (customColumns?.length || 0) + 1, // Add to end
        workflowId: workflowId,
      };

      // Call the action to create the column
      const { addCompetitorTableColumn } = await import('@/actions/competitors/addCompetitorTableColumn');
      await addCompetitorTableColumn(newColumn);
      
      // Invalidate the table columns query to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: ['competitors', 'tableColumns', workflowId] 
      });
      
      toast.success(`Added new column: ${columnName}`);
    } catch (error) {
      console.error('Error adding column:', error);
      toast.error('Failed to add new column');
    }
  };

  const handleEditColumn = async (columnId: string, newName: string) => {
    try {
      // TODO: Implement column editing action
      // For now, we'll need to create an action to update column names
      console.log('Edit column:', columnId, 'to', newName);
      toast.info('Column editing will be implemented soon');
    } catch (error) {
      console.error('Error editing column:', error);
      toast.error('Failed to edit column');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    // Prevent concurrent deletions
    if (deletingColumns.has(columnId)) {
      return;
    }

    try {
      setDeletingColumns(prev => new Set(prev).add(columnId));
      await deleteColumnMutation.mutateAsync(columnId);
    } catch (error) {
      console.error('Error deleting column:', error);
      // Error handling is already done in the mutation hook
    } finally {
      setDeletingColumns(prev => {
        const newSet = new Set(prev);
        newSet.delete(columnId);
        return newSet;
      });
    }
  };

  const handleMetadataExtracted = async (competitorId: string, metadata: { name: string; description: string; faviconUrl?: string; website?: string }) => {
    try {
      // Get the current competitor data to preserve existing values
      const currentCompetitor = competitors.find(c => c.id === competitorId);
      const currentRowData = rowData[competitorId];
      
      // Use the website from metadata if provided (from extraction), otherwise preserve existing
      const websiteToSave = metadata.website || currentRowData?.website || currentCompetitor?.website || "";
      
      // Update the competitor with extracted metadata, preserving the website URL
      await updateCompetitorMutation.mutateAsync({
        id: competitorId,
        name: metadata.name,
        description: metadata.description,
        website: websiteToSave,
        logoImage: metadata.faviconUrl || currentCompetitor?.logoImage || "",
        attributes: currentRowData?.attributes || currentCompetitor?.attributes || {},
      });

      // Update local state to reflect the changes
      setRowData(prev => ({
        ...prev,
        [competitorId]: {
          ...prev[competitorId],
          name: metadata.name,
          description: metadata.description,
          // Preserve the website URL that was just saved
          website: websiteToSave,
        }
      }));

      toast.success("Metadata extracted and updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating competitor with metadata:", error);
      toast.error("Failed to update competitor with extracted metadata");
    }
  };

  const handleCancelEdit = useCallback(
    (competitorId: string) => {
      if (window.confirm("Are you sure you want to discard your changes?")) {
        const competitor = competitors.find((c) => c.id === competitorId);
        if (competitor) {
          setRowData((prev) => ({
            ...prev,
            [competitorId]: {
              name: competitor.name,
              description: competitor.description || "",
              website: competitor.website || "",
              attributes: competitor.attributes || {},
            },
          }));
        }

        setDirtyRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(competitorId);
          return newSet;
        });
      }
    },
    [competitors]
  );

  // Simplified save handler for cell-level editing
  const handleCellSave = useCallback(
    (competitorId: string, field: string, value: string) => {
      // Update the rowData immediately for the cell that was edited
      setRowData((prev) => {
        const currentRow = prev[competitorId] || {
          name: "",
          description: "",
          website: "",
          attributes: {},
        };

        // Handle nested attributes (e.g., "attributes.Customer Segment")
        if (field.startsWith('attributes.')) {
          const attributeName = field.replace('attributes.', '');
          return {
            ...prev,
            [competitorId]: {
              ...currentRow,
              attributes: {
                ...currentRow.attributes,
                [attributeName]: value,
              },
            },
          };
        }

        // Handle regular fields
        return {
          ...prev,
          [competitorId]: {
            ...currentRow,
            [field]: value,
          },
        };
      });

      // Mark as dirty so save/cancel buttons show
      setDirtyRows((prev) => new Set(prev).add(competitorId));
    },
    []
  );

  // Auto-save handler that saves to backend when cell loses focus
  const handleAutoSave = useCallback(
    async (competitorId: string, field: string, value: string) => {
      // First update local state
      handleCellSave(competitorId, field, value);

      try {
        // Get current data for this competitor - check both rowData and competitors
        const currentCompetitor = competitors.find(c => c.id === competitorId);
        const currentRowData = rowData[competitorId];
        
        // Build current data with fallback to competitor data to preserve website and other fields
        const currentData = {
          name: currentRowData?.name || currentCompetitor?.name || "",
          description: currentRowData?.description || currentCompetitor?.description || "",
          website: currentRowData?.website || currentCompetitor?.website || "",
          attributes: currentRowData?.attributes || currentCompetitor?.attributes || {},
        };

        // Update with the new field value
        const updatedData = {
          ...currentData,
          [field]: value,
        };

        // Save to backend
        await updateCompetitorMutation.mutateAsync({
          id: competitorId,
          name: updatedData.name,
          description: updatedData.description,
          website: updatedData.website, // Preserve website even when saving other fields
          attributes: updatedData.attributes,
        });

        // Clear dirty state for this row
        setDirtyRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(competitorId);
          return newSet;
        });

        refetch();
      } catch (error) {
        console.error("Error updating competitor:", error);
        toast.error("Failed to update competitor");
        // Revert the local change on error
        handleCancelEdit(competitorId);
      }
    },
    [
      handleCellSave,
      rowData,
      competitors,
      updateCompetitorMutation,
      refetch,
      handleCancelEdit,
    ]
  );

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col justify-start gap-2 w-full",
          SECTION_CLASS
        )}
      >
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col justify-start gap-2 w-full")}
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Competitor Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Track and analyze your competitors to stay ahead
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Competitor
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom">
              <DropdownMenuItem onClick={handleAddCompetitor}>
                <div className="flex items-center gap-2 w-full">
                  <Plus className="size-5" />
                  Add a new row
                </div>
              </DropdownMenuItem>
              <CompetitorsModal workflowId={workflowId}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-2 w-full">
                    <FileSpreadsheet className="size-5" />
                    Import CSV Table
                  </div>
                </DropdownMenuItem>
              </CompetitorsModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
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

              {!newRowId && competitors.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Trophy className="size-8 stroke-muted-foreground stroke-1" />
                  </div>
                  <h4 className="text-lg font-medium mb-2">
                    No competitors yet
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start tracking your competitors to understand the market
                    landscape
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Competitor
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleAddCompetitor}>
                        <div className="flex items-center gap-2 w-full">
                          <Plus className="size-5" />
                          Create a table
                        </div>
                      </DropdownMenuItem>
                      <CompetitorsModal workflowId={workflowId}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <div className="flex items-center gap-2 w-full">
                            <FileSpreadsheet className="size-5" />
                            Import CSV Table
                          </div>
                        </DropdownMenuItem>
                      </CompetitorsModal>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {!newRowId &&
                competitors.length > 0 &&
                filteredCompetitors.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <AlertCircleIcon className="size-8 stroke-muted-foreground stroke-1" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">
                      No results found
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      No competitors match your search criteria. Try adjusting
                      your search terms.
                    </p>
                  </div>
                )}

              {(newRowId || filteredCompetitors.length > 0) && (
                <>
                  {/* Competitors table */}
                                     <DataTable
                     columns={createCompetitorColumns(
                       handleAutoSave,
                       handleNewRowFieldChange,
                       handleNewRowBlur,
                       handleSaveNew,
                       handleDeleteCompetitor,
                       customColumns,
                       handleAddColumn,
                       handleEditColumn,
                       handleDeleteColumn,
                       deletingColumns,
                       handleMetadataExtracted
                     )}
                    data={[
                      // Existing competitors first
                      ...filteredCompetitors.map((competitor) => {
                        const currentData = rowData[competitor.id] || {
                          name: competitor.name,
                          description: competitor.description || "",
                          website: competitor.website || "",
                        };
                        return {
                          id: competitor.id,
                          name: currentData.name,
                          description: currentData.description,
                          website: currentData.website,
                          logoImage: competitor.logoImage,
                          attributes: competitor.attributes,
                          isNew: false,
                          workflowId: competitor.workflowId,
                        };
                      }),
                      // Add new row at the end if adding
                      ...(newRowId
                        ? [
                            {
                              id: newRowId,
                              name: newRowData.name,
                              description: newRowData.description,
                              website: newRowData.website,
                              logoImage: "",
                              attributes: {},
                              isNew: true,
                              workflowId: workflowId,
                            },
                          ]
                        : []),
                    ]}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompetitorsSection;
