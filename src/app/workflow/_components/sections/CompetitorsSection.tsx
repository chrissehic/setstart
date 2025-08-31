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
} from "@/hooks/useCompetitors";
import { DataTable } from "./competitors/data-table";
import { createCompetitorColumns } from "./competitors/columns";
import { toast } from "sonner";

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
    Record<string, { name: string; description: string; website: string }>
  >({});
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());

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
        { name: string; description: string; website: string }
      > = {};
      competitors.forEach((competitor: Competitor) => {
        data[competitor.id] = {
          name: competitor.name,
          description: competitor.description || "",
          website: competitor.website || "",
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

  const handleAddColumn = () => {
    // TODO: Implement column creation modal/form
    console.log("Add new column clicked");
    // This would typically open a modal to:
    // 1. Enter column name
    // 2. Select column type (text, number, select, boolean, date)
    // 3. Set required/optional
    // 4. Add select options if type is "select"
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
      setRowData((prev) => ({
        ...prev,
        [competitorId]: {
          ...prev[competitorId],
          [field]: value,
        },
      }));

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
        // Get current data for this competitor
        const currentData = rowData[competitorId] || {
          name: "",
          description: "",
          website: "",
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
          website: updatedData.website,
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
      className={cn("flex flex-col justify-start gap-2 w-full", SECTION_CLASS)}
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Competitor Analysis</h3>
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
              <DropdownMenuItem
                onClick={() => console.log("Import CSV table - placeholder")}
              >
                <div className="flex items-center gap-2 w-full">
                  <FileSpreadsheet className="size-5" />
                  Import CSV Table
                </div>
              </DropdownMenuItem>
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
                      <DropdownMenuItem
                        onClick={() =>
                          console.log("Import CSV table - placeholder")
                        }
                      >
                        <div className="flex items-center gap-2 w-full">
                          <FileSpreadsheet className="size-5" />
                          Import CSV Table
                        </div>
                      </DropdownMenuItem>
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
                       handleAddColumn
                     )}
                    data={[
                      // Add new row at the top if adding
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
                      // Existing competitors
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
