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
import { TaskSearchInput } from "@/components/TaskSearchInput";
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

type CompetitorsSectionProps = {
  workflowId: string;
  workflowData?: {
    id: string;
    name: string;
    description?: string | null;
    logoImage?: string | null;
    socialLinks?: Array<{ name: string; url: string }>;
  };
};

function CompetitorsSection({ workflowId, workflowData }: CompetitorsSectionProps) {
  const [search, setSearch] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState<{ open: boolean; competitorId: string | null }>({ open: false, competitorId: null });
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

  // Use a special identifier: workflow-{workflowId} to mark our company
  const ourCompanyId = `workflow-${workflowId}`;

  // Get website URL from socialLinks (look for "Website" or first URL)
  const companyWebsite = useMemo(() => {
    if (!workflowData?.socialLinks) return "";
    const websiteLink = workflowData.socialLinks.find(
      (link) => link.name.toLowerCase() === "website" || link.name.toLowerCase() === "site"
    );
    return websiteLink?.url || workflowData.socialLinks[0]?.url || "";
  }, [workflowData?.socialLinks]);

  // Create "our company" competitor data
  const ourCompanyCompetitor = useMemo(() => {
    if (!workflowData) return null;
    
    // Check if "our company" already exists in competitors (by special ID or matching workflowId + name)
    const existingOurCompany = competitors.find(
      (c) => c.id === ourCompanyId || (c.workflowId === workflowId && c.name === workflowData.name)
    );

    if (existingOurCompany) {
      const currentData = rowData[existingOurCompany.id] || {
        name: existingOurCompany.name,
        description: existingOurCompany.description || workflowData.description || "",
        website: existingOurCompany.website || companyWebsite,
      };
      return {
        id: existingOurCompany.id,
        name: currentData.name,
        description: currentData.description,
        website: currentData.website,
        logoImage: existingOurCompany.logoImage || workflowData.logoImage || "",
        attributes: existingOurCompany.attributes,
        isNew: false,
        isOurCompany: true,
        workflowId: existingOurCompany.workflowId,
      };
    }

    // Return virtual "our company" row (not yet saved) with workflow data
    return {
      id: ourCompanyId,
      name: workflowData.name,
      description: workflowData.description || "",
      website: companyWebsite,
      logoImage: workflowData.logoImage || "",
      attributes: {},
      isNew: false,
      isOurCompany: true,
      workflowId: workflowId,
    };
  }, [workflowData, competitors, rowData, companyWebsite, workflowId, ourCompanyId]);

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
    // Allow saving with either name or website URL
    if (!newRowData.name.trim() && !newRowData.website.trim()) {
      return; // Don't save if both name and website are empty
    }

    try {
      await addCompetitorMutation.mutateAsync({
        name: newRowData.name.trim() || newRowData.website.trim() || "Untitled",
        description: newRowData.description.trim() || "",
        website: newRowData.website.trim() || "",
        logoImage: "",
        attributes: {},
      });

      // Mutation hook handles refetch automatically
      setNewRowId(null);
      setNewRowData({ name: "", description: "", website: "" });
    } catch (error) {
      console.error("Error saving competitor:", error);
      // Error toast is handled by the mutation hook
    }
  };

  const handleNewRowFieldChange = (field: string, value: string) => {
    setNewRowData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewRowBlur = (field: string, value: string) => {
    // Only discard the row if both name and website are empty
    if (field === "name" && !value.trim() && !newRowData.website.trim()) {
      setNewRowId(null);
      setNewRowData({ name: "", description: "", website: "" });
    }
    // If website field is blurred and empty, and name is also empty, discard the row
    if (field === "website" && !value.trim() && !newRowData.name.trim()) {
      setNewRowId(null);
      setNewRowData({ name: "", description: "", website: "" });
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

  const handleDeleteColumn = (columnId: string) => {
    const column = customColumns.find(c => c.id === columnId);
    setShowDeleteColumnDialog({ open: true, columnId, columnName: column?.name || null });
  };

  const confirmDeleteColumn = async () => {
    if (!showDeleteColumnDialog.columnId) return;
    
    // Prevent concurrent deletions
    if (deletingColumns.has(showDeleteColumnDialog.columnId)) {
      return;
    }

    try {
      setDeletingColumns(prev => new Set(prev).add(showDeleteColumnDialog.columnId!));
      await deleteColumnMutation.mutateAsync(showDeleteColumnDialog.columnId);
      setShowDeleteColumnDialog({ open: false, columnId: null, columnName: null });
    } catch (error) {
      console.error('Error deleting column:', error);
      // Error handling is already done in the mutation hook
    } finally {
      setDeletingColumns(prev => {
        const newSet = new Set(prev);
        newSet.delete(showDeleteColumnDialog.columnId!);
        return newSet;
      });
    }
  };

  const handleDeleteCompetitor = (competitorId: string) => {
    setShowDeleteCompetitorDialog({ open: true, competitorId });
  };

  const confirmDeleteCompetitor = async () => {
    if (!showDeleteCompetitorDialog.competitorId) return;
    
    try {
      await deleteCompetitorMutation.mutateAsync(showDeleteCompetitorDialog.competitorId);
      // Remove from local state
      setRowData((prev) => {
        const newData = { ...prev };
        delete newData[showDeleteCompetitorDialog.competitorId!];
        return newData;
      });
      // Remove from dirty rows
      setDirtyRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(showDeleteCompetitorDialog.competitorId!);
        return newSet;
      });
      setShowDeleteCompetitorDialog({ open: false, competitorId: null });
    } catch (error) {
      console.error('Error deleting competitor:', error);
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
      setShowCancelDialog({ open: true, competitorId });
    },
    []
  );

  const confirmCancelEdit = useCallback(() => {
    if (!showCancelDialog.competitorId) return;
    const competitor = competitors.find((c) => c.id === showCancelDialog.competitorId);
    if (competitor) {
      setRowData((prev) => ({
        ...prev,
        [showCancelDialog.competitorId!]: {
          name: competitor.name,
          description: competitor.description || "",
          website: competitor.website || "",
          attributes: competitor.attributes || {},
        },
      }));
      setEditingRowId(null);
      setShowCancelDialog({ open: false, competitorId: null });
    }
  }, [showCancelDialog.competitorId, competitors]);

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
        
        // Check if this is our company (virtual row that needs to be created)
        const isOurCompanyVirtual = competitorId === ourCompanyId && !currentCompetitor;
        
        // Build current data with fallback to competitor data or workflow data
        const currentData = {
          name: currentRowData?.name || currentCompetitor?.name || workflowData?.name || "",
          description: currentRowData?.description || currentCompetitor?.description || workflowData?.description || "",
          website: currentRowData?.website || currentCompetitor?.website || companyWebsite,
          attributes: currentRowData?.attributes || currentCompetitor?.attributes || {},
        };

        // Update with the new field value
        const updatedData = {
          ...currentData,
          [field]: value,
        };

        if (isOurCompanyVirtual) {
          // Create new competitor for our company
          await addCompetitorMutation.mutateAsync({
            name: updatedData.name,
            description: updatedData.description,
            website: updatedData.website,
            logoImage: workflowData?.logoImage || "",
            attributes: updatedData.attributes,
          });
        } else {
          // Update existing competitor
        await updateCompetitorMutation.mutateAsync({
          id: competitorId,
          name: updatedData.name,
          description: updatedData.description,
            website: updatedData.website,
          attributes: updatedData.attributes,
        });
        }

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
      addCompetitorMutation,
      refetch,
      handleCancelEdit,
      ourCompanyId,
      workflowData,
      companyWebsite,
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
        <div className="sticky top-0 z-10 backdrop-blur-3xl bg-card border-b border-border/50 py-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
              <h2 className="text-2xl font-semibold tracking-tight">Competitor Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Track and analyze your competitors to stay ahead
              </p>
            </div>
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Competitor
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="bottom"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAddCompetitor();
                    }}
                  >
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
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="w-full">
                <TaskSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search competitors..."
                  className="w-full"
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
                    <DropdownMenuContent
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleAddCompetitor();
                        }}
                      >
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
                      // Our company row first (if available)
                      ...(ourCompanyCompetitor ? [ourCompanyCompetitor] : []),
                      // Existing competitors (excluding our company if it exists)
                      ...filteredCompetitors
                        .filter((competitor) => {
                          // Exclude if it's our company (matched by special ID or workflowId + name)
                          return competitor.id !== ourCompanyId && 
                                 !(workflowData && competitor.workflowId === workflowId && competitor.name === workflowData.name);
                        })
                        .map((competitor) => {
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

      {/* Cancel Edit Confirmation Dialog */}
      <AlertDialog 
        open={showCancelDialog.open} 
        onOpenChange={(open) => setShowCancelDialog({ ...showCancelDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard your changes? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowCancelDialog({ open: false, competitorId: null })}
            >
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelEdit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Column Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteColumnDialog.open} 
        onOpenChange={(open) => setShowDeleteColumnDialog({ ...showDeleteColumnDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete column?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the column "{showDeleteColumnDialog.columnName}"? This will remove all data in this column. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDeleteColumnDialog({ open: false, columnId: null, columnName: null })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteColumn}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Competitor Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteCompetitorDialog.open} 
        onOpenChange={(open) => setShowDeleteCompetitorDialog({ ...showDeleteCompetitorDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete competitor?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this competitor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDeleteCompetitorDialog({ open: false, competitorId: null })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCompetitor}
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

export default CompetitorsSection;
