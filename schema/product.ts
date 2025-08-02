import { z } from "zod";

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