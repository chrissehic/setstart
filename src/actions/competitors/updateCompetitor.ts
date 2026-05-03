"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { CompetitorFormData } from "@/types/workflow";
import { normalizeWebsiteUrl } from "@/lib/utils/normalizeWebsiteUrl";

interface UpdateCompetitorInput extends Partial<CompetitorFormData> {
  id: string;
  workflowId: string;
}

export async function updateCompetitor(input: UpdateCompetitorInput) {
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

    // Verify competitor exists and belongs to workflow
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: input.id,
        workflowId: input.workflowId,
      },
    });

    if (!existingCompetitor) {
      throw new Error("Competitor not found");
    }

    // Prepare update data
    const updateData: any = {};
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.website !== undefined) {
      const w = normalizeWebsiteUrl(input.website ?? "");
      updateData.website = w ? w : null;
    }
    if (input.logoImage !== undefined) updateData.logoImage = input.logoImage;
    if (input.attributes !== undefined) updateData.attributes = JSON.stringify(input.attributes);

    // Update competitor
    const competitor = await prisma.competitor.update({
      where: { id: input.id },
      data: updateData,
    });

    // Revalidate the workflow page
    revalidatePath(`/project/${input.workflowId}`);

    return { success: true, competitor };
  } catch (error) {
    console.error("Error updating competitor:", error);
    throw new Error("Failed to update competitor");
  }
}
