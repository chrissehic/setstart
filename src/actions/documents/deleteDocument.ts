import { PrismaClient } from "@prisma/client";
import { deleteDocumentInputSchema } from "../../../schema/document";

// Types
export type MutationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: any } };

// Helper function to check workflow access (assume this exists)
declare function checkWorkflowAccess(user: any, workflowId: string, permission: 'read' | 'write'): Promise<boolean>;

/**
 * Deletes a document and all related data
 */
export async function deleteDocument(
  prisma: PrismaClient,
  ctx: { user: any },
  input: unknown
): Promise<MutationResult<{ deletedDocumentId: string }>> {
  try {
    // Validate input
    const validatedInput = deleteDocumentInputSchema.parse(input);
    
    // Check authorization
    const hasAccess = await checkWorkflowAccess(ctx.user, validatedInput.workflowId, 'write');
    if (!hasAccess) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to delete documents in this workflow' }
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

    // Delete document and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete pages first (due to foreign key constraints)
      await tx.documentPage.deleteMany({
        where: { documentId: validatedInput.documentId }
      });

      // Delete document (tags will be automatically disconnected due to many-to-many)
      await tx.document.delete({
        where: { id: validatedInput.documentId }
      });
    });

    return { 
      success: true, 
      data: { deletedDocumentId: validatedInput.documentId } 
    };

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

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      };
    }

    console.error('Document deletion error:', error);
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete document' }
    };
  }
}
