"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TaskPriority } from "@/types/workflow";

interface AddObjectiveInput {
  workflowId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export async function addObjective(input: AddObjectiveInput) {
  try {
    const objective = await prisma.objective.create({
      data: {
        workflowId: input.workflowId,
        title: input.title,
        description: input.description,
        priority: input.priority,
      },
    });

    revalidatePath(`/project/${input.workflowId}`);
    return { success: true, objective };
  } catch (error) {
    console.error("Error adding objective:", error);
    return { success: false, error: "Failed to add objective" };
  }
}
