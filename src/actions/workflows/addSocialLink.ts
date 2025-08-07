"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function AddSocialLink(workflowId: string, data: {
  name?: string;
  url: string;
  handle?: string;
  icon?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  // Verify the workflow belongs to the user
  const workflow = await prisma.workflow.findFirst({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // Create the social link with a default name if not provided
  const socialLink = await prisma.socialLink.create({
    data: {
      workflowId,
      name: data.name || "Website",
      url: data.url,
      handle: data.handle,
      icon: data.icon,
    },
  });

  return socialLink;
} 