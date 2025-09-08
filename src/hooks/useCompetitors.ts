"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  getCompetitors, 
  addCompetitor, 
  updateCompetitor, 
  deleteCompetitor,
  deleteCompetitorTableColumn
} from "@/actions/competitors";
import { 
  getCompetitorTableColumns 
} from "@/actions/competitors/getCompetitorTableColumns";
import { 
  Competitor, 
  CompetitorFormData, 
  CompetitorTableColumn 
} from "@/types/workflow";

// Query Keys
export const competitorKeys = {
  all: ['competitors'] as const,
  byWorkflow: (workflowId: string) => [...competitorKeys.all, 'workflow', workflowId] as const,
  tableColumns: (workflowId: string) => [...competitorKeys.all, 'tableColumns', workflowId] as const,
};

// Hook for fetching competitors
export function useCompetitors(workflowId: string) {
  return useQuery({
    queryKey: competitorKeys.byWorkflow(workflowId),
    queryFn: async () => {
      const result = await getCompetitors(workflowId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch competitors");
      }
      return result.competitors;
    },
    enabled: !!workflowId,
  });
}

// Hook for fetching competitor table columns
export function useCompetitorTableColumns(workflowId: string) {
  return useQuery({
    queryKey: competitorKeys.tableColumns(workflowId),
    queryFn: async () => {
      const result = await getCompetitorTableColumns(workflowId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch competitor table columns");
      }
      return result.columns;
    },
    enabled: !!workflowId,
  });
}

// Hook for adding competitors
export function useAddCompetitor(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (competitor: Omit<CompetitorFormData, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = await addCompetitor({ ...competitor, workflowId });
      if (!result.success) {
        throw new Error("Failed to add competitor");
      }
      return result.competitor;
    },
    onSuccess: () => {
      toast.success("Competitor added successfully");
      queryClient.invalidateQueries({ 
        queryKey: competitorKeys.byWorkflow(workflowId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add competitor");
    },
  });
}

// Hook for updating competitors
export function useUpdateCompetitor(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CompetitorFormData>) => {
      const result = await updateCompetitor({ id, workflowId, ...updates });
      if (!result.success) {
        throw new Error("Failed to update competitor");
      }
      return result.competitor;
    },
    onSuccess: () => {
      toast.success("Competitor updated successfully");
      queryClient.invalidateQueries({ 
        queryKey: competitorKeys.byWorkflow(workflowId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update competitor");
    },
  });
}

// Hook for deleting competitors
export function useDeleteCompetitor(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCompetitor({ id, workflowId });
      if (!result.success) {
        throw new Error("Failed to delete competitor");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Competitor deleted successfully");
      queryClient.invalidateQueries({ 
        queryKey: competitorKeys.byWorkflow(workflowId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete competitor");
    },
  });
}

// Hook for deleting competitor table columns
export function useDeleteCompetitorTableColumn(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (columnId: string) => {
      const result = await deleteCompetitorTableColumn({ columnId, workflowId });
      if (!result.success) {
        throw new Error("Failed to delete column");
      }
      return result;
    },
    onSuccess: (data, columnId) => {
      toast.success("Column deleted successfully");
      
      // Use a more targeted invalidation approach to prevent race conditions
      queryClient.setQueryData(
        competitorKeys.tableColumns(workflowId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((column: any) => column.id !== columnId);
        }
      );
      
      // Invalidate competitors query to refresh the table
      queryClient.invalidateQueries({ 
        queryKey: competitorKeys.byWorkflow(workflowId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete column");
    },
  });
}
