"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/actions/products/getProducts";
import { addProduct } from "@/actions/products/addProduct";
import { updateProduct } from "@/actions/products/updateProduct";
import { deleteProduct } from "@/actions/products/deleteProduct";
import { toast } from "sonner";

// Define types for better type safety
interface Product {
  id: string;
  workflowId: string;
  name: string;
  description?: string | null;
  type?: string | null;
  image?: string | null;
  variants?: unknown[];
}

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
    onMutate: async (newProduct) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
      
      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(
        productKeys.byWorkflow(workflowId)
      );
      
      // Optimistically add the product
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        (old: Product[] | undefined) => {
          if (!old) return old;
          return [...old, { ...newProduct, id: 'temp-' + Date.now(), variants: [] }];
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        context?.previousProducts
      );
      toast.error("Failed to add product");
    },
    onSuccess: () => {
      toast.success("Product added successfully");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
    },
  });
}

export function useUpdateProduct(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onMutate: async (updatedProduct) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
      
      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(
        productKeys.byWorkflow(workflowId)
      );
      
      // Optimistically update the product
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        (old: Product[] | undefined) => {
          if (!old) return old;
          return old.map((product) => 
            product.id === updatedProduct.id 
              ? { ...product, ...updatedProduct }
              : product
          );
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (err, updatedProduct, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        context?.previousProducts
      );
      toast.error("Failed to update product");
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
    },
  });
}

export function useDeleteProduct(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (deletedProductId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
      
      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(
        productKeys.byWorkflow(workflowId)
      );
      
      // Optimistically remove the product
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        (old: Product[] | undefined) => {
          if (!old) return old;
          return old.filter((product) => product.id !== deletedProductId);
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (err, deletedProductId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        context?.previousProducts
      );
      toast.error("Failed to delete product");
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
    },
  });
} 