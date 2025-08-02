"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Shapes } from "lucide-react";
import { ProductVariant } from "@/types/workflow";
import { ProductVariantModal } from "../modals/ProductVariantModal";
import { useDeleteProductVariant } from "@/hooks/useProductVariants";
import {
  parseVariantAttributes,
  formatPrice,
} from "@/lib/helpers/variantUtils";
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
import Image from "next/image";

interface ProductVariantsListProps {
  productId: string;
  variants: ProductVariant[];
  onVariantChange?: () => void;
}

export function ProductVariantsList({
  productId,
  variants,
  onVariantChange,
}: ProductVariantsListProps) {
  const deleteVariant = useDeleteProductVariant();

  const handleDelete = async (variantId: string) => {
    try {
      await deleteVariant.mutateAsync({ id: variantId });
      onVariantChange?.();
    } catch (error) {
      console.error("Failed to delete variant:", error);
    }
  };

  const renderAttributes = (attributesString: string | null) => {
    const attributes = parseVariantAttributes(attributesString);
    if (!attributes || Object.keys(attributes).length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(attributes).map(([key, value]) => (
          <Badge key={key} variant="secondary" className="text-xs">
            {key}: {value}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <ProductVariantModal productId={productId} onSuccess={onVariantChange}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Variant
          </Button>
        </ProductVariantModal>
      </div>

      {variants.length === 0 ? (
        <ProductVariantModal productId={productId} onSuccess={onVariantChange}>
          <Card className="cursor-pointer">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground justify-center items-center flex flex-col gap-2">
                <Shapes className="size-10" />
                <div className="flex flex-col">
                  <p>No variants added yet.</p>
                  <p className="text-sm">
                    Add variants to showcase different options of your product.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ProductVariantModal>
      ) : (
        <div className="grid gap-4">
          {variants.map((variant) => (
            <Card key={variant.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {variant.name}
                      {!variant.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                    {variant.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {variant.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {variant.price !== null && variant.price !== undefined && (
                      <Badge variant="default" className="text-sm">
                        {formatPrice(variant.price)}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <ProductVariantModal
                        productId={productId}
                        variant={variant}
                        onSuccess={onVariantChange}
                      >
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </ProductVariantModal>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;
                              {variant.name}&quot;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(variant.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {variant.image && (
                  <div className="mb-3">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {renderAttributes(variant.attributes as unknown as string)}

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>
                    Created: {new Date(variant.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    Updated: {new Date(variant.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
