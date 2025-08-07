"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DeleteSocialLink(socialLinkId: string) {
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

  // Delete the social link
  await prisma.socialLink.delete({
    where: {
      id: socialLinkId,
    },
  });

  return { success: true };
} 