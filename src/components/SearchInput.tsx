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
import { addObjective } from "@/actions/objectives/addObjective";
import { AddTask } from "@/actions/tasks/addTask";
import { addProduct } from "@/actions/products/addProduct";
import { TaskPriority } from "@/types/workflow";
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
  })

  const onSubmit = useCallback(
    async (values: PromptSchemaType) => {
      if (!workflowId) return;

      toast.loading("Processing AI prompt...", { id: "update-project" });

      try {
        console.log("Starting AI prompt processing...");
        
        // Process the AI prompt
        const workflowData = await processPrompt(values.prompt, workflowId);
        console.log("AI response received:", workflowData);
        
        if (!workflowData) {
          throw new Error("No data received from AI");
        }

        // Log the raw structure
        console.log("Raw workflowData keys:", Object.keys(workflowData));
        console.log("Raw workflowData:", workflowData);

        const { objectives, tasks, product, ...workflowUpdateData } = workflowData;
        console.log("Extracted data:", { 
          objectives: objectives, 
          tasks: tasks, 
          product: product, 
          workflowUpdateData: Object.keys(workflowUpdateData) 
        });
        console.log("Objectives array:", objectives);
        console.log("Tasks array:", tasks);
        console.log("Product:", product);
        
        // Update the main workflow first
        console.log("Updating main workflow...");
        await mutation.mutateAsync(workflowUpdateData);
        console.log("Main workflow updated successfully");

        const creationResults = { 
          objectives: { created: 0, failed: 0 }, 
          tasks: { created: 0, failed: 0 }, 
          product: { created: false, failed: false } 
        };
        const createdObjectives: { id: string; title: string }[] = [];

        // Create objectives
        if (objectives && objectives.length > 0) {
          console.log(`Creating ${objectives.length} objectives...`);
          for (const objective of objectives) {
            try {
              console.log("Creating objective:", objective);
              const result = await addObjective({
                workflowId,
                title: objective.title,
                description: objective.description,
                priority: objective.priority as TaskPriority,
              });
              
              if (result.success && result.objective) {
                createdObjectives.push({
                  id: result.objective.id,
                  title: result.objective.title
                });
                creationResults.objectives.created++;
                console.log("Objective created successfully:", result.objective);
              } else {
                creationResults.objectives.failed++;
                console.error(`Failed to create objective: ${objective.title}`, result);
              }
            } catch (error) {
              creationResults.objectives.failed++;
              console.error(`Error creating objective: ${objective.title}`, error);
            }
          }
        } else {
          console.log("No objectives to create");
        }
        
        // Create tasks
        if (tasks && tasks.length > 0) {
          console.log(`Creating ${tasks.length} tasks...`);
          for (const task of tasks) {
            try {
              console.log("Creating task:", task);
              const linkedObjectiveId = findRelevantObjective(task, createdObjectives);
              console.log("Linked objective ID:", linkedObjectiveId);
              
              const result = await AddTask({
                workflowId,
                title: task.title,
                description: task.description,
                category: task.category,
                priority: task.priority,
                responsibility: task.responsibility,
                objectiveId: linkedObjectiveId,
                dueDate: task.dueDate,
              });
              
              if (result.success) {
                creationResults.tasks.created++;
                console.log("Task created successfully:", result.task);
              } else {
                creationResults.tasks.failed++;
                console.error(`Failed to create task: ${task.title}`, result);
              }
            } catch (error) {
              creationResults.tasks.failed++;
              console.error(`Error creating task: ${task.title}`, error);
            }
          }
        } else {
          console.log("No tasks to create");
        }
        
        // Create product
        if (product) {
          console.log("Creating product:", product);
          try {
            const result = await addProduct({
              workflowId,
              name: product.name,
              description: product.description,
              type: product.type,
            });
            
            if (result) {
              creationResults.product.created = true;
              console.log("Product created successfully:", result);
            } else {
              creationResults.product.failed = true;
              console.error(`Failed to create product: ${product.name}`);
            }
          } catch (error) {
            creationResults.product.failed = true;
            console.error(`Error creating product: ${product.name}`, error);
          }
        } else {
          console.log("No product to create");
        }
        
        console.log("Final creation results:", creationResults);
        
        // Generate comprehensive success message
        const successMessage = generateSuccessMessage(creationResults);
        toast.success(successMessage, { id: "update-project" });
        
        form.reset();
        onSuccess?.();
      } catch (err) {
        console.error("Error in AI prompt processing:", err);
        toast.error("Error updating project", { id: "update-project" });
      }
    },
    [processPrompt, workflowId, mutation, onSuccess, form],
  )

  // Helper function to generate success message
  const generateSuccessMessage = (results: {
    objectives: { created: number; failed: number };
    tasks: { created: number; failed: number };
    product: { created: boolean; failed: boolean };
  }) => {
    const parts = [];
    
    if (results.objectives.created > 0) {
      parts.push(`${results.objectives.created} objective${results.objectives.created > 1 ? 's' : ''}`);
    }
    
    if (results.tasks.created > 0) {
      parts.push(`${results.tasks.created} task${results.tasks.created > 1 ? 's' : ''}`);
    }
    
    if (results.product.created) {
      parts.push('1 product');
    }
    
    if (parts.length > 0) {
      return `Project updated successfully with ${parts.join(', ')}`;
    }
    
    return "Project updated successfully";
  };

  // Helper function for smarter task-objective linking
  const findRelevantObjective = (task: { title: string; category: string }, objectives: { id: string; title: string }[]) => {
    if (objectives.length === 0) return undefined;
    
    // Enhanced keywords that indicate objective relationships
    const objectiveKeywords = {
      'market': ['market', 'customer', 'validation', 'research', 'survey', 'interview', 'feedback', 'demand', 'needs', 'pain points'],
      'product': ['product', 'development', 'prototype', 'testing', 'design', 'build', 'launch', 'features', 'mvp', 'roadmap'],
      'legal': ['legal', 'business', 'registration', 'license', 'compliance', 'structure', 'incorporation', 'trademark', 'patent', 'contracts'],
      'marketing': ['marketing', 'brand', 'promotion', 'advertising', 'social', 'content', 'awareness', 'campaign', 'messaging', 'positioning'],
      'finance': ['finance', 'funding', 'budget', 'pricing', 'cost', 'revenue', 'investment', 'cash flow', 'financial planning', 'fundraising'],
      'operations': ['operations', 'process', 'workflow', 'efficiency', 'logistics', 'supply chain', 'inventory', 'quality', 'scaling'],
      'team': ['team', 'hiring', 'recruitment', 'culture', 'training', 'leadership', 'roles', 'responsibilities', 'performance'],
      'sales': ['sales', 'revenue', 'customers', 'pipeline', 'conversion', 'pricing', 'negotiation', 'partnerships', 'channels'],
      'partnerships': ['partnerships', 'alliances', 'collaboration', 'joint ventures', 'strategic', 'networking', 'ecosystem'],
      'technology': ['technology', 'platform', 'software', 'digital', 'automation', 'infrastructure', 'security', 'data', 'analytics'],
      'research': ['research', 'innovation', 'development', 'testing', 'validation', 'experimentation', 'discovery', 'insights']
    };
    
    // Check for exact matches first
    for (const objective of objectives) {
      const objTitle = objective.title.toLowerCase();
      const taskTitle = task.title.toLowerCase();
      const taskCategory = task.category.toLowerCase();
      
      // Direct title match
      if (taskTitle.includes(objTitle) || objTitle.includes(taskTitle)) {
        return objective.id;
      }
      
      // Category match
      if (taskCategory.includes(objTitle) || objTitle.includes(taskCategory)) {
        return objective.id;
      }
    }
    
    // Enhanced keyword-based matching with scoring
    let bestMatch: { objectiveId: string; score: number } | null = null;
    
    for (const objective of objectives) {
      const objTitle = objective.title.toLowerCase();
      let score = 0;
      
      for (const [category, keywords] of Object.entries(objectiveKeywords)) {
        if (keywords.some(keyword => objTitle.includes(keyword))) {
          const taskTitle = task.title.toLowerCase();
          const taskCategory = task.category.toLowerCase();
          
          // Check if task matches any keywords in this category
          const matchingKeywords = keywords.filter(keyword => 
            taskTitle.includes(keyword) || taskCategory.includes(keyword)
          );
          
          if (matchingKeywords.length > 0) {
            score += matchingKeywords.length * 2; // Higher weight for keyword matches
          }
          
          // Bonus for category alignment
          if (taskCategory.toLowerCase().includes(category.toLowerCase())) {
            score += 3;
          }
        }
      }
      
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { objectiveId: objective.id, score };
      }
    }
    
    // Return the best match if found, otherwise fallback to first objective
    return bestMatch?.objectiveId || objectives[0]?.id;
  };

  const isLoading = isProcessing || mutation.isPending

  // Add loading state for the mutation
  useEffect(() => {
    if (mutation.isPending) {
      toast.loading("Updating workflow...", { id: "update-workflow" });
    } else if (mutation.isSuccess) {
      toast.success("Workflow updated successfully", { id: "update-workflow" });
    } else if (mutation.isError) {
      toast.error("Failed to update workflow", { id: "update-workflow" });
    }
  }, [mutation.isPending, mutation.isSuccess, mutation.isError]);

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
                  containerClassName="border-input border"
                  statusMessage={
                    <>
                      <Sparkles className="size-4 inline mr-1 animate-pulse" />
                      Processing your request with AI...
                    </>
                  }
                  useAbsolutePosition={false} // This enables the absolute positioning
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
