"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { addProductSchema } from "@/../schema/product";
import { addProduct } from "@/actions/products/addProduct";
import { updateProduct } from "@/actions/products/updateProduct";
import { deleteProduct } from "@/actions/products/deleteProduct";
import type { Product } from "@/types/workflow";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  children: React.ReactNode;
  workflowId: string;
  product?: Product;
  readOnly?: boolean;
}

export function ProductModal({
  children,
  workflowId,
  product,
  readOnly = false,
}: ProductModalProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const isEditing = !!product;
  const dialogTitle = isEditing ? "Edit Product" : "Add a new product";

  const Trigger = (
    <span className="text-start cursor-pointer" aria-disabled={readOnly}>
      {children}
    </span>
  );

  const FormWrapper = (
    <ProductForm
      onClose={() => setOpen(false)}
      workflowId={workflowId}
      product={product}
    />
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild disabled={readOnly}>{Trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
        </DrawerHeader>
        {FormWrapper}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={readOnly}>{Trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {FormWrapper}
      </DialogContent>
    </Dialog>
  );
}

interface ProductFormProps {
  className?: string;
  onClose: () => void;
  workflowId: string;
  product?: Product;
}

function ProductForm({
  className,
  onClose,
  workflowId,
  product,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = React.useState<string | null>(product?.image || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const isEditing = !!product;

  const form = useForm<AddProductSchemaType>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      type: product?.type ?? "",
      image: product?.image ?? "",
    },
  });

  const addMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success("Product added successfully");
      onClose();
      window.location.reload(); // Refresh to show new product
    },
    onError: () => toast.error("Failed to add product. Please try again."),
  });

  const updateMutation = useMutation({
    mutationFn: (data: AddProductSchemaType) => {
      if (!product?.id) throw new Error("Product ID is required for update");
      return updateProduct({ id: product.id, ...data });
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
      onClose();
      window.location.reload(); // Refresh to show updated product
    },
    onError: () => toast.error("Failed to update product. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      onClose();
      window.location.reload(); // Refresh to show updated list
    },
    onError: () => toast.error("Failed to delete product. Please try again."),
  });

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
      form.setValue("image", result.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    form.setValue("image", "");
  };

  const onSubmit = (values: AddProductSchemaType) => {
    if (isEditing && product) {
      updateMutation.mutate(values);
    } else {
      addMutation.mutate({ ...values, workflowId });
    }
  };

  const handleDelete = () => {
    if (product) {
      deleteMutation.mutate(product.id);
    }
  };

  const isPending =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-6", className)}
        aria-busy={isPending}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Give your product a title..." {...field} />
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
                  <FormLabel>Product Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Mobile App">Mobile App</SelectItem>
                      <SelectItem value="Web App">Web App</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Physical Product">Physical Product</SelectItem>
                      <SelectItem value="Digital Product">Digital Product</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your product, service, or offering..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {imageUrl ? (
                      <div className="relative">
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
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
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
                      ref={fileInputRef}
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
        </div>

        <div className="flex justify-between pt-4">
          {isEditing ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
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
                    className={buttonVariants({ variant: "destructive" })}
                    onClick={handleDelete}
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <span /> // for spacing
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 