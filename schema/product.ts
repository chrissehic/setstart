import { z } from "zod";

// Schema for product variant attributes (flexible JSON structure)
export const productVariantAttributesSchema = z.record(z.any()).optional();

// Schema for individual product variant
export const productVariantSchema = z.object({
  id: z.string().optional(), // Optional for new variants
  name: z.string().min(1, "Variant name is required"),
  description: z.string().optional(),
  attributes: productVariantAttributesSchema,
  price: z.number().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const addProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  image: z.string().optional(),
});

export const updateProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  image: z.string().optional(),
});

export const deleteProductSchema = z.object({
  id: z.string(),
});

// Schema for managing variants separately
export const addProductVariantSchema = z.object({
  productId: z.string(),
  name: z.string().min(1, "Variant name is required"),
  description: z.string().optional(),
  attributes: productVariantAttributesSchema,
  price: z.number().optional(),
  image: z.string().optional(),
});

export const updateProductVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variant name is required"),
  description: z.string().optional(),
  attributes: productVariantAttributesSchema,
  price: z.number().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const deleteProductVariantSchema = z.object({
  id: z.string(),
}); 