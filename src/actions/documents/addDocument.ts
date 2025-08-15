"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface AddDocumentInput {
  workflowId: string;
  title: string;
  description?: string;
  type: "pdf" | "image" | "document";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  tags: string[];
  category?: string;
  status?: "draft" | "review" | "approved" | "archived";
  version?: string;
  uploadedBy?: string;
}

export async function addDocument(input: AddDocumentInput) {
  try {
    const document = await prisma.document.create({
      data: {
        workflowId: input.workflowId,
        title: input.title,
        description: input.description,
        type: input.type,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        tags: JSON.stringify(input.tags),
        category: input.category,
        status: input.status || "draft",
        version: input.version || "1.0",
        uploadedBy: input.uploadedBy,
      },
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true, document };
  } catch (error) {
    console.error("Error adding document:", error);
    return { success: false, error: "Failed to add document" };
  }
}
