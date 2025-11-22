"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import {
  useAddProductVariant,
  useUpdateProductVariant,
} from "@/hooks/useProductVariants";
import { ProductVariant } from "@/types/workflow";
import { toast } from "sonner";
import Image from "next/image";
import { parseVariantAttributes } from "@/lib/helpers/variantUtils";

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  description: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

type VariantSchemaType = z.infer<typeof variantSchema>;

interface ProductVariantModalProps {
  productId: string;
  workflowId?: string;
  variant?: ProductVariant; // If provided, we're editing
  children?: React.ReactNode;
  onSuccess?: () => void;
  // Controlled state props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductVariantModal({
  productId,
  workflowId,
  variant,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: ProductVariantModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [attributes, setAttributes] = useState<Array<{ id: string; key: string; value: string }>>([]);
  const [originalValues, setOriginalValues] = useState<{
    name: string;
    description: string;
    price: number | undefined;
    image: string | null;
    attributes: Record<string, string>;
  } | null>(null);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const addVariant = useAddProductVariant(workflowId || "");
  const updateVariant = useUpdateProductVariant(workflowId || "");

  const isEditing = !!variant;
  const isLoading = addVariant.isPending || updateVariant.isPending;

  const form = useForm({
    resolver: zodResolver(variantSchema),
    mode: "onChange", // Enable validation on change to update isValid
    defaultValues: {
      name: variant?.name ?? "",
      description: variant?.description ?? "",
      price: variant?.price ?? undefined,
      image: variant?.image ?? "",
      attributes: {},
    },
  });

