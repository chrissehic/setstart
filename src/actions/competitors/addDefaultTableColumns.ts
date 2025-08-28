"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addDefaultTableColumns(workflowId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    // Verify workflow belongs to user
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId,
      },
    });

    if (!workflow) {
      throw new Error("Workflow not found or access denied");
    }

    // Check if columns already exist
    const existingColumns = await prisma.competitorTableColumn.findMany({
      where: { workflowId },
    });

    if (existingColumns.length > 0) {
      return { success: true, message: "Default columns already exist" };
    }

    // Add default columns
    const defaultColumns = [
      {
        name: "Market Share",
        type: "text",
        required: false,
        order: 1,
      },
      {
        name: "Pricing",
        type: "text",
        required: false,
        order: 2,
      },
      {
        name: "Focus",
        type: "text",
        required: false,
        order: 3,
      },
      {
        name: "Strengths",
        type: "text",
        required: false,
        order: 4,
      },
      {
        name: "Weaknesses",
        type: "text",
        required: false,
        order: 5,
      },
    ];

    await prisma.competitorTableColumn.createMany({
      data: defaultColumns.map(column => ({
        ...column,
        workflowId,
        isActive: true,
      })),
    });

    // Revalidate the workflow page
    revalidatePath(`/project/${workflowId}`);

    return { success: true, message: "Default columns added successfully" };
  } catch (error) {
    console.error("Error adding default table columns:", error);
    throw new Error("Failed to add default table columns");
  }
}
