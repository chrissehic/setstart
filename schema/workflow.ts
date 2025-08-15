import { COMPANY_STAGES } from "@/types";
import { z } from "zod"

// Schema for creating a new workflow
export const createWorkflowSchema = z.object({
    name: z.string().min(1).max(100),
})

const companyStageKeys = COMPANY_STAGES.map((s) => s.key);

export type createWorkflowSchemaType = z.infer<typeof createWorkflowSchema>

// Schema for updating an existing workflow
export const updateWorkflowSchema = z.object({
    id: z.string().min(1, "Workflow ID is required"),
    name: z.string().min(1).max(100).optional(),
    tagline: z.string().optional(),
    description: z.string().max(1200).optional(),
    tags: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
    logoImage: z.string().optional(),
    backgroundImage: z.string().optional(),
    mainLogo: z.string().optional(),
    logoIcon: z.string().optional(),
    additionalAssets: z.string().optional(), // JSON string of asset URLs
    stage: z.enum(companyStageKeys as [string, ...string[]]).optional(),
    product: z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.string().optional()
    }).optional()
})

export type updateWorkflowSchemaType = z.infer<typeof updateWorkflowSchema>
