"use server";

import { prisma } from "@/lib/prisma";
import { updatePersonSchema } from "../../../schema/person";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type UpdatePersonSchemaType = z.infer<typeof updatePersonSchema>;

export async function UpdateWorkflowRole(data: UpdatePersonSchemaType) {
  const validation = updatePersonSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: "Invalid data provided." };
  }

  const { workflowId, personId, role } = validation.data;

  try {
    await prisma.rolesInWorkflow.update({
      where: {
        workflowId_personId: {
          workflowId,
          personId,
        },
      },
      data: {
        role,
      },
    });

    revalidatePath(`/workflow/editor/${workflowId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, error: "Failed to update role in the database." };
  }
}
