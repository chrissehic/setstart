"use server";

import { prisma } from "@/lib/prisma";

export async function getObjectives(workflowId: string) {
  try {
    const objectives = await prisma.objective.findMany({
      where: { workflowId },
      include: {
        tasks: {
          include: {
            assignedPeople: {
              include: {
                person: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, objectives };
  } catch (error) {
    console.error("Error fetching objectives:", error);
    return { success: false, error: "Failed to fetch objectives" };
  }
}

export async function getObjectiveById(id: string) {
  try {
    const objective = await prisma.objective.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignedPeople: {
              include: {
                person: true,
              },
            },
          },
        },
      },
    });

    if (!objective) {
      return { success: false, error: "Objective not found" };
    }

    return { success: true, objective };
  } catch (error) {
    console.error("Error fetching objective:", error);
    return { success: false, error: "Failed to fetch objective" };
  }
}
