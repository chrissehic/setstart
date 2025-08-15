"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getDocuments(workflowId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    const documents = await prisma.document.findMany({
      where: { workflowId },
      include: {
        tags: true,
        pages: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw new Error("Failed to fetch documents");
  }
}
