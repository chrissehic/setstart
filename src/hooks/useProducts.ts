"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/actions/products/getProducts";
import { addProduct } from "@/actions/products/addProduct";
import { updateProduct } from "@/actions/products/updateProduct";
import { deleteProduct } from "@/actions/products/deleteProduct";
import { toast } from "sonner";

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  byWorkflow: (workflowId: string) => [...productKeys.all, 'workflow', workflowId] as const,
};

// Hooks
export function useProducts(workflowId: string) {
  return useQuery({
    queryKey: productKeys.byWorkflow(workflowId),
    queryFn: () => getProducts(workflowId),
    enabled: !!workflowId,
  });
}

export function useAddProduct(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success("Product added successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
    },
    onError: () => {
      toast.error("Failed to add product");
    },
  });
}

export function useUpdateProduct(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });
}

export function useDeleteProduct(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });
} 