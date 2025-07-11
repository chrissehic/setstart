import { z } from "zod";

export const addPersonSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
});

export const updatePersonSchema = z.object({
  workflowId: z.string(),
  personId: z.string(),
  role: z.string().min(1, "Role is required"),
});

export const deletePersonSchema = z.object({
  workflowId: z.string(),
  personId: z.string(),
});
