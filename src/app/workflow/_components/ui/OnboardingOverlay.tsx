"use client";

import type { WorkflowData } from "@/types/workflow";
import { useOnboarding } from "@/hooks/useOnboarding";
import AIInputForm from "@/components/SearchInput";
import SetIcon from "@/components/SetIcon";
import { Button } from "@/components/ui/button";
import SetStartText from "@/components/SetStartText";

interface OnboardingOverlayProps {
  workflow: WorkflowData;
  onDismiss?: () => void;
  onComplete?: () => void;
}

export function OnboardingOverlay({
  workflow,
  onDismiss,
}: OnboardingOverlayProps) {
  const { shouldShowOverlay, dismiss } = useOnboarding(workflow);

  // Don't show if conditions aren't met
  if (!shouldShowOverlay) {
    return null;
  }

  const handleDismiss = () => {
    dismiss();
    onDismiss?.();
  };

  return (
    <div className="fixed left-[calc(10%+6rem)] right-2 top-2 bottom-2 z-40 flex items-center justify-center">
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
      <div className="relative z-10 w-full max-w-4xl px-8 py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        {/* Content hierarchy */}
        <div className="space-y-2">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-row gap-4 items-center mb-6 text-foreground/80">
            <SetIcon className="h-10 w-10 fill-foreground" />
            <SetStartText className="h-5" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground">
              Let&apos;s set up your workspace for {workflow.name}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
              Describe what you&apos;re building at {workflow.name} and we&apos;ll help generate your project details automatically.
            </p>
          </div>

          <AIInputForm workflowId={workflow.id} onSuccess={() => {}} />

             {/* Subtle tip */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              The more specific you are about your target audience and unique
              value proposition, the better we can tailor your workspace.
            </p>
          </div>

          {/* Alternative actions */}
          <div className="pt-6 border-t border-border/40 w-full">
            <div className="flex flex-row gap-3 justify-between">
              <Button variant={'outline'} className="text-sm hover:text-foreground transition-colors hover:decoration-foreground/60">
                Import from LinkedIn
              </Button>
              
              <Button variant={'ghost'}
                onClick={handleDismiss}
                className="text-sm col-span-1 hover:text-foreground transition-colors hover:decoration-foreground/60"
              >
                Skip for now
              </Button>
            </div>
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
