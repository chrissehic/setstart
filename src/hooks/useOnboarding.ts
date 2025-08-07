"use client";

import { useState, useEffect } from "react";
import { WorkflowData } from "@/types/workflow";

interface OnboardingState {
  isVisible: boolean;
  hasBeenDismissed: boolean;
  hasBeenCompleted: boolean;
}

export function useOnboarding(workflow: WorkflowData) {
  const [state, setState] = useState<OnboardingState>({
    isVisible: true,
    hasBeenDismissed: false,
    hasBeenCompleted: false,
  });

  // Check if workflow lacks essential information
  const lacksEssentialInfo = !workflow.description || workflow.description.trim() === "";

  // Check localStorage on mount
  useEffect(() => {
    const storageKey = `onboarding-${workflow.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      setState(prev => ({
        ...prev,
        hasBeenDismissed: parsed.hasBeenDismissed || false,
        hasBeenCompleted: parsed.hasBeenCompleted || false,
      }));
    }
  }, [workflow.id]);

  // Determine if overlay should be visible - only based on missing description
  const shouldShowOverlay = lacksEssentialInfo;

  const saveToStorage = (updates: Partial<OnboardingState>) => {
    const storageKey = `onboarding-${workflow.id}`;
    const current = localStorage.getItem(storageKey);
    const parsed = current ? JSON.parse(current) : {};
    const updated = { ...parsed, ...updates };
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const dismiss = () => {
    setState(prev => ({ ...prev, isVisible: false, hasBeenDismissed: true }));
    saveToStorage({ hasBeenDismissed: true });
  };

  const complete = () => {
    setState(prev => ({ ...prev, isVisible: false, hasBeenCompleted: true }));
    saveToStorage({ hasBeenCompleted: true });
  };

  const reset = () => {
    setState({ isVisible: true, hasBeenDismissed: false, hasBeenCompleted: false });
    const storageKey = `onboarding-${workflow.id}`;
    localStorage.removeItem(storageKey);
  };

  return {
    shouldShowOverlay,
    lacksEssentialInfo,
    dismiss,
    complete,
    reset,
    state,
  };
} 