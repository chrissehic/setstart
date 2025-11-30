"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface UpdateDocumentInput {
  documentId: string;
  workflowId: string;
  name?: string;
  description?: string;
  status?: string;
  tags?: string[];
  content?: string; // JSON string for block-based editor content
}

export async function updateDocumentSimple(input: UpdateDocumentInput) {
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

    // Update document
    const document = await prisma.document.update({
      where: { id: input.documentId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.tags !== undefined && { tags: JSON.stringify(input.tags) }),
        ...(input.content !== undefined && { content: input.content }),
      },
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true, document };
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false, error: "Failed to update document" };
  }
}
