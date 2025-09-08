import { z } from "zod";

export const addTaskSchema = z.object({
  workflowId: z.string(),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  assignedPeople: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  responsibility: z.enum(["IN_HOUSE", "OUTSOURCED"]).optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
});

export type AddTaskSchemaType = z.infer<typeof addTaskSchema>;
