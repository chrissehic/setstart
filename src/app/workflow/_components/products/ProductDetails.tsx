"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
} from "lucide-react";
import { Product } from "@/types/workflow";
import { useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { ProductVariantsList } from "../ui/ProductVariantsList";
import { ProductImageCarousel } from "./ProductImageCarousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProductDetailsProps {
  product: Product;
  workflowId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function ProductDetails({
  product,
  workflowId,
  onBack,
  onEdit,
}: ProductDetailsProps) {
  const deleteProduct = useDeleteProduct(workflowId);

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Product deleted successfully");
      onBack();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2 hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-muted/50 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Edit offering
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete offering
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove
                    this product from the workflow.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Product Image Carousel */}
      <div className="rounded-lg overflow-hidden border bg-muted/30">
        <ProductImageCarousel product={product} className="w-full" />
      </div>

      {/* Product Information and Variants - Side by Side */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Information - Left Side */}
        <div className="flex-3 space-y-4 min-w-0">
          <div className="space-y-3">
            {product.type && product.type}
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-muted-foreground text-base leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Product Variants - Right Side */}
        <div className="flex-2 flex-shrink-0">
          <ProductVariantsList
            productId={product.id}
            workflowId={workflowId}
            variants={product?.variants || []}
            onVariantChange={() => {
              // Refresh product data if needed
            }}
          />
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="pt-4 border-t">
        <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Created{" "}
              <span className="font-medium">
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Updated{" "}
              <span className="font-medium">
                {new Date(product.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
