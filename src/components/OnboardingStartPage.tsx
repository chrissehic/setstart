"use client";

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
import SetIcon from "@/components/SetIcon";

const workspaceSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
});

type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;

export function OnboardingStartPage() {
  const form = useForm<WorkspaceSchemaType>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: CreateWorkflow,
    onSuccess: (data) => {
      if (data && data.id) {
        // Dismiss any existing toasts to prevent stale toasts (especially AI prompt toasts)
        toast.dismiss();
        toast.success("Project created successfully!", { duration: 2000 });
        
        // Use window.location for hard navigation to ensure clean state
        // This prevents any race conditions with server actions during navigation
        window.location.href = `/project/${data.id}`;
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to create project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("already exists")) {
        toast.error("A project with this name already exists.");
      } else {
        toast.error("Failed to create project. Please try again.");
      }
    },
  });

  const onSubmit = (values: WorkspaceSchemaType) => {
    createWorkflowMutation.mutate(values);
  };

  const isPending = createWorkflowMutation.isPending;

  return (
    <main 
      className="relative flex items-center justify-center min-h-screen w-full"
      role="main"
      aria-label="Create your first business project"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />
        
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

        {/* Minimal primary accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.008] via-transparent to-primary/[0.004]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          {/* Header section */}
          <header className="text-center space-y-4">
            <div className="flex justify-center mb-6" aria-hidden="true">
              <SetIcon className="h-14 w-14 text-foreground" aria-hidden="true" animated/>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Let&apos;s create your first business project
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Give your business project a name to get started. You can always create more projects later.
            </p>
          </header>

          {/* Form section */}
          <section aria-labelledby="project-form-heading">
            <h2 id="project-form-heading" className="sr-only">
              Project creation form
            </h2>
            <div className="max-w-md mx-auto">
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(onSubmit)} 
                  className="space-y-6"
                  aria-label="Create new project"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel 
                          htmlFor="project-name"
                          className="text-base font-medium"
                        >
                          Project Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="project-name"
                            placeholder="e.g., My First Project"
                            {...field}
                            disabled={isPending}
                            className="text-base h-11"
                            autoFocus
                            autoComplete="off"
                            aria-required="true"
                            aria-invalid={form.formState.errors.name ? "true" : "false"}
                            aria-describedby={
                              form.formState.errors.name 
                                ? "project-name-error" 
                                : "project-name-hint"
                            }
                          />
                        </FormControl>
                        {form.formState.errors.name && (
                          <FormMessage 
                            id="project-name-error"
                            role="alert"
                            aria-live="polite"
                          />
                        )}
                        {!form.formState.errors.name && (
                          <p 
                            id="project-name-hint" 
                            className="text-sm text-muted-foreground"
                          >
                            Choose a descriptive name for your project (max 100 characters)
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full"
                    size="lg"
                    aria-busy={isPending}
                    aria-disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 
                          className="mr-2 h-4 w-4 animate-spin" 
                          aria-hidden="true"
                        />
                        <span>Creating project...</span>
                        <span className="sr-only">Please wait, creating your project</span>
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </section>

          {/* Status announcement for screen readers */}
          <div 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {isPending && "Creating your project, please wait..."}
          </div>
        </div>
      </div>

      <style jsx>{`
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
    </main>
  );
} 