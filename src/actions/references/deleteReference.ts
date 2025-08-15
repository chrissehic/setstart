"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteReference(referenceId: string) {
  try {
    const reference = await prisma.reference.delete({
      where: { id: referenceId },
    });

    revalidatePath(`/project/${reference.workflowId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting reference:", error);
    return { success: false, error: "Failed to delete reference" };
  }
}
