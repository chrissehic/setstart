"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { CompetitorFormData } from "@/types/workflow";
import { normalizeWebsiteUrl } from "@/lib/utils/normalizeWebsiteUrl";

export async function addCompetitorsBulk(input: {
  workflowId: string;
  competitors: CompetitorFormData[];
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  if (input.competitors.length === 0) {
    return { success: true as const, created: 0 };
  }

  const workflow = await prisma.workflow.findFirst({
    where: { id: input.workflowId, userId },
  });
  if (!workflow) {
    throw new Error("Workflow not found or access denied");
  }

  await prisma.competitor.createMany({
    data: input.competitors.map((c) => ({
      workflowId: input.workflowId,
      name: c.name,
      description: c.description?.trim() ? c.description : null,
      website: (() => {
        const w = normalizeWebsiteUrl(c.website ?? "");
        return w || null;
      })(),
      logoImage: c.logoImage?.trim() ? c.logoImage : null,
      attributes: JSON.stringify(c.attributes ?? {}),
    })),
  });

  revalidatePath(`/project/${input.workflowId}`);
  return { success: true as const, created: input.competitors.length };
}
