"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { TaskStatus, TaskPriority, Responsibility } from "@/types";

interface AddTaskInput {
  workflowId: string;
  title: string;
  category: string;
  description?: string;
  dueDate?: string; // ISO string
  priority?: TaskPriority;
  responsibility?: Responsibility;
  status?: TaskStatus;
  assignedPeople?: string[];
  objectiveId?: string;
}

// Helper function to safely parse a date string
function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string provided: "${dateString}". Skipping dueDate.`);
    return null;
  }
  
  return date;
}

export async function AddTask(data: AddTaskInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  // Safely parse the dueDate
  const parsedDueDate = parseDate(data.dueDate);

  const task = await prisma.task.create({
    data: {
      workflowId: data.workflowId,
      title: data.title,
      category: data.category,
      description: data.description,
      dueDate: parsedDueDate,
      priority: data.priority ?? undefined,
      responsibility: data.responsibility ?? Responsibility.IN_HOUSE,
      status: data.status ?? TaskStatus.NOT_STARTED,
      objectiveId: data.objectiveId ?? null,
      assignedPeople: data.assignedPeople
        ? {
            create: data.assignedPeople.map(personId => ({
              personId,
            })),
          }
        : undefined,
    },
  });

  // 🟢 This ensures the editor page fetches updated data
  revalidatePath(`/project/${data.workflowId}`);

  return { success: true, task };
}
