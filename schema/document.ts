import { z } from "zod";

// Constants
export const MAX_DOCUMENT_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
export const MAX_DOCUMENT_NAME_LENGTH = 255;
export const MAX_TAGS_COUNT = 10;

// Base schemas
export const documentFileTypeSchema = z.enum(["pdf", "image"]);
export const documentStatusSchema = z.enum(["uploaded", "processing", "converted", "failed"]);

// Input schemas
export const createDocumentInputSchema = z.object({
  workflowId: z.string().min(1, "Workflow ID is required"),
  name: z.string()
    .min(1, "Document name is required")
    .max(MAX_DOCUMENT_NAME_LENGTH, `Document name must be ${MAX_DOCUMENT_NAME_LENGTH} characters or less`),
  fileUrl: z.string().url("Valid file URL is required"),
  fileType: documentFileTypeSchema,
  sizeBytes: z.number()
    .int("File size must be a whole number")
    .positive("File size must be positive")
    .max(MAX_DOCUMENT_SIZE_BYTES, `File size must be ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB or less`),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string().min(1, "Tag name cannot be empty"))
    .max(MAX_TAGS_COUNT, `Maximum ${MAX_TAGS_COUNT} tags allowed`)
    .optional()
    .default([]),
});

export const updateDocumentInputSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  workflowId: z.string().min(1, "Workflow ID is required"),
  name: z.string()
    .min(1, "Document name is required")
    .max(MAX_DOCUMENT_NAME_LENGTH, `Document name must be ${MAX_DOCUMENT_NAME_LENGTH} characters or less`)
    .optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string().min(1, "Tag name cannot be empty"))
    .max(MAX_TAGS_COUNT, `Maximum ${MAX_TAGS_COUNT} tags allowed`)
    .optional(),
  status: documentStatusSchema.optional(),
  convertedUrl: z.string().url("Valid converted URL is required").optional(),
}).refine((data) => {
  // Ensure convertedUrl exists when status is 'converted'
  if (data.status === "converted" && !data.convertedUrl) {
    return false;
  }
  return true;
}, {
  message: "Converted URL is required when status is 'converted'",
  path: ["convertedUrl"]
});

export const deleteDocumentInputSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  workflowId: z.string().min(1, "Workflow ID is required"),
  force: z.boolean().optional().default(false),
});

// Types
export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
export type DeleteDocumentInput = z.infer<typeof deleteDocumentInputSchema>;
export type DocumentFileType = z.infer<typeof documentFileTypeSchema>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
