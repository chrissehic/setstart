"use client"

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { addProduct } from "@/actions/products/addProduct"
import { updateProduct } from "@/actions/products/updateProduct"
import { deleteProduct } from "@/actions/products/deleteProduct"
import { Product } from "@/types/workflow"

// Query keys for products
export const productKeys = {
  all: ['products'] as const,
  byWorkflow: (workflowId: string) => [...productKeys.all, 'workflow', workflowId] as const,
}

export function useProducts(workflowId: string) {
  return useQuery({
    queryKey: productKeys.byWorkflow(workflowId),
    queryFn: async () => {
      const response = await fetch(`/api/products/${workflowId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });
}

export function useAddProduct(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addProduct,
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.byWorkflow(workflowId) });
      
      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.byWorkflow(workflowId));
      
      // Optimistically update
      const optimisticProduct: Product = {
        id: `temp-${Date.now()}`,
        workflowId,
        name: newProduct.name,
        description: newProduct.description || null,
        type: newProduct.type || null,
        image: newProduct.image || null,
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      queryClient.setQueryData<Product[]>(
        productKeys.byWorkflow(workflowId),
        (old) => old ? [optimisticProduct, ...old] : [optimisticProduct]
      );
      
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      queryClient.setQueryData(productKeys.byWorkflow(workflowId), context?.previousProducts);
      console.error("Failed to add product:", err);
      toast.error("Failed to add product");
    },
    onSuccess: () => {
      toast.success("Product added successfully");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
    },
  });
}

export function useUpdateProduct(workflowId: string, showToast: boolean = true) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onMutate: async (updatedProduct) => {
      await queryClient.cancelQueries({ queryKey: productKeys.byWorkflow(workflowId) });
      
      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.byWorkflow(workflowId));
      
      // Optimistically update
      queryClient.setQueryData<Product[]>(
        productKeys.byWorkflow(workflowId),
        (old) => old?.map(product => 
          product.id === updatedProduct.id 
            ? { 
                ...product, 
                name: updatedProduct.name ?? product.name,
                description: updatedProduct.description ?? product.description,
                type: updatedProduct.type ?? product.type,
                image: updatedProduct.image ?? product.image,
                updatedAt: new Date() 
              }
            : product
        ) || []
      );
      
      return { previousProducts };
    },
    onError: (err, updatedProduct, context) => {
      queryClient.setQueryData(productKeys.byWorkflow(workflowId), context?.previousProducts);
      console.error("Failed to update product:", err);
      toast.error("Failed to update product");
    },
    onSuccess: () => {
      if (showToast) {
        toast.success("Product updated successfully");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
    },
  });
}

export function useDeleteProduct(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: productKeys.byWorkflow(workflowId) });
      
      const previousProducts = queryClient.getQueryData<Product[]>(productKeys.byWorkflow(workflowId));
      
      // Optimistically remove
      queryClient.setQueryData<Product[]>(
        productKeys.byWorkflow(workflowId),
        (old) => old?.filter(product => product.id !== productId) || []
      );
      
      return { previousProducts };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(productKeys.byWorkflow(workflowId), context?.previousProducts);
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product");
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
    },
  });
} 