"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Task } from "@/types";

export async function GetTasks(workflowId: string): Promise<Task[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { workflowId },
      include: {
        assignedPeople: {
          include: {
            person: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform Prisma data to match our Task interface
    return tasks.map(task => ({
      id: task.id,
      workflowId: task.workflowId,
      objectiveId: task.objectiveId,
      title: task.title,
      category: task.category,
      description: task.description,
      status: task.status as Task['status'],
      responsibility: task.responsibility as Task['responsibility'],
      priority: task.priority as Task['priority'],
      dueDate: task.dueDate,
      assignedPeople: task.assignedPeople.map(ap => ({
        person: {
          id: ap.person.id,
          name: ap.person.name,
          avatarImage: ap.person.avatarImage || undefined,
        },
      })),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}
