"use server";

import { prisma } from "@/lib/prisma";
import { deletePersonSchema } from "../../../schema/person";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type DeletePersonSchemaType = z.infer<typeof deletePersonSchema>;

export async function DeleteWorkflowRole(data: DeletePersonSchemaType) {
  const validation = deletePersonSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: "Invalid data provided." };
  }

  const { workflowId, personId } = validation.data;

  try {
    await prisma.rolesInWorkflow.delete({
      where: {
        workflowId_personId: {
          workflowId,
          personId,
        },
      },
    });

    revalidatePath(`/workflow/editor/${workflowId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, error: "Failed to delete role from the database." };
  }
}
