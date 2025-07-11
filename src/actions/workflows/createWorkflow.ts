"use server";

import { prisma } from "@/lib/prisma";
import { createWorkflowSchema, createWorkflowSchemaType } from "../../../schema/workflow";
import { auth } from "@clerk/nextjs/server";
import { WorkflowStatus } from "@/types/workflow";

export async function CreateWorkflow(form: createWorkflowSchemaType) {
    // Validate form data
    const { success, data } = createWorkflowSchema.safeParse(form);
    if (!success) {
        throw new Error("Invalid form data");
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
        console.log('Unauthenticated')
        throw new Error("Unauthenticated");
    }

    // Create workflow in the database
    const result = await prisma.workflow.create({
        data: {
            userId,
            status: WorkflowStatus.BLUEPRINT,
            definition: "TODO",
            ...data,
        },
    });

    // Redirect to the workflow editor
    // redirect(`/workflow/editor/${result.id}`);
    console.log(result.id)
}
