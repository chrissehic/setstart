"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, Upload, Loader2 } from "lucide-react";
import { Product } from "@/types/workflow";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import ProductType from "../ui/ProductType";
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
import { addProductSchema } from "@/../schema/product";

type UpdateProductSchemaType = z.infer<typeof addProductSchema>;

interface ProductDetailsProps {
  product: Product;
  workflowId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function ProductDetails({ product, workflowId, onBack, onEdit }: ProductDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(product.image || null);
  const [isUploading, setIsUploading] = useState(false);

  const updateProduct = useUpdateProduct(workflowId);
  const deleteProduct = useDeleteProduct(workflowId);

  const form = useForm<UpdateProductSchemaType>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      type: product.type || "",
      image: product.image || "",
    },
  });

  const isLoading = updateProduct.isPending || deleteProduct.isPending;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "File upload failed");
      }

      setImageUrl(result.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };



  const onSubmit = (values: UpdateProductSchemaType) => {
    const productData = {
      ...values,
      image: imageUrl || undefined,
    };

    updateProduct.mutate(
      {
        id: product.id,
        ...productData,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Product updated successfully");
        },
      }
    );
  };

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Product deleted successfully");
      onBack();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset();
    setImageUrl(product.image || null);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        {/* Edit Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel Edit
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>

        {/* Edit Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-row gap-4">
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem className="w-full h-full flex-2">
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4 w-full h-full">
                        {/* Show carousel preview if product has images */}
                        {product.image || (product.variants && product.variants.some(v => v.image)) ? (
                          <div className="space-y-2">
                            <ProductImageCarousel product={product} className="w-full" />
                            <div className="text-xs text-muted-foreground text-center">
                              Current product images (edit variants to change)
                            </div>
                          </div>
                        ) : (
                          <div
                            className="border-2 aspect-video border-dashed border-muted-foreground/25 rounded-md p-6 text-center flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                            onClick={() =>
                              document.getElementById("image-upload")?.click()
                            }
                          >
                            {isUploading ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload main product image
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-4 flex-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Give your product a title..."
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="w-full col-span-1">
                        <FormLabel>Offering Type</FormLabel>
                        <ProductType
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="h-full"
                          placeholder="Describe your offering (product, service, etc.)..."
                          rows={4}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />  
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isLoading}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove this product from the workflow.
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
        </div>
      </div>

      {/* Product Image Carousel */}
      <ProductImageCarousel product={product} className="w-full" />

      {/* Product Information */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {product.type && (
              <span className="text-sm">
                {product.type}
              </span>
            )}
            <h1 className="text-3xl leading-tight tracking-tight font-bold">{product.name}</h1>
          </div>
        </div>

        {product.description && (
          <p className="text-muted-foreground text-base leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Product Variants */}
      {/* {product.variants && product.variants.length > 0 && ( */}
        <div className="space-y-4">
          {/* <Separator /> */}
        
          <ProductVariantsList
            productId={product.id}
            workflowId={workflowId}
            variants={product?.variants || []}
            onVariantChange={() => {
              // Refresh product data if needed
            }}
          />
        </div>


      {/* Metadata */}
      <div className="space-y-4">
        <Separator />
        <div className="flex flex-row justify-end gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Created:</span>
            {new Date(product.createdAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{" "}
            {new Date(product.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
