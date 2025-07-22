"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addObjective } from "@/actions/objectives/addObjective";
import { updateObjective } from "@/actions/objectives/updateObjective";
import { deleteObjective } from "@/actions/objectives/deleteObjective";
import { getObjectives, getObjectiveById } from "@/actions/objectives/getObjectives";
import { Objective, TaskPriority } from "@/types/workflow";

// Query hook for fetching objectives
export function useObjectives(workflowId: string) {
  return useQuery({
    queryKey: ["objectives", workflowId],
    queryFn: async () => {
      const result = await getObjectives(workflowId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.objectives;
    },
  });
}

// Query hook for fetching a single objective
export function useObjective(objectiveId: string) {
  return useQuery({
    queryKey: ["objective", objectiveId],
    queryFn: async () => {
      const result = await getObjectiveById(objectiveId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.objective;
    },
  });
}

// Mutation hook for adding objectives
export function useAddObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      workflowId: string;
      title: string;
      description?: string;
      priority?: TaskPriority;
    }) => {
      const result = await addObjective(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.objective;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch objectives
      queryClient.invalidateQueries({
        queryKey: ["objectives", variables.workflowId],
      });
    },
  });
}

// Mutation hook for updating objectives
export function useUpdateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      workflowId: string;
      title?: string;
      description?: string | null;
      priority?: TaskPriority | null;
    }) => {
      const result = await updateObjective(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.objective;
    },
    onMutate: async (newObjective) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["objectives", newObjective.workflowId],
      });

      // Snapshot the previous value
      const previousObjectives = queryClient.getQueryData([
        "objectives",
        newObjective.workflowId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["objectives", newObjective.workflowId],
        (old: Objective[] | undefined) => {
          if (!old) return old;
          return old.map((objective) =>
            objective.id === newObjective.id
              ? { ...objective, ...newObjective }
              : objective
          );
        }
      );

      // Return a context object with the snapshotted value
      return { previousObjectives };
    },
    onError: (err, newObjective, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["objectives", newObjective.workflowId],
        context?.previousObjectives
      );
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["objectives", variables.workflowId],
      });
    },
  });
}

// Mutation hook for deleting objectives
export function useDeleteObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; workflowId: string }) => {
      const result = await deleteObjective(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (deletedObjective) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["objectives", deletedObjective.workflowId],
      });

      // Snapshot the previous value
      const previousObjectives = queryClient.getQueryData([
        "objectives",
        deletedObjective.workflowId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["objectives", deletedObjective.workflowId],
        (old: Objective[] | undefined) => {
          if (!old) return old;
          return old.filter((objective) => objective.id !== deletedObjective.id);
        }
      );

      // Return a context object with the snapshotted value
      return { previousObjectives };
    },
    onError: (err, deletedObjective, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["objectives", deletedObjective.workflowId],
        context?.previousObjectives
      );
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["objectives", variables.workflowId],
      });
    },
  });
}
