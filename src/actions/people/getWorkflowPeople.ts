"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getWorkflowPeople(workflowId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    const workflowPeople = await prisma.rolesInWorkflow.findMany({
      where: { workflowId },
      include: {
        person: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transform to match the Person interface
    const people = workflowPeople.map(wp => ({
      id: wp.person.id,
      name: wp.person.name,
      avatarImage: wp.person.avatarImage || undefined,
      role: wp.role,
    }));

    return people;
  } catch (error) {
    console.error("Error fetching workflow people:", error);
    throw new Error("Failed to fetch workflow people");
  }
}
