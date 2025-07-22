import { useState } from "react";
import { updateWorkflowSchema } from "@/../schema/workflow";

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

      return validatedData;
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
