import { PrismaClient } from "@prisma/client";
import { updateDocumentInputSchema } from "../../../schema/document";

// Types
export type DocumentWithRelations = PrismaClient.DocumentGetPayload<{
  include: { tags: true; pages: true }
}>;

export type MutationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: any } };

// Helper function to check workflow access (assume this exists)
declare function checkWorkflowAccess(user: any, workflowId: string, permission: 'read' | 'write'): Promise<boolean>;

/**
 * Updates an existing document, including tag management
 */
export async function updateDocument(
  prisma: PrismaClient,
  ctx: { user: any },
  input: unknown
): Promise<MutationResult<DocumentWithRelations>> {
  try {
    // Validate input
    const validatedInput = updateDocumentInputSchema.parse(input);
    
    // Check authorization
    const hasAccess = await checkWorkflowAccess(ctx.user, validatedInput.workflowId, 'write');
    if (!hasAccess) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to update documents in this workflow' }
      };
    }

    // Verify document exists and belongs to workflow
    const existingDocument = await prisma.document.findFirst({
      where: { 
        id: validatedInput.documentId,
        workflowId: validatedInput.workflowId 
      }
    });

    if (!existingDocument) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      };
    }

    // Update document and tags in transaction
    const result = await prisma.$transaction(async (tx) => {
      // If tags are provided, replace the entire set
      let tagOperations: any = undefined;
      if (validatedInput.tags !== undefined) {
        // Disconnect all existing tags
        await tx.document.update({
          where: { id: validatedInput.documentId },
          data: { tags: { set: [] } }
        });

        // Connect or create new tags
        tagOperations = validatedInput.tags.map(tagName => ({
          where: { name: tagName },
          create: { name: tagName }
        }));
      }

      const document = await tx.document.update({
        where: { id: validatedInput.documentId },
        data: {
          ...(validatedInput.name && { name: validatedInput.name }),
          ...(validatedInput.metadata !== undefined && { 
            metadata: validatedInput.metadata ? JSON.stringify(validatedInput.metadata) : null 
          }),
          ...(validatedInput.status && { status: validatedInput.status }),
          ...(validatedInput.convertedUrl && { convertedUrl: validatedInput.convertedUrl }),
          ...(tagOperations && { tags: { connectOrCreate: tagOperations } })
        },
        include: {
          tags: true,
          pages: true
        }
      });

      return document;
    });

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

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      };
    }

    console.error('Document update error:', error);
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update document' }
    };
  }
}
