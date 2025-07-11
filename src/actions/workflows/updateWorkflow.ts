"use server"

import { prisma } from "@/lib/prisma"
import { updateWorkflowSchema, type updateWorkflowSchemaType } from "../../../schema/workflow"
import { auth } from "@clerk/nextjs/server"
import type { Prisma } from "@/generated/prisma"

export async function UpdateWorkflow(form: updateWorkflowSchemaType) {
  // Validate form data
  const { success, data } = updateWorkflowSchema.safeParse(form)
  if (!success) {
    throw new Error("Invalid form data")
  }

  // Authenticate user
  const { userId } = await auth()
  if (!userId) {
    console.log("Unauthenticated")
    throw new Error("Unauthenticated")
  }

  // Extract the ID and tags from the data
  const { id, tags, ...otherUpdates } = data

  // Prepare the update data with proper Prisma types
  const updateData: Prisma.WorkflowUpdateInput = {
    ...otherUpdates,
  }

  // Handle tags relationship if provided
  if (tags !== undefined) {
    if (tags && tags.length > 0) {
      // Create tags that don't exist and connect all tags
      updateData.tags = {
        set: [], // First disconnect all existing tags
        connectOrCreate: tags.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      }
    } else {
      // If tags array is empty, disconnect all tags
      updateData.tags = {
        set: [],
      }
    }
  }

  // Update workflow in the database
  const result = await prisma.workflow.update({
    where: { id },
    data: updateData,
    include: {
      tags: true, // Include tags in the response
    },
  })

  // Return the updated workflow with tags as objects (not converted to strings)
  return {
    ...result,
    tags: result.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
  }
}
