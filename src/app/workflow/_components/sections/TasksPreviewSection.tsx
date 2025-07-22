"use client";

import { useTasks } from "@/hooks/useTasks";
import TasksPreview from "../TasksPreview";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface TasksPreviewSectionProps {
  workflowId: string;
  max?: number;
}

export default function TasksPreviewSection({
  workflowId,
  max = 4,
}: TasksPreviewSectionProps) {
  const { data: tasks = [], isLoading, error } = useTasks(workflowId);
  const isLoadingAll = isLoading;
  if (isLoadingAll) {
    return (
      <div className="flex flex-col gap-1 relative mb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error || !tasks) {
    return (
      <div className="text-sm text-muted-foreground">
        Unable to load tasks
      </div>
    );
  }

  // 🔷 New: if no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <h2 className="text-xl font-medium tracking-tight">
          Manage your tasks
        </h2>
        <p className="text-sm text-muted-foreground">
          Start setting up your tasks to keep track of your next steps
        </p>
        <Button variant="link" className="no-underline">
          Create a new task
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    );
  }

  // 🔷 Normal case: render preview
  return <TasksPreview tasks={tasks} max={max} />;
}
