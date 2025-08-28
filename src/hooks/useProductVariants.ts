import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProductVariant } from "@/actions/products/addProductVariant";
import { toast } from "sonner";
import { updateProductVariant } from "@/actions/products/updateProductVariant";
import { deleteProductVariant } from "@/actions/products/deleteProductVariant";
import { productKeys } from "./useProducts";

// Define types for better type safety
interface Product {
  id: string;
  workflowId: string;
  name: string;
  description?: string | null;
  type?: string | null;
  image?: string | null;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string | null;
  attributes: string;
  price?: number | null;
  image?: string | null;
  isActive: boolean;
}

export function useAddProductVariant(workflowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductVariant,
    onMutate: async (newVariant) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
      
      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(
        productKeys.byWorkflow(workflowId)
      );
      
      // Optimistically add the variant to the product
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        (old: Product[] | undefined) => {
          if (!old) return old;
          return old.map((product) => {
            if (product.id === newVariant.productId) {
              return {
                ...product,
                variants: [...(product.variants || []), { ...newVariant, id: 'temp-' + Date.now() }]
              };
            }
            return product;
          });
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (error, newVariant, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        context?.previousProducts
      );
      toast.error("Failed to add variant");
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Variant added successfully");
      } else {
        toast.error(result.error || "Failed to add variant");
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
    },
  });
}

export function useUpdateProductVariant(workflowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductVariant,
    onMutate: async (updatedVariant) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
      
      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(
        productKeys.byWorkflow(workflowId)
      );
      
      // Optimistically update the variant
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        (old: Product[] | undefined) => {
          if (!old) return old;
          return old.map((product) => {
            if (product.id === updatedVariant.productId) {
              return {
                ...product,
                variants: product.variants?.map((v: ProductVariant) => 
                  v.id === updatedVariant.variantId ? { ...v, ...updatedVariant } : v
                ) || []
              };
            }
            return product;
          });
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (error, updatedVariant, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        context?.previousProducts
      );
      toast.error("Failed to update variant");
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Variant updated successfully");
      } else {
        toast.error(result.error || "Failed to update variant");
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
    },
  });
}

export function useDeleteProductVariant(workflowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductVariant,
    onMutate: async (deletedVariant) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
      
      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(
        productKeys.byWorkflow(workflowId)
      );
      
      // Optimistically remove the variant from the product
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        (old: Product[] | undefined) => {
          if (!old) return old;
          return old.map((product) => {
            if (product.id === deletedVariant.productId) {
              return {
                ...product,
                variants: product.variants?.filter((v: ProductVariant) => v.id !== deletedVariant.variantId) || []
              };
            }
            return product;
          });
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (error, deletedVariant, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        productKeys.byWorkflow(workflowId),
        context?.previousProducts
      );
      console.error("Error deleting product variant:", error);
      toast.error("Failed to delete variant");
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Variant deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete variant");
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: productKeys.byWorkflow(workflowId) 
      });
    },
  });
} 