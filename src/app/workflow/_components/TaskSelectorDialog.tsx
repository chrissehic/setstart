"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from "lucide-react";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { Person } from "@/types/workflow";
import { toast } from "sonner";

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
  people,
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

  // Filter out tasks that are already assigned to this objective
  const availableTasks = useMemo(() => {
    return allTasks.filter((task) => task.objectiveId !== objectiveId);
  }, [allTasks, objectiveId]);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return availableTasks;
    
    const query = searchQuery.toLowerCase();
    return availableTasks.filter((task) =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)
    );
  }, [availableTasks, searchQuery]);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleAssignTasks = async () => {
    if (selectedTasks.length === 0) {
      toast.error("Please select at least one task");
      return;
    }

    try {
      // Update each selected task to assign it to the objective
      await Promise.all(
        selectedTasks.map((taskId) => {
          const task = allTasks.find((t) => t.id === taskId);
          if (task) {
            return updateTask.mutateAsync({
              id: taskId,
              workflowId: workflowId,
              objectiveId: objectiveId,
            });
          }
        })
      );

      toast.success(`${selectedTasks.length} task(s) assigned to objective`);
      setOpen(false);
      setSelectedTasks([]);
      setSearchQuery("");
      onSuccess?.();
    } catch (error) {
      console.error("Error assigning tasks:", error);
      toast.error("Failed to assign tasks");
    }
  };

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId);
    return person?.name || "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Existing Tasks</DialogTitle>
          <DialogDescription>
            Choose existing tasks to assign to this objective. Only tasks not already assigned to an objective are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0 h-full">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tasks List */}
          <ScrollArea className="h-96 rounded-md border">
            <div className="p-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {availableTasks.length === 0 ? (
                    <p>No unassigned tasks available</p>
                  ) : (
                    <p>No tasks match your search</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTasks.includes(task.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => handleTaskToggle(task.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{task.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {task.status.replace("_", " ").toLowerCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.priority?.toLowerCase() || 'medium'}
                            </Badge>
                            {task.assignedPeople.length > 0 && (
                              <span>
                                Assigned to: {task.assignedPeople.map(ap => getPersonName(ap.person.id)).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {selectedTasks.includes(task.id) && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Plus className="h-3 w-3 text-primary-foreground rotate-45" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedTasks.length} task(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignTasks}
                disabled={selectedTasks.length === 0 || updateTask.isPending}
              >
                {updateTask.isPending ? "Assigning..." : `Assign ${selectedTasks.length} Task(s)`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
