"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { CornerDownLeft, Loader2, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { updateWorkflowSchema } from "../../schema/workflow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { useMutation } from "@tanstack/react-query";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AIInputFormProps {
  workflowId: string; // Add this prop to receive the existing workflow ID
  onSuccess?: () => void; // Optional callback for success
}

export default function AIInputForm({
  workflowId,
  onSuccess,
}: AIInputFormProps) {
  const [focus, setFocus] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Create a separate schema for the prompt input
  const promptSchema = z.object({
    prompt: z.string().min(1, "Please enter a description for your workflow"),
  });

  type PromptSchemaType = z.infer<typeof promptSchema>;

  // Initialize the form with the prompt schema
  const form = useForm<PromptSchemaType>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Mutation hook for updating a workflow
  const { mutate, isPending } = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success("Project updated successfully", { id: "update-project" });
      form.reset();
      onSuccess?.(); // Call optional success callback
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error updating project", { id: "update-project" });
    },
  });

  // Function to process AI prompt and extract workflow data
  const processAIPrompt = useCallback(
    async (prompt: string, existingWorkflowId: string) => {
      setIsProcessingAI(true);

      try {
        const response = await fetch("/api/process-prompt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            workflowId: existingWorkflowId, // Pass the existing workflow ID
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process AI prompt");
        }

        const aiResponse = await response.json();
        console.log("AI Response:", aiResponse);

        // Ensure the response includes the correct ID
        const workflowData = {
          ...aiResponse,
          id: existingWorkflowId, // Ensure we use the existing workflow ID
          backgroundImage: "", // Reset background image
          logoImage: "", // Reset logo image
        };

        // Validate the AI response against our schema
        const validatedData = updateWorkflowSchema.parse(workflowData);
        console.log("Validated Data:", validatedData);

        return validatedData;
      } catch (error) {
        console.error("Error processing AI prompt:", error);
        throw new Error(
          "Failed to process your request. Please try rephrasing your prompt."
        );
      } finally {
        setIsProcessingAI(false);
      }
    },
    []
  );

  // Submit handler
  const onSubmit = useCallback(
    async (values: PromptSchemaType) => {
      try {
        // Process the natural language prompt with AI
        const workflowData = await processAIPrompt(values.prompt, workflowId);

        // Update the workflow with the processed data
        mutate(workflowData);
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    },
    [mutate, processAIPrompt, workflowId]
  );

  const isLoading = isPending || isProcessingAI;
  const promptValue = form.watch("prompt");
  const showSubmitButton = promptValue && promptValue.trim().length > 0;

  return (
    <div className="absolute w-full py-4 flex justify-center items-center pointer-events-none bottom-0 z-30">
      <Form {...form}>
        <form
          className="w-full flex-col flex justify-center items-center"
          onSubmit={form.handleSubmit(onSubmit)}
          aria-busy={isLoading}
        >
          <div
            className={cn(
              "pointer-events-auto flex flex-row border-2 items-end bg-input/30 rounded-3xl w-full p-2.5 max-w-3xl dark:bg-input/30 backdrop-blur-lg transition-all duration-150",
              focus && "dark:bg-white/10 border-white/30"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="relative flex flex-row gap-2 items-end">
                      <Textarea
                        {...field}
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (showSubmitButton) {
                              form.handleSubmit(onSubmit)();
                            }
                          }
                        }}
                        className={cn(
                          "w-full resize-none border-0 text-md shadow-none min-h-[60px] pr-10"
                        )}
                        placeholder="Describe your project... e.g., 'I want to start a locally sourced high fibre bar business in Brussels for the youth'"
                        rows={2}
                      />
                      {showSubmitButton && (
                        <Button
                          className="size-12 rounded-full shadow-md font-bold ml-2"
                          variant={"default"}
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="size-6 animate-spin text-secondary" />
                          ) : (
                            <CornerDownLeft className="size-6" />
                          )}
                        </Button>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          {isProcessingAI && (
            <div className="text-center mt-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 inline mr-1 animate-pulse" />
              Processing your request with AI...
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
