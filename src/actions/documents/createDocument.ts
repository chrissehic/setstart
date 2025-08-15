import { PrismaClient } from "@prisma/client";
import { createDocumentInputSchema } from "../../../schema/document";

// Types
export type DocumentWithRelations = PrismaClient.DocumentGetPayload<{
  include: { tags: true; pages: true }
}>;

export type MutationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: any } };

// Helper function to check workflow access (assume this exists)
declare function checkWorkflowAccess(user: any, workflowId: string, permission: 'read' | 'write'): Promise<boolean>;
declare function enqueueDocumentProcessing(documentId: string): Promise<void>;

/**
 * Creates a new document with tags in a single transaction
 */
export async function createDocument(
  prisma: PrismaClient,
  ctx: { user: any },
  input: unknown
): Promise<MutationResult<DocumentWithRelations>> {
  try {
    // Validate input
    const validatedInput = createDocumentInputSchema.parse(input);
    
    // Check authorization
    const hasAccess = await checkWorkflowAccess(ctx.user, validatedInput.workflowId, 'write');
    if (!hasAccess) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to create documents in this workflow' }
      };
    }

    // Optional: Check for duplicate documents (same file URL)
    const existingDocument = await prisma.document.findFirst({
      where: { 
        workflowId: validatedInput.workflowId,
        fileUrl: validatedInput.fileUrl 
      }
    });
    
    if (existingDocument) {
      return {
        success: false,
        error: { 
          code: 'CONFLICT', 
          message: 'A document with this file already exists in this workflow',
          details: { existingDocumentId: existingDocument.id }
        }
      };
    }

    // Create document and tags in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or connect tags
      const tagOperations = validatedInput.tags.map(tagName => ({
        where: { name: tagName },
        create: { name: tagName }
      }));

      const document = await tx.document.create({
        data: {
          workflowId: validatedInput.workflowId,
          name: validatedInput.name,
          fileUrl: validatedInput.fileUrl,
          fileType: validatedInput.fileType,
          sizeBytes: validatedInput.sizeBytes,
          metadata: validatedInput.metadata ? JSON.stringify(validatedInput.metadata) : null,
          createdById: ctx.user.id,
          tags: {
            connectOrCreate: tagOperations
          }
        },
        include: {
          tags: true,
          pages: true
        }
      });

      return document;
    });

    // Enqueue background processing (optional)
    try {
      await enqueueDocumentProcessing(result.id);
    } catch (error) {
      console.warn('Failed to enqueue document processing:', error);
      // Don't fail the mutation if background job fails
    }

    return { success: true, data: result };

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.message
        }
      };
    }

    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return {
        success: false,
        error: { code: 'CONFLICT', message: 'Document with this name already exists in this workflow' }
      };
    }

    console.error('Document creation error:', error);
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' }
    };
  }
}
