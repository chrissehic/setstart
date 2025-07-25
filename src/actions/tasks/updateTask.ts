"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { TaskStatus, TaskPriority, Responsibility } from "@/types";

interface UpdateTaskInput {
  id: string;
  workflowId: string;
  title?: string;
  category?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  responsibility?: Responsibility;
  dueDate?: string | null;
  assignedPeople?: string[];
  objectiveId?: string | null;
}

export type { UpdateTaskInput };
export async function UpdateTask(data: UpdateTaskInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    // Build update data object
    const updateData: {
      title?: string;
      category?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      responsibility?: Responsibility;
      dueDate?: Date | null;
      objectiveId?: string | null;
      assignedPeople?: {
        deleteMany: Record<string, never>;
        create: { personId: string }[];
      };
    } = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.responsibility !== undefined) updateData.responsibility = data.responsibility;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.objectiveId !== undefined) updateData.objectiveId = data.objectiveId;

    // Handle assigned people updates
    if (data.assignedPeople !== undefined) {
      updateData.assignedPeople = {
        deleteMany: {}, // Remove all existing assignments
        create: data.assignedPeople.map(personId => ({
          personId,
        })),
      };
    }

    const task = await prisma.task.update({
      where: { id: data.id },
      data: updateData,
      include: {
        assignedPeople: {
          include: {
            person: true,
          },
        },
      },
    });

    // Revalidate the project page
    revalidatePath(`/project/${data.workflowId}`);

    return { success: true, task };
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
}
