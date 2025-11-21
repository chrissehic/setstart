"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function getWorkflow(workflowId: string) {
  // Authenticate user
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthenticated")
  }

  // Fetch workflow with all relations
  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
    },
    include: {
      tags: true,
      objectives: {
        include: {
          tasks: true,
        },
      },
      tasks: true,
      people: {
        include: {
          person: true,
        },
      },
      products: {
        include: {
          variants: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      socialLinks: true,
    },
  })

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  return workflow
}
