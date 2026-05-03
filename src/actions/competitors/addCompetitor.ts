"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { CompetitorFormData } from "@/types/workflow";
import { normalizeWebsiteUrl } from "@/lib/utils/normalizeWebsiteUrl";

interface AddCompetitorInput extends CompetitorFormData {
  workflowId: string;
}

export async function addCompetitor(input: AddCompetitorInput) {
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

    // Create competitor with dynamic attributes
    const competitor = await prisma.competitor.create({
      data: {
        workflowId: input.workflowId,
        name: input.name,
        description: input.description,
        website: normalizeWebsiteUrl(input.website ?? "") || null,
        logoImage: input.logoImage,
        attributes: JSON.stringify(input.attributes || {}),
      },
    });

    // Revalidate the workflow page
    revalidatePath(`/project/${input.workflowId}`);

    return { success: true, competitor };
  } catch (error) {
    console.error("Error adding competitor:", error);
    throw new Error("Failed to add competitor");
  }
}
