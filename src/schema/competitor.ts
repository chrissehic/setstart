import { z } from "zod"

// Zod schema for competitor validation
export const competitorSchema = z.object({
  name: z.string().min(1, "Competitor name is required"),
  description: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

export type CompetitorFormData = z.infer<typeof competitorSchema>

// Schema for the entire form with multiple competitors
export const competitorsFormSchema = z.object({
  newCompetitor: competitorSchema,
  competitors: z.record(z.string(), competitorSchema),
})

export type CompetitorsFormData = z.infer<typeof competitorsFormSchema>

