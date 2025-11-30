"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

interface CreateEditableDocumentInput {
  workflowId: string;
  name: string;
  content?: string; // JSON string for block-based editor content
}

export async function createEditableDocument(input: CreateEditableDocumentInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    // Default empty block structure
    const defaultContent = JSON.stringify([
      {
        id: "1",
        type: "paragraph",
        content: { text: "" },
      },
    ]);

    const document = await prisma.document.create({
      data: {
        workflowId: input.workflowId,
        name: input.name,
        fileUrl: null, // Explicitly set to null for editable documents
        fileType: null, // Explicitly set to null for editable documents
        sizeBytes: null, // Explicitly set to null for editable documents
        content: input.content || defaultContent,
        isEditable: true,
        userId: userId,
        status: "uploaded", // Explicitly set status even though it has a default
      },
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true, document };
  } catch (error) {
    console.error("Error creating editable document:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to create editable document: ${errorMessage}` };
  }
}

