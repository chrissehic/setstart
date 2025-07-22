"use client"

import { useCallback, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem } from "./ui/form"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useProcessAIPrompt } from "@/hooks/use-process-ai-prompt"
import { getRandomExample } from "@/lib/helpers/getRandomPlaceholder"
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow"
import { promptSchema, type PromptSchemaType } from "@/../schema/prompt"
import { CornerDownLeft, Sparkles } from "lucide-react"
import AIInput from "./AIInput"

interface AIInputFormProps {
  workflowId: string
  onSuccess?: () => void
}

export default function AIInputForm({ workflowId, onSuccess }: AIInputFormProps) {
  const [placeholder, setPlaceholder] = useState("")
  const form = useForm<PromptSchemaType>({
    resolver: zodResolver(promptSchema),
    defaultValues: { prompt: "" },
  })

  useEffect(() => {
    setPlaceholder(getRandomExample())
  }, [])

  const { processPrompt, isProcessing } = useProcessAIPrompt()
  const mutation = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success("Project updated successfully", { id: "update-project" })
      form.reset()
      onSuccess?.()
    },
    onError: () => {
      toast.error("Error updating project", { id: "update-project" })
    },
  })

  const onSubmit = useCallback(
    async (values: PromptSchemaType) => {
      try {
        const workflowData = await processPrompt(values.prompt, workflowId)
        mutation.mutate(workflowData)
      } catch (err) {
        alert(err instanceof Error ? err.message : "An unexpected error occurred")
      }
    },
    [processPrompt, workflowId, mutation],
  )

  const isLoading = isProcessing || mutation.isPending
  // const promptValue = form.watch("prompt")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full" aria-busy={isLoading}>
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <AIInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={`Tell us what you're building… e.g.: ${placeholder}`}
                  isLoading={isLoading}
                  buttonIcon={<CornerDownLeft className="size-6" />}
                  onSubmit={form.handleSubmit(onSubmit)}
                  showButton={field.value.trim().length > 0}
                  showStatusMessage={isProcessing}
                  statusMessage={
                    <>
                      <Sparkles className="size-4 inline mr-1 animate-pulse" />
                      Processing your request with AI...
                    </>
                  }
                  useAbsolutePosition={true} // This enables the absolute positioning
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
