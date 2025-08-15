import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments } from '../actions/documents/getDocuments';
import { addDocument } from '../actions/documents/addDocument';
import { updateDocumentSimple } from '../actions/documents/updateDocumentSimple';
import { deleteDocumentSimple } from '../actions/documents/deleteDocumentSimple';

export function useDocuments(workflowId: string) {
  return useQuery({
    queryKey: ['documents', workflowId],
    queryFn: () => getDocuments(workflowId),
    enabled: !!workflowId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDocument,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate and refetch documents for the workflow
        queryClient.invalidateQueries({
          queryKey: ['documents', variables.workflowId]
        });
      }
    }
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDocumentSimple,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate and refetch documents for the workflow
        queryClient.invalidateQueries({
          queryKey: ['documents', variables.workflowId]
        });
      }
    }
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocumentSimple,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate and refetch documents for the workflow
        queryClient.invalidateQueries({
          queryKey: ['documents', variables.workflowId]
        });
      }
    }
  });
}


