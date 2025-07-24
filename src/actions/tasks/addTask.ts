"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


interface AddTaskInput {
  workflowId: string;
  title: string;
  category: string;
  description?: string;
  dueDate?: string; // ISO string
  priority?: "LOW" | "MEDIUM" | "HIGH";
  responsibility?: "IN_HOUSE" | "OUTSOURCED";
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
  assignedPeople?: string[];
  objectiveId?: string;
}

export async function AddTask(data: AddTaskInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  

  const task = await prisma.task.create({
    data: {
      workflowId: data.workflowId,
      title: data.title,
      category: data.category,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority ?? undefined,
      responsibility: data.responsibility ?? "IN_HOUSE",
      status: "NOT_STARTED",
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
