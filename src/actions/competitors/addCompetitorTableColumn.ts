"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { CompetitorTableColumnFormData } from "@/types/workflow";

interface AddCompetitorTableColumnInput extends CompetitorTableColumnFormData {
  workflowId: string;
}

export async function addCompetitorTableColumn(input: AddCompetitorTableColumnInput) {
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

    // Create table column
    const column = await prisma.competitorTableColumn.create({
      data: {
        workflowId: input.workflowId,
        name: input.name,
        type: input.type,
        required: input.required,
        options: input.options ? JSON.stringify(input.options) : null,
        order: input.order,
        isActive: input.isActive ?? true,
      },
    });

    // Revalidate the workflow page
    revalidatePath(`/project/${input.workflowId}`);

    return { success: true, column };
  } catch (error) {
    console.error("Error adding competitor table column:", error);
    throw new Error("Failed to add competitor table column");
  }
}
