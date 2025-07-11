"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type AddPersonToWorkflowParams = {
  workflowId: string;
  name: string;
  role: string;
};

export async function AddPersonToWorkflow(params: AddPersonToWorkflowParams) {
  const { workflowId, name, role } = params;

  try {
    // Use upsert to find an existing person by name or create a new one.
    const person = await prisma.person.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    // Create the link between the person and the workflow, including the role.
    await prisma.rolesInWorkflow.create({
      data: {
        workflowId,
        personId: person.id,
        role,
      },
    });

    // Revalidate the editor path to reflect the changes immediately.
    revalidatePath(`/workflow/editor/${workflowId}`);

    return { success: true };
  } catch (error) {
    // Handle potential errors, such as a person already being in the workflow.
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return { success: false, error: "This person is already in this workflow." };
    }
    console.error("Failed to add person to workflow:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
