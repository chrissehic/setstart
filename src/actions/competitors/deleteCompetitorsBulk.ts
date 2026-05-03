"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteCompetitorsBulk(input: {
  workflowId: string;
  ids: string[];
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const unique = [...new Set(input.ids.filter(Boolean))];
  if (unique.length === 0) {
    return { success: true as const, deleted: 0 };
  }

  const workflow = await prisma.workflow.findFirst({
    where: { id: input.workflowId, userId },
  });
  if (!workflow) {
    throw new Error("Workflow not found or access denied");
  }

  const { count } = await prisma.competitor.deleteMany({
    where: {
      workflowId: input.workflowId,
      id: { in: unique },
    },
  });

  revalidatePath(`/project/${input.workflowId}`);
  return { success: true as const, deleted: count };
}
