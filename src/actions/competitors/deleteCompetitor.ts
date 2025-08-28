"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface DeleteCompetitorInput {
  id: string;
  workflowId: string;
}

export async function deleteCompetitor(input: DeleteCompetitorInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    // Verify workflow belongs to user
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: input.workflowId,
        userId,
      },
    });

    if (!workflow) {
      throw new Error("Workflow not found or access denied");
    }

    // Verify competitor exists and belongs to workflow
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: input.id,
        workflowId: input.workflowId,
      },
    });

    if (!existingCompetitor) {
      throw new Error("Competitor not found");
    }

    // Delete competitor
    await prisma.competitor.delete({
      where: { id: input.id },
    });

    // Revalidate the workflow page
    revalidatePath(`/project/${input.workflowId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting competitor:", error);
    throw new Error("Failed to delete competitor");
  }
}
