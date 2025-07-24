"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface DeleteTaskInput {
  id: string;
  workflowId: string;
}

export async function DeleteTask(data: DeleteTaskInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    await prisma.task.delete({
      where: { id: data.id },
    });

    // Revalidate the workflow editor page
    revalidatePath(`/project/${data.workflowId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}
