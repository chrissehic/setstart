"use client";

import { useState, useMemo } from "react";
import { classWrapper } from "@/styles/commonStyles";
import { type Person, TaskStatus, Task } from "@/types";
import TaskCard from "../ui/TaskCard";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import {
  AlertCircleIcon,
  Loader2,
  Sparkles,
  Plus,
  ChevronDown,
  BookmarkCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskModal } from "../modals/TaskModal";
import { TaskSelectorDialog } from "../modals/TaskSelectorDialog";
import { SECTION_CLASS } from "@/lib/constants";
import { TaskSearchInput } from "@/components/TaskSearchInput";



type TasksSectionProps = {
  workflowId: string;
  people: Person[];
  objectiveId?: string; // Optional: filter tasks by objective
  selectedTask?: Task | null;
  setSelectedTask?: (task: Task | null) => void;
};

function TasksSection({
  workflowId,
  people,
  objectiveId,
  selectedTask,
  setSelectedTask,
}: TasksSectionProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [personFilter, setPersonFilter] = useState<string[]>([]);
  const [isCreatingWithAI, setIsCreatingWithAI] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Remove local selectedTask state

  const { data: allTasks = [], isLoading, error } = useTasks(workflowId);

  // Filter tasks by objective if objectiveId is provided
  const tasks = useMemo(() => {
    if (!objectiveId) return allTasks;
    return allTasks.filter((task) => task.objectiveId === objectiveId);
  }, [allTasks, objectiveId]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((task) => set.add(task.category));
    return Array.from(set);
  }, [tasks]);

  // Deduplicate people by ID to ensure unique keys
  const uniquePeople = useMemo(() => {
    const uniqueMap = new Map<string, Person>();
    people.forEach((person) => {
      if (!uniqueMap.has(person.id)) {
        uniqueMap.set(person.id, person);
      }
    });
    return Array.from(uniqueMap.values());
  }, [people]);

  // Detect if input looks like a creation prompt
  const isPromptLike = useMemo(() => {
    return search.length > 10;
  }, [search]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || task.category === categoryFilter;
      const matchesPerson =
        personFilter.length === 0 ||
        task.assignedPeople?.some(({ person }) =>
          personFilter.includes(person.id)
        ) || false;

      return matchesSearch && matchesStatus && matchesCategory && matchesPerson;
    });
  }, [tasks, search, statusFilter, categoryFilter, personFilter]);

  const handleCreateWithAI = async () => {
    setIsCreatingWithAI(true);
    try {
      console.log("Creating tasks from prompt:", search);
      setSearch("");
    } catch (error) {
      console.error("Error creating tasks with AI:", error);
    } finally {
      setIsCreatingWithAI(false);
    }
  };

  if (isLoading) {
    return (
      <div className={SECTION_CLASS}>
        <div
          className={cn(classWrapper, "flex items-center justify-center py-8")}
        >
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={SECTION_CLASS}>
        <div
          className={cn(classWrapper, "flex items-center justify-center py-8")}
        >
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Error loading tasks</AlertTitle>
            <AlertDescription>
              <p>{error.message}</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If a task is selected, show its detail pane and hide the list
  if (selectedTask) {
    return (
      <div className={SECTION_CLASS + " flex flex-col gap-4"}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedTask && setSelectedTask(null)}
        >
          Back to tasks
        </Button>
        <div className="p-4 border rounded-lg bg-background flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
          {selectedTask.description && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedTask.description }}
            />
          )}
          {/* Add more task details here as needed */}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(SECTION_CLASS)}>
      <div className={cn(classWrapper, "flex flex-col gap-4 h-full")}>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-end mb-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value: TaskStatus | "all") =>
                  setStatusFilter(value as TaskStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value={TaskStatus.COMPLETE}>Completed</SelectItem>
                  <SelectItem value={TaskStatus.NOT_STARTED}>
                    Not Started
                  </SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Select
                value={categoryFilter}
                onValueChange={(value: string | "all") =>
                  setCategoryFilter(value as string | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Assigned to
              </label>
              <MultiSelect
                options={uniquePeople.map((person) => ({
                  label: person.name,
                  value: person.id,
                }))}
                onValueChange={setPersonFilter}
                defaultValue={personFilter}
                placeholder="Filter by people"
                variant="default"
                maxCount={3}
                className="bg-muted"
                modalPopover={true}
              />
            </div>
          </div>
          <TaskModal workflowId={workflowId} people={people}>
            <Button variant="default">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </TaskModal>
        </div>

        {/* Search Input */}
        <div className="w-full">
          <TaskSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tasks..."
            className="w-full"
          />
        </div>

        {/* Tasks Display */}
        <div className="flex-1 overflow-y-auto">
          {filteredTasks.length > 0 ? (
            <>
              {/* Tasks List */}
              <div className="space-y-3">
                
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask && setSelectedTask(task)}
                    style={{ cursor: "pointer" }}
                  >
                    <TaskCard
                      task={task}
                      workflowId={workflowId}
                      people={people}
                      onEditTask={setEditingTask}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              {search.trim() ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    No tasks found for &quot;{search}&quot;
                  </p>
                  {isPromptLike && (
                    <Button
                      onClick={handleCreateWithAI}
                      disabled={isCreatingWithAI}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Create tasks from this prompt
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <BookmarkCheck className="size-8 stroke-muted-foreground stroke-1" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        {objectiveId
                          ? "No tasks found for this objective."
                          : "No tasks yet"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Create your first task to start organizing your workflow
                      </p>
                    </div>
                  </div>

                  <TaskModal workflowId={workflowId} people={people}>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Task
                    </Button>
                  </TaskModal>
                  {objectiveId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Task to Objective
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <TaskModal
                          workflowId={workflowId}
                          people={people}
                          objectiveId={objectiveId}
                        >
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Task
                          </DropdownMenuItem>
                        </TaskModal>
                        <TaskSelectorDialog
                          workflowId={workflowId}
                          objectiveId={objectiveId}
                          people={people}
                        >
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Select Existing Task
                          </DropdownMenuItem>
                        </TaskSelectorDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          workflowId={workflowId}
          task={editingTask}
          people={people}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

export default TasksSection;
