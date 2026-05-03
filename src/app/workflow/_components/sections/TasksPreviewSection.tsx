"use client";

import { useTasks } from "@/hooks/useTasks";
import { useObjectives } from "@/hooks/useObjectives";
import TasksPreview from "../tasks/TasksPreview";
import ObjectivesPreview from "../tasks/ObjectivesPreview";
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
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useTasks(workflowId);
  const {
    data: objectives = [],
    isLoading: objectivesLoading,
    error: objectivesError,
  } = useObjectives(workflowId);

  const isLoadingAll = tasksLoading || objectivesLoading;

  if (isLoadingAll) {
    return (
      <div className="flex flex-col gap-1 relative mb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (tasksError || objectivesError) {
    return (
      <div className="text-sm text-muted-foreground">
        Unable to load tasks and objectives
      </div>
    );
  }

  // Case 1: Has both tasks and objectives - show both in compact layout
  if (tasks.length > 0 && objectives.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Objectives ({objectives.length})</span>
          </div>
          <ObjectivesPreview
            objectives={objectives}
            max={Math.min(3, Math.ceil(max / 2))}
          />
        </div>{" "}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Tasks ({tasks.length})</span>
          </div>
          <TasksPreview tasks={tasks} />
        </div>
      </div>
    );
  }

  // Case 2: Has tasks only - show task preview
  if (tasks.length > 0) {
    return <TasksPreview tasks={tasks} max={max} />;
  }

  // Case 3: Has objectives only - show objectives preview
  if (objectives.length > 0) {
    return (
      <div className="space-y-3">
        <ObjectivesPreview objectives={objectives} max={max} />
      </div>
    );
  }

  // Case 3: No tasks and no objectives - show empty state
  return (
    <div className="flex flex-col items-center justify-center text-center ">
      <h2 className="text-base font-medium tracking-tight">Manage your objectives and tasks</h2>
      <p className="text-xs text-muted-foreground max-w-lg text-wrap">
        Start setting up your objectives and tasks to keep track of your next
        steps
      </p>
      <Button variant="link" className="no-underline font-normal">
        Organize your next steps
        <ArrowRight className="size-3" />
      </Button>
    </div>
  );
}
