"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { Search } from "lucide-react";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { Person } from "@/types/workflow";
import { toast } from "sonner";
import { cn, getCategoryConfig, getStatusConfig } from "@/lib/utils";
import AssignedPeopleBadge from "../sections/AssignedPeopleBadge";

interface TaskSelectorDialogProps {
  workflowId: string;
  objectiveId: string;
  people: Person[];
  children?: React.ReactNode;
  onSuccess?: () => void;
  // Controlled state props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskSelectorDialog({
  workflowId,
  objectiveId,
  children,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: TaskSelectorDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const { data: allTasks = [] } = useTasks(workflowId);
  const updateTask = useUpdateTask(workflowId);

  const originallyAssigned = useMemo(() => {
    return allTasks
      .filter((task) => task.objectiveId === objectiveId)
      .map((task) => task.id);
  }, [allTasks, objectiveId]);

  const toAssign = useMemo(
    () => selectedTasks.filter((id) => !originallyAssigned.includes(id)),
    [selectedTasks, originallyAssigned]
  );

  const toUnassign = useMemo(
    () => originallyAssigned.filter((id) => !selectedTasks.includes(id)),
    [selectedTasks, originallyAssigned]
  );

  const hasChanges = toAssign.length > 0 || toUnassign.length > 0;

  useEffect(() => {
    if (open) {
      setSelectedTasks(originallyAssigned);
    }
  }, [open, originallyAssigned]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return allTasks;

    const query = searchQuery.toLowerCase();
    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
    );
  }, [allTasks, searchQuery]);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleAssignTasks = async () => {
    try {
      const originallyAssigned = allTasks
        .filter((task) => task.objectiveId === objectiveId)
        .map((task) => task.id);

      const toAssign = selectedTasks.filter(
        (id) => !originallyAssigned.includes(id)
      );
      const toUnassign = originallyAssigned.filter(
        (id) => !selectedTasks.includes(id)
      );

      if (toAssign.length === 0 && toUnassign.length === 0) {
        toast.info("No changes to save");
        return;
      }

      await Promise.all([
        ...toAssign.map((taskId) =>
          updateTask.mutateAsync({
            id: taskId,
            workflowId,
            objectiveId, // assign
          })
        ),
        ...toUnassign.map((taskId) =>
          updateTask.mutateAsync({
            id: taskId,
            workflowId,
            objectiveId: null, // unassign
          })
        ),
      ]);

      toast.success(
        `${toAssign.length} task(s) assigned, ${toUnassign.length} task(s) unassigned`
      );
      setOpen(false);
      setSelectedTasks([]);
      setSearchQuery("");
      onSuccess?.();
    } catch (error) {
      console.error("Error assigning tasks:", error);
      toast.error("Failed to update tasks");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Select existing tasks</DialogTitle>
          <DialogDescription>
            Choose existing tasks to assign to this objective. Only tasks not
            already assigned to an objective are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {searchQuery.trim()
                    ? "No tasks match your search"
                    : "No tasks available"}
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredTasks.map((task) => {
                  const statusConfig = getStatusConfig(task.status);
                  const categoryConfig = getCategoryConfig(task.category);
                  const selected = selectedTasks.includes(task.id);
                  const rowId = `task-selector-${task.id}`;
                  return (
                    <label
                      key={task.id}
                      htmlFor={rowId}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150 ease-in-out",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:bg-muted/40"
                      )}
                    >
                      <Checkbox
                        id={rowId}
                        checked={selected}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                        className="mt-0.5 shrink-0 "
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", categoryConfig.color)}
                          >
                            {task.category}
                          </Badge>
                          <Badge
                            className={cn("text-xs", statusConfig.color)}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <h4 className="text-base font-medium truncate">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: task.description,
                              }}
                            />
                          </p>
                        )}
                        {task.assignedPeople &&
                          task.assignedPeople.length > 0 && (
                            <AssignedPeopleBadge
                              people={task.assignedPeople.map(
                                (ap) => ap.person
                              )}
                            />
                          )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              {selectedTasks.length} task(s) selected
              {hasChanges && (
                <>
                  {toAssign.length > 0 && ` • ${toAssign.length} to assign`}
                  {toUnassign.length > 0 &&
                    ` • ${toUnassign.length} to unassign`}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignTasks}
                disabled={!hasChanges || updateTask.isPending}
              >
                {updateTask.isPending ? "Saving..." : `Save Changes`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
