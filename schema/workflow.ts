import { COMPANY_STAGES } from "@/types";
import { z } from "zod"

// Schema for creating a new workflow
export const createWorkflowSchema = z.object({
    name: z.string().min(1).max(50),
})

const companyStageKeys = COMPANY_STAGES.map((s) => s.key);

export type createWorkflowSchemaType = z.infer<typeof createWorkflowSchema>

// Schema for updating an existing workflow
export const updateWorkflowSchema = z.object({
    id: z.string().min(1, "Workflow ID is required"),
    name: z.string().min(1).max(50).optional(),
    tagline: z.string().optional(),
    description: z.string().max(1200).optional(),
    tags: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
    logoImage: z.string().optional(),
    backgroundImage: z.string().optional(),
      stage: z.enum(companyStageKeys as [string, ...string[]]).optional(),
})

export type updateWorkflowSchemaType = z.infer<typeof updateWorkflowSchema>
