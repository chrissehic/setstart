"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function cleanupHardcodedColumns(workflowId: string) {
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

    // Remove hardcoded columns if they exist
    const hardcodedColumnNames = [
      "Market Share",
      "Pricing", 
      "Focus",
      "Strengths",
      "Weaknesses"
    ];

    const deletedColumns = await prisma.competitorTableColumn.deleteMany({
      where: {
        workflowId,
        name: {
          in: hardcodedColumnNames
        }
      }
    });

    // Revalidate the workflow page
    revalidatePath(`/project/${workflowId}`);

    return { 
      success: true, 
      message: `Cleaned up ${deletedColumns.count} hardcoded columns`,
      deletedCount: deletedColumns.count
    };
  } catch (error) {
    console.error("Error cleaning up hardcoded columns:", error);
    throw new Error("Failed to clean up hardcoded columns");
  }
}
