import { z } from "zod";

export const promptSchema = z.object({
  prompt: z.string().min(1, "Please enter a description for your project"),
});

export type PromptSchemaType = z.infer<typeof promptSchema>;
