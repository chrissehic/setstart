"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

interface AddDocumentInput {
  workflowId: string;
  name: string;
  fileUrl?: string;
  fileType?: "pdf" | "image";
  sizeBytes?: number;
  metadata?: string;
  content?: string; // JSON string for block-based editor content
  isEditable?: boolean; // Whether this is an editable document
}

export async function addDocument(input: AddDocumentInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    const document = await prisma.document.create({
      data: {
        workflowId: input.workflowId,
        name: input.name,
        fileUrl: input.fileUrl || null,
        fileType: input.fileType || null,
        sizeBytes: input.sizeBytes || null,
        metadata: input.metadata,
        content: input.content || null,
        isEditable: input.isEditable || false,
        userId: userId,
      },
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true, document };
  } catch (error) {
    console.error("Error adding document:", error);
    return { success: false, error: "Failed to add document" };
  }
}
