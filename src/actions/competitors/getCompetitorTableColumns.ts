"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getCompetitorTableColumns(workflowId: string) {
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

    // Get table columns with parsed options
    const columns = await prisma.competitorTableColumn.findMany({
      where: { 
        workflowId,
        isActive: true 
      },
      orderBy: { order: 'asc' },
    });

    // Parse JSON options back to arrays
    const parsedColumns = columns.map(column => ({
      ...column,
      options: column.options ? JSON.parse(column.options) : undefined,
    }));

    return { success: true, columns: parsedColumns };
  } catch (error) {
    console.error("Error fetching competitor table columns:", error);
    throw new Error("Failed to fetch competitor table columns");
  }
}
