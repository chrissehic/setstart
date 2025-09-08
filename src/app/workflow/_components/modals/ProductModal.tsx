"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import {
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { Product } from "@/types/workflow";
import { toast } from "sonner";
import Image from "next/image";

import { addProductSchema } from "@/../schema/product";
import ProductType from "../ui/ProductType";
import { ProductVariantsList } from "../ui/ProductVariantsList";
import { Separator } from "@/components/ui/separator";
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

type AddProductSchemaType = z.infer<typeof addProductSchema>;

interface ProductModalProps {
  workflowId: string;
  product?: Product; // If provided, we're editing
  children?: React.ReactNode;
  onSuccess?: () => void;
  onProductCreated?: (product: Product) => void; // New callback for newly created products
  // Controlled state props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductModal({
  workflowId,
  product,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  onProductCreated,
}: ProductModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);



  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const addProduct = useAddProduct(workflowId);
  const updateProduct = useUpdateProduct(workflowId);
  const deleteProduct = useDeleteProduct(workflowId);

  const isEditing = !!product;
  const isLoading =
    addProduct.isPending || updateProduct.isPending || deleteProduct.isPending;

  const form = useForm<AddProductSchemaType>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      type: product?.type ?? "",
      image: product?.image ?? "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (product) {
        // Editing mode - populate form
        form.reset({
          name: product.name,
          description: product.description || "",
          type: product.type || "",
          image: product.image || "",
        });
        setImageUrl(product.image || null);
      } else {
        // Creating mode - clear form
        form.reset({
          name: "",
          description: "",
          type: "",
          image: "",
        });
        setImageUrl(null);
      }
    }
  }, [open, product, form]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      // Only show toast if we're editing (product already exists)
      if (isEditing) {
        toast.success("Image uploaded successfully");
      }
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

  const removeImage = async () => {
    if (!isEditing || !product) {
      // If not editing, just clear local state
      setImageUrl(null);
      form.setValue("image", "");
      return;
    }

    try {
      // Update the product in the database to remove the image
      await updateProduct.mutateAsync({
        id: product.id,
        name: product.name,
        description: product.description || "",
        type: product.type || "",
        image: "", // Set image to empty string to remove it
      });

      // Clear local state
      setImageUrl(null);
      form.setValue("image", "");
      
      // Show success message
      toast.success("Image removed successfully");
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const onSubmit = (values: AddProductSchemaType) => {
    const productData = {
      ...values,
      image: imageUrl || undefined,
    };

    console.log("Submitting product data:", productData);

    if (isEditing && product) {
      updateProduct.mutate(
        {
          id: product.id,
          ...productData,
        },
        {
          onSuccess: () => {
            setOpen(false);
            onSuccess?.();
            router.refresh();
          },
        }
      );
    } else {
      addProduct.mutate(
        {
          workflowId,
          ...productData,
        },
        {
          onSuccess: (newProduct) => {
            setOpen(false);
            onSuccess?.();
            onProductCreated?.(newProduct);
            router.refresh();
          },
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct.mutateAsync(product.id);
      setOpen(false);
      onSuccess?.();
      router.refresh();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Product" : "Create New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the product details below."
              : "Create a new product with all the necessary details."}
          </DialogDescription>
        </DialogHeader>

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
                        {imageUrl ? (
                          <div className="relative group/image">
                            <div className="aspect-video relative rounded-md overflow-hidden border">
                              <Image
                                src={imageUrl}
                                alt="Product preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              className="absolute top-3 right-3 size-8 group-hover/image:opacity-80 rounded-full opacity-0 hover:bg-accent/80"
                              onClick={removeImage}
                              disabled={isLoading}
                            >
                              <X className="size-5" />
                            </Button>
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
                                  Click to upload an image
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
                        <FormLabel>Offering name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Give your offering a title..."
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
                        <FormLabel>Offering type</FormLabel>
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

            {/* Product Variants Section - Only show when editing */}
            {isEditing && product && (
              <div className="space-y-4">
                <Separator />
                <ProductVariantsList
                  productId={product.id}
                  workflowId={workflowId}
                  variants={product.variants || []}
                  onVariantChange={onSuccess}
                />
              </div>
            )}

            <DialogFooter className="flex flex-row justify-between w-full">
              {isEditing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isLoading}
                    >
                      {deleteProduct.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        remove this product from the workflow.
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
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Add offering"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
