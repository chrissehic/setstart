import { useState } from "react";
import { updateWorkflowSchema } from "@/../schema/workflow";
import { addObjective } from "@/actions/objectives/addObjective";
import { AddTask } from "@/actions/tasks/addTask";
import { addProduct } from "@/actions/products/addProduct";

export function useProcessAIPrompt() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPrompt = async (prompt: string, workflowId: string) => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/process-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, workflowId }),
      });

      if (!res.ok) throw new Error("Failed to process AI prompt");

      const aiResponse = await res.json();

      const validatedData = updateWorkflowSchema.parse({
        ...aiResponse,
        id: workflowId,
        backgroundImage: "",
        logoImage: "",
      });

      // Extract the entities to create separately
      const { objectives, tasks, product, ...workflowData } = validatedData;

      // Return the workflow data along with the entities to create
      return {
        ...workflowData,
        objectives: objectives || [],
        tasks: tasks || [],
        product: product || null,
      };
    } catch (err) {
      console.error(err);
      throw new Error(
        "Failed to process your request. Please try rephrasing your prompt."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return { processPrompt, isProcessing };
}
