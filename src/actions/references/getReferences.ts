"use server";

import { prisma } from "@/lib/prisma";

export async function getReferences(workflowId: string) {
  try {
    const references = await prisma.reference.findMany({
      where: { workflowId },
      orderBy: { createdAt: "desc" },
    });

    // Parse tags from JSON strings
    const parsedReferences = references.map(ref => ({
      ...ref,
      tags: JSON.parse(ref.tags || "[]"),
    }));

    return { success: true, references: parsedReferences };
  } catch (error) {
    console.error("Error fetching references:", error);
    return { success: false, error: "Failed to fetch references" };
  }
}
