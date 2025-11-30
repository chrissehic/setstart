import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments } from '../actions/documents/getDocuments';
import { addDocument } from '../actions/documents/addDocument';
import { createEditableDocument } from '../actions/documents/createEditableDocument';
import { updateDocumentSimple } from '../actions/documents/updateDocumentSimple';
import { deleteDocumentSimple } from '../actions/documents/deleteDocumentSimple';
import { toast } from 'sonner';

// Query Keys
export const documentKeys = {
  all: ['documents'] as const,
  byWorkflow: (workflowId: string) => [...documentKeys.all, 'workflow', workflowId] as const,
};

export function useDocuments(workflowId: string) {
  return useQuery({
    queryKey: documentKeys.byWorkflow(workflowId),
    queryFn: () => getDocuments(workflowId),
    enabled: !!workflowId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cached data if available on mount
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for validation errors
      if (failureCount < 3 && (error as any)?.message?.includes('fetch failed')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDocument,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors
      if (failureCount < 2 && (error as any)?.message?.includes('fetch failed')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Only invalidate queries, let React Query handle refetch based on staleTime
        queryClient.invalidateQueries({
          queryKey: documentKeys.byWorkflow(variables.workflowId),
          refetchType: 'active', // Only refetch active queries
        });
      }
    }
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDocumentSimple,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors
      if (failureCount < 2 && (error as any)?.message?.includes('fetch failed')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Only invalidate queries, let React Query handle refetch based on staleTime
        queryClient.invalidateQueries({
          queryKey: documentKeys.byWorkflow(variables.workflowId),
          refetchType: 'active', // Only refetch active queries
        });
      }
    }
  });
}

export function useCreateEditableDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEditableDocument,
    retry: (failureCount, error) => {
      if (failureCount < 2 && (error as any)?.message?.includes('fetch failed')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byWorkflow(variables.workflowId),
          refetchType: 'active',
        });
        toast.success("Document created successfully");
      } else {
        toast.error("Failed to create document");
      }
    },
    onError: () => {
      toast.error("Failed to create document");
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDocumentSimple,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors
      if (failureCount < 2 && (error as any)?.message?.includes('fetch failed')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onMutate: async (deletedDocument) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: documentKeys.byWorkflow(deletedDocument.workflowId) 
      });
      
      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData(
        documentKeys.byWorkflow(deletedDocument.workflowId)
      );
      
      // Optimistically remove the document
      queryClient.setQueryData(
        documentKeys.byWorkflow(deletedDocument.workflowId),
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.filter((doc) => doc.id !== deletedDocument.documentId);
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousDocuments };
    },
    onError: (err, deletedDocument, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        documentKeys.byWorkflow(deletedDocument.workflowId),
        context?.previousDocuments
      );
      
      // Check if it's a timeout error
      if ((err as any)?.message?.includes('fetch failed') || (err as any)?.message?.includes('Headers Timeout')) {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("Failed to delete document");
      }
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");
    },
    onSettled: (_, __, variables) => {
      // Only invalidate active queries to ensure consistency without unnecessary refetches
      queryClient.invalidateQueries({ 
        queryKey: documentKeys.byWorkflow(variables.workflowId),
        refetchType: 'active',
      });
    },
  });
}


