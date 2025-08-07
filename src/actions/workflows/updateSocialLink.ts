"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function UpdateSocialLink(socialLinkId: string, data: {
  name?: string;
  url?: string;
  handle?: string;
  icon?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  // Verify the social link belongs to a workflow owned by the user
  const socialLink = await prisma.socialLink.findFirst({
    where: {
      id: socialLinkId,
      workflow: {
        userId,
      },
    },
  });

  if (!socialLink) {
    throw new Error("Social link not found");
  }

  // Update the social link
  const updatedSocialLink = await prisma.socialLink.update({
    where: {
      id: socialLinkId,
    },
    data,
  });

  return updatedSocialLink;
} 