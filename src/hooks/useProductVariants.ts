import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProductVariant } from "@/actions/products/addProductVariant";
import { toast } from "sonner";
import { updateProductVariant } from "@/actions/products/updateProductVariant";
import { deleteProductVariant } from "@/actions/products/deleteProductVariant";
import { productKeys } from "./useProducts";

export function useAddProductVariant(workflowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductVariant,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Variant added successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
      } else {
        toast.error(result.error || "Failed to add variant");
      }
    },
    onError: (error) => {
      console.error("Error adding product variant:", error);
      toast.error("Failed to add variant");
    },
  });
}

export function useUpdateProductVariant(workflowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductVariant,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Variant updated successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
      } else {
        toast.error(result.error || "Failed to update variant");
      }
    },
    onError: (error) => {
      console.error("Error updating product variant:", error);
      toast.error("Failed to update variant");
    },
  });
}

export function useDeleteProductVariant(workflowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductVariant,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Variant deleted successfully");
        queryClient.invalidateQueries({ queryKey: productKeys.byWorkflow(workflowId) });
      } else {
        toast.error(result.error || "Failed to delete variant");
      }
    },
    onError: (error) => {
      console.error("Error deleting product variant:", error);
      toast.error("Failed to delete variant");
    },
  });
} 