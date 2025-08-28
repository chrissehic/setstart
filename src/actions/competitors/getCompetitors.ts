"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getCompetitors(workflowId: string) {
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

    // Get competitors with parsed attributes
    const competitors = await prisma.competitor.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON attributes back to objects
    const parsedCompetitors = competitors.map(competitor => ({
      ...competitor,
      attributes: competitor.attributes ? JSON.parse(competitor.attributes) : {},
    }));

    return { success: true, competitors: parsedCompetitors };
  } catch (error) {
    console.error("Error fetching competitors:", error);
    throw new Error("Failed to fetch competitors");
  }
}
