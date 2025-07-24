"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TaskPriority } from "@/types/workflow";

interface UpdateObjectiveInput {
  id: string;
  workflowId: string;
  title?: string;
  description?: string | null;
  priority?: TaskPriority | null;
}

export async function updateObjective(input: UpdateObjectiveInput) {
  try {
    const objective = await prisma.objective.update({
      where: { id: input.id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.priority !== undefined && { priority: input.priority }),
      },
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true, objective };
  } catch (error) {
    console.error("Error updating objective:", error);
    return { success: false, error: "Failed to update objective" };
  }
}
