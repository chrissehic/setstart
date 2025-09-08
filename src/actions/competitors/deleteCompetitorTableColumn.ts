"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface DeleteCompetitorTableColumnInput {
  columnId: string;
  workflowId: string;
}

export async function deleteCompetitorTableColumn(input: DeleteCompetitorTableColumnInput) {
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

    // Verify column belongs to this workflow
    const column = await prisma.competitorTableColumn.findFirst({
      where: {
        id: input.columnId,
        workflowId: input.workflowId,
      },
    });

    if (!column) {
      throw new Error("Column not found or access denied");
    }

    // Delete the column
    await prisma.competitorTableColumn.delete({
      where: {
        id: input.columnId,
      },
    });

    // Revalidate the workflow page
    revalidatePath(`/project/${input.workflowId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting competitor table column:", error);
    throw new Error("Failed to delete competitor table column");
  }
}
