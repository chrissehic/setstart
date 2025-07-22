"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface DeleteObjectiveInput {
  id: string;
  workflowId: string;
}

export async function deleteObjective(input: DeleteObjectiveInput) {
  try {
    await prisma.objective.delete({
      where: { id: input.id },
    });

    revalidatePath(`/workflow/${input.workflowId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting objective:", error);
    return { success: false, error: "Failed to delete objective" };
  }
}
