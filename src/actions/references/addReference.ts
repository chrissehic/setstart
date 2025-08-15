"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface AddReferenceInput {
  workflowId: string;
  title: string;
  sourcePlatform: string;
  url: string;
  tags: string[];
  description?: string;
  relatedProductId?: string;
  addedBy?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  notes?: string;
}

export async function addReference(input: AddReferenceInput) {
  try {
    const reference = await prisma.reference.create({
      data: {
        workflowId: input.workflowId,
        title: input.title,
        sourcePlatform: input.sourcePlatform,
        url: input.url,
        tags: JSON.stringify(input.tags),
        description: input.description,
        relatedProductId: input.relatedProductId,
        addedBy: input.addedBy,
        thumbnailUrl: input.thumbnailUrl,
        durationSeconds: input.durationSeconds || 0,
        notes: input.notes,
      },
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true, reference };
  } catch (error) {
    console.error("Error adding reference:", error);
    return { success: false, error: "Failed to add reference" };
  }
}
