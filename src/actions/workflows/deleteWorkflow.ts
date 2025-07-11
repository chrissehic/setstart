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

    // Create workflow in the database
    await prisma.workflow.delete({
        where: {
            userId,
            id
        },
    });

    revalidatePath("/workflows");
}