  // Watch form values for change detection
  const watchedValues = form.watch();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (variant) {
        // Editing mode - populate form
        form.reset({
          name: variant.name,
          description: variant.description || "",
          price: variant.price || undefined,
          image: variant.image || "",
          attributes: {},
        });
        setImageUrl(variant.image || null);
        // Parse attributes from JSON string using helper
        const parsedAttributes = parseVariantAttributes(variant.attributes);
        // Convert Record to array with IDs
        let attrsArray: Array<{ id: string; key: string; value: string }> = [];
        if (parsedAttributes && Object.keys(parsedAttributes).length > 0) {
          attrsArray = Object.entries(parsedAttributes).map(([key, value], index) => ({
            id: `attr_${index}_${Date.now()}`,
            key,
            value: value as string,
          }));
          setAttributes(attrsArray);
        } else {
          setAttributes([]);
        }
        
        // Store original values for change detection
        setOriginalValues({
          name: variant.name,
          description: variant.description || "",
          price: variant.price || undefined,
          image: variant.image || null,
          attributes: parsedAttributes || {},
        });
      } else {
        // Creating mode - clear form
        form.reset({
          name: "",
          description: "",
          price: undefined,
          image: "",
          attributes: {},
        });
        setImageUrl(null);
        setAttributes([]);
        setOriginalValues(null);
      }
    }
  }, [open, variant, form]);

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

  const removeImage = () => {
    setImageUrl(null);
  };

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      {
        id: `attr_${Date.now()}_${Math.random()}`,
        key: `attribute_${prev.length + 1}`,
        value: "",
      },
    ]);
  };

  const removeAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  // Check if there are any changes (only for editing mode)
  const hasChanges = isEditing && originalValues ? (() => {
    // Compare form values (normalize empty strings and null)
    const normalizeString = (val: string | null | undefined) => val || "";
    if (normalizeString(watchedValues.name) !== normalizeString(originalValues.name)) return true;
    if (normalizeString(watchedValues.description) !== normalizeString(originalValues.description)) return true;
    if (watchedValues.price !== originalValues.price) return true;
    
    // Compare image (normalize null and empty string)
    const normalizeImage = (val: string | null | undefined) => val || null;
    if (normalizeImage(imageUrl) !== normalizeImage(originalValues.image)) return true;
    
    // Compare attributes
    const currentAttributes = attributes.reduce((acc, attr) => {
      if (attr.key.trim()) {
        acc[attr.key.trim()] = attr.value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    const originalKeys = Object.keys(originalValues.attributes || {});
    const currentKeys = Object.keys(currentAttributes);
    
    if (originalKeys.length !== currentKeys.length) return true;
    
    for (const key of originalKeys) {
      if ((originalValues.attributes[key] || "") !== (currentAttributes[key] || "")) {
        return true;
      }
    }
    
    return false;
  })() : true; // Always allow changes for new variants

  const onSubmit = (values: VariantSchemaType) => {
    // Convert attributes array back to Record format
    const attributesRecord = attributes.reduce((acc, attr) => {
      if (attr.key.trim()) {
        acc[attr.key.trim()] = attr.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const variantData = {
      ...values,
      image: imageUrl || undefined,
      attributes: Object.keys(attributesRecord).length > 0 ? attributesRecord : undefined,
    };

    if (isEditing && variant) {
      updateVariant.mutate(
        {
          id: variant.id,
          ...variantData,
        },
        {
          onSuccess: () => {
            setOpen(false);
            onSuccess?.();
          },
        }
      );
    } else {
      addVariant.mutate(
        {
          productId,
          ...variantData,
        },
        {
          onSuccess: () => {
            setOpen(false);
            onSuccess?.();
          },
        }
      );
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
            {isEditing ? "Edit Variant" : "Add New Variant"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the variant details below."
              : "Add a new variant to your product with specific attributes."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-row gap-4">
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem className="flex-2">
                    <FormLabel>Variant Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {imageUrl ? (
                          <div className="relative group/image">
                            <div className="aspect-video relative rounded-md overflow-hidden border">
                              <Image
                                src={imageUrl}
                                alt="Variant preview"
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
                            className="border-2 h-full flex flex-col justify-center items-center border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                            onClick={() =>
                              document
                                .getElementById("variant-image-upload")
                                ?.click()
                            }
                          >
                            {isUploading ? (
                              <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            ) : (
                              <div className="space-y-2 h-full flex flex-col justify-center items-center">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload a variant image
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <input
                          id="variant-image-upload"
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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Chocolate, Vanilla, Large, Premium..."
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this variant..."
                          rows={3}
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

            {/* Dynamic Attributes Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="flex flex-col items-start">
                  Attributes
                  <p className="text-sm text-muted-foreground">
                    Add Attribute&quot; to define specific characteristics like flavor, size, color, etc.
                  </p>
                </FormLabel>

                <div className="flex gap-2">
                  {/* <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const examples = getExampleAttributes("Food");
                        setAttributes(examples);
                      }}
                      disabled={isLoading}
                    >
                      Load Examples
                    </Button> */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAttribute}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Attribute
                  </Button>
                </div>
                
              </div>

              {attributes.length === 0 && (
                <div key="no-attributes" className="py-3 border border-dashed border-muted rounded-md px-3">
                  <p className="text-sm text-muted-foreground text-center">
                    No attributes added yet.
                  </p>
                </div>
              )}
              {attributes.length > 0 && (
                <div className="space-y-2">
                  {attributes.map((attr) => (
                    <div key={attr.id} className="flex gap-2">
                      <Input
                        variant="underline"
                        placeholder="Attribute name (e.g., Flavor, Size, Color)"
                        value={attr.key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          setAttributes((prev) => {
                            // Check if new key already exists in another attribute
                            const keyExists = prev.some(
                              (a) => a.id !== attr.id && a.key.trim() === newKey.trim() && newKey.trim() !== ""
                            );
                            if (keyExists) return prev; // Don't update if duplicate
                            
                            return prev.map((a) =>
                              a.id === attr.id ? { ...a, key: newKey } : a
                            );
                          });
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => {
                          setAttributes((prev) =>
                            prev.map((a) =>
                              a.id === attr.id ? { ...a, value: e.target.value } : a
                            )
                          );
                        }}
                        disabled={isLoading}
                        className="flex-1"
                        variant="underline"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttribute(attr.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

           
            </div>

            <DialogFooter>
              <div className="flex gap-2 w-full justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !form.formState.isValid || (isEditing && !hasChanges)}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Add Variant"
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
