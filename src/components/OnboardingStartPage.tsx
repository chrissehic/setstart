"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { CreateWorkflow } from "@/actions/workflows/createWorkflow";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SetIcon from "@/components/SetIcon";
import SetStartText from "@/components/SetStartText";

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Workspace name must be less than 100 characters"),
});

type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;

export function OnboardingStartPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<WorkspaceSchemaType>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: CreateWorkflow,
    onSuccess: (data) => {
      toast.success("Workspace created successfully!");
      // Redirect to the new workspace
      router.push(`/project/${data.id}`);
    },
    onError: (error: unknown) => {
      console.error("Failed to create workspace:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("already exists")) {
        toast.error("A workspace with this name already exists.");
      } else {
        toast.error("Failed to create workspace. Please try again.");
      }
      setIsCreating(false);
    },
  });

  const onSubmit = (values: WorkspaceSchemaType) => {
    setIsCreating(true);
    createWorkflowMutation.mutate(values);
  };

  return (
    <div className=" z-40 flex items-center justify-center h-screen w-full">
      {/* Subtle background overlay with animated aura */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-lg border border-border/50" />

      {/* Animated aura - contrasting with primary */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {/* Main aura gradient */}

        {/* Primary Aura Gradient Background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: `
    radial-gradient(circle at 30% 20%, var(--primary) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, var(--primary) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 60%)
  `,
          }}
        />

        {/* Subtle edge glow */}
        <div
          className="absolute inset-0 opacity-[0.003] dark:opacity-[0.008]"
          style={{
            background: `
              linear-gradient(135deg, 
                oklch(0.6 0.12 240) 0%, 
                transparent 30%, 
                transparent 70%, 
                oklch(0.65 0.1 300) 100%
              )
            `,
            animation: "auraGlow 6s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Minimal primary accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.008] via-transparent to-primary/[0.004] rounded-lg" />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center max-w-4xl px-8 py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        {/* Content hierarchy */}
        <div className="space-y-2">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <SetIcon className="h-14 text-foreground" />
              <SetStartText className="h-6 text-foreground" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground">
              Let&apos;s create your first workspace
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
              Give your workspace a name to get started with your first project.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 max-w-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Workspace Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My First Project"
                          {...field}
                          disabled={isCreating}
                          className="text-base"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Workspace...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Subtle tip */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              You can always create more workspaces later from the projects page.
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes auraFloat {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: var(--start-opacity, 1);
          }
          33% {
            transform: translate(20px, -15px) scale(1.05);
            opacity: var(--mid-opacity, 0.8);
          }
          66% {
            transform: translate(-15px, 10px) scale(0.95);
            opacity: var(--mid-opacity, 0.8);
          }
        }

        @keyframes auraGlow {
          0% {
            opacity: 0.003;
          }
          100% {
            opacity: 0.008;
          }
        }

        @media (prefers-color-scheme: dark) {
          @keyframes auraGlow {
            0% {
              opacity: 0.008;
            }
            100% {
              opacity: 0.015;
            }
          }
        }
      `}</style>
    </div>
  );
} 