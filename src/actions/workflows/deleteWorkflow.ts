"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteWorkflow(id: string) {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
        console.log('Unauthenticated')
        throw new Error("Unauthenticated");
    }

    // Delete the workflow
    await prisma.workflow.delete({
        where: {
            userId,
            id
        },
    });

    // Get remaining workflows to determine redirect
    const remainingWorkflows = await prisma.workflow.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
        },
    });

    revalidatePath("/workflows");
    revalidatePath("/");

    return {
        success: true,
        remainingWorkflows,
        hasRemainingWorkflows: remainingWorkflows.length > 0,
        nextWorkflowId: remainingWorkflows.length > 0 ? remainingWorkflows[0].id : null,
    };
}
