"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Shapes } from "lucide-react"
import type { ProductVariant } from "@/types/workflow"
import { ProductVariantModal } from "../modals/ProductVariantModal"
import { useDeleteProductVariant } from "@/hooks/useProductVariants"
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
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface ProductVariantsListProps {
  productId: string
  workflowId: string
  variants: ProductVariant[]
  onVariantChange?: () => void
}

// Variant Image Component
const VariantImage = ({ variant }: { variant: ProductVariant }) => {
  if (!variant.image) {
    return (
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
        <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
      </div>
    )
  }

  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
      <Image src={variant.image || "/placeholder.svg"} alt={variant.name} fill className="object-cover" />
    </div>
  )
}

// Variant Actions Component
const VariantActions = ({
  variant,
  productId,
  workflowId,
  onVariantChange,
  handleDelete,
}: {
  variant: ProductVariant
  productId: string
  workflowId: string
  onVariantChange?: () => void
  handleDelete: (variantId: string) => void
}) => (
  <div className="flex items-center gap-1 opacity-0 group-hover/variant:opacity-100 transition-opacity">
    <ProductVariantModal productId={productId} workflowId={workflowId} variant={variant} onSuccess={onVariantChange}>
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
            Are you sure you want to delete &quot;{variant.name}&quot;? This action cannot be undone.
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
)

export function ProductVariantsList({ productId, workflowId, variants, onVariantChange }: ProductVariantsListProps) {
  const deleteVariant = useDeleteProductVariant(workflowId)

  const handleDelete = async (variantId: string) => {
    try {
      await deleteVariant.mutateAsync({ id: variantId })
      onVariantChange?.()
    } catch (error) {
      console.error("Failed to delete variant:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <ProductVariantModal productId={productId} workflowId={workflowId} onSuccess={onVariantChange}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 gap-1" />
            Add Variant
          </Button>
        </ProductVariantModal>
      </div>

      {variants.length === 0 ? (
        <ProductVariantModal productId={productId} workflowId={workflowId} onSuccess={onVariantChange}>
          <Card className="cursor-pointer">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground justify-center items-center flex flex-col gap-2">
                <Shapes className="size-10" />
                <div className="flex flex-col">
                  <p>No variants added yet.</p>
                  <p className="text-sm">Add variants to showcase different options of your product.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ProductVariantModal>
      ) : (
        <div className="grid gap-2">
          {variants.map((variant) => (
            <Card key={variant.id} className="group/variant hover:bg-muted/50 transition-colors p-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <VariantImage variant={variant} />

                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{variant.name}</h4>
                    {variant.description && <p className="text-sm text-muted-foreground">{variant.description}</p>}
                  </div>

                  <VariantActions
                    variant={variant}
                    productId={productId}
                    workflowId={workflowId}
                    onVariantChange={onVariantChange}
                    handleDelete={handleDelete}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
