"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface DeleteDocumentInput {
  documentId: string;
  workflowId: string;
}

export async function deleteDocumentSimple(input: DeleteDocumentInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    // Verify document exists and belongs to workflow
    const existingDocument = await prisma.document.findFirst({
      where: { 
        id: input.documentId,
        workflowId: input.workflowId 
      }
    });

    if (!existingDocument) {
      return { success: false, error: "Document not found" };
    }

    // Delete document and related data
    await prisma.$transaction(async (tx) => {
      // Delete pages first (due to foreign key constraints)
      await tx.documentPage.deleteMany({
        where: { documentId: input.documentId }
      });

      // Delete document
      await tx.document.delete({
        where: { id: input.documentId }
      });
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}
