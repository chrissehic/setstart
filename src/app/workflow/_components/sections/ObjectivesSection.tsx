"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Plus,
  Trash2,
  AlertCircleIcon,
  BookmarkCheck,
  LibrarySquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ObjectiveModal } from "../ObjectiveModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SECTION_CLASS } from "@/lib/constants";
import type { Objective, Task } from "@/types";
import type { Person } from "@/types/workflow";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "../TaskCard";
import { TaskModal } from "../TaskModal";
import { TaskSelectorDialog } from "../TaskSelectorDialog";
import { ChevronDown } from "lucide-react";
import { deleteObjective } from "@/actions/objectives/deleteObjective";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksSection from "./TasksSection";
import TaskDetailPane from "./TaskDetailPane";

type ObjectivesSectionProps = {
  workflowId: string;
  objectives: Objective[];
  tasks: Task[];
  people: Person[];
  isLoading?: boolean;
  error?: string | null;
};

type ObjectiveTasksDisplayProps = {
  workflowId: string;
  people: Person[];
  objectiveId: string;
};

// Component to display tasks for a specific objective
function ObjectiveTasksDisplay({
  workflowId,
  people,
  objectiveId,
  setSelectedTask,
}: ObjectiveTasksDisplayProps & { setSelectedTask: (task: Task) => void }) {
  const { data: tasks, isLoading, error } = useTasks(workflowId);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Filter tasks by objectiveId
  const objectiveTasks =
    tasks?.filter((task) => task.objectiveId === objectiveId) || [];

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-5">
        <h3 className="text-lg font-semibold">Related Tasks</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-5">
        <h3 className="text-lg font-semibold">Related Tasks</h3>
        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Failed to load tasks for this objective.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-5">
        <div className="w-full flex flex-row justify-between items-center gap-3">
          <h3 className="text-lg font-semibold">Related Tasks</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" sideOffset={20}>
              <DropdownMenuItem onClick={() => setShowTaskModal(true)}>
                <div className="flex items-center gap-2 w-full">
                  <Plus className="size-5" />
                  Create New Task
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTaskSelector(true)}>
                <div className="flex items-center gap-2 w-full">
                  <BookmarkCheck className="size-5" />
                  Select Existing Task
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {objectiveTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground space-y-4">
            <BookmarkCheck className="size-12 stroke-1 stroke-input bg-transparent" />
            <p>No tasks found for this objective.</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task to Objective
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowTaskModal(true)}>
                  <div className="flex items-center gap-2 w-full">
                    <Plus className="size-5" />
                    Create New Task
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTaskSelector(true)}>
                  <div className="flex items-center gap-2 w-full">
                    <BookmarkCheck className="size-5" />
                    Select Existing Task
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto">
            {objectiveTasks.map((task) => (
              <div key={task.id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
                <TaskCard
                  task={task}
                  workflowId={workflowId}
                  people={people}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* External Modals */}
      <TaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        workflowId={workflowId}
        people={people}
        objectiveId={objectiveId}
      />

      <TaskSelectorDialog
        open={showTaskSelector}
        onOpenChange={setShowTaskSelector}
        workflowId={workflowId}
        people={people}
        objectiveId={objectiveId}
      />
    </>
  );
}

const ObjectivesSection = ({
  workflowId,
  objectives = [],
  tasks = [],
  people = [],
  isLoading = false,
  error = null,
}: ObjectivesSectionProps) => {
  console.log("ObjectivesSection props:", {
    objectives,
    people,
    isLoading,
    error,
    tasks,
  });
  const [activeTab, setActiveTab] = useState<"objectives" | "tasks">(
    "objectives"
  );
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Handle back to objectives list
  const handleBackToObjectives = () => {
    setSelectedObjective(null);
  };

  const handleDeleteObjective = async (
    id: string,
    title: string,
    workflowId: string
  ) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        console.log("Deleting objective:", id);

        const res = await deleteObjective({ id, workflowId });

        if (res.success) {
          toast.success("Objective deleted successfully");
        } else {
          toast.error(res.error || "Failed to delete objective");
        }
      } catch (error) {
        console.error("Error deleting objective:", error);
        toast.error("Failed to delete objective");
      }
    }
  };

  // Helper function to get objective stats
  const getObjectiveStats = (objective: Objective) => {
    const tasks = objective.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETE"
    ).length;
    const inProgressTasks = tasks.filter(
      (task) => task.status === "IN_PROGRESS"
    ).length;
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, inProgressTasks, progress };
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading objectives...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertDescription>Failed to load objectives: {error}</AlertDescription>
      </Alert>
    );
  }

  // If a task is selected, show its detail pane and hide the tabs
  if (selectedTask) {
    return (
      <div className={cn(SECTION_CLASS, "flex flex-col h-full w-full gap-5")}> 
        <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <TaskDetailPane task={selectedTask} />
      </div>
    );
  }

  // If an objective is selected, show its detail view
  if (selectedObjective) {
    // const objectiveTasks = selectedObjective.tasks || []
    const stats = getObjectiveStats(
      selectedObjective as Objective & { tasks: Task[] }
    );

    return (
      <div className={cn(SECTION_CLASS, "flex flex-col h-full w-full gap-5")}>
        {/* Header with back button */}
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={handleBackToObjectives}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <ObjectiveModal
              workflowId={workflowId}
              objective={selectedObjective}
            >
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </ObjectiveModal>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDeleteObjective(
                  selectedObjective.id,
                  selectedObjective.title,
                  workflowId
                )
              }
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Objective details */}
        <div className="w-full flex flex-col items-start gap-3">
          <h2 className="text-2xl font-bold">{selectedObjective.title}</h2>
          {selectedObjective.description && (
            <p className="text-muted-foreground">
              {selectedObjective.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Tasks</div>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-2xl font-bold">{stats.progress}%</div>
            </div>
          </div>
        </div>

        {/* Tasks for this objective */}
        <ObjectiveTasksDisplay
          workflowId={workflowId}
          people={people}
          objectiveId={selectedObjective.id}
          setSelectedTask={setSelectedTask}
        />
      </div>
    );
  }

  // Main view with tabs (only hidden when a task is selected)
  return (
    <div className={cn(SECTION_CLASS, "flex flex-col h-full w-full")}> 
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "objectives" | "tasks")}
        className="flex-1 flex flex-col h-full w-full"
      >
        <TabsList className="grid w-fit grid-cols-2 mb-4 gap-2">
          <TabsTrigger value="objectives" className="">
            <LibrarySquare className="h-4 w-4" />
            Objectives
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <BookmarkCheck className="h-4 w-4" />
            All Tasks
          </TabsTrigger>
        </TabsList>
        {/* Objectives Tab */}
        <TabsContent value="objectives" className="flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">Objectives</h2>
              <p className="text-sm text-muted-foreground">
                Manage your workflow objectives and track progress
              </p>
            </div>
            <ObjectiveModal workflowId={workflowId}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Objective
              </Button>
            </ObjectiveModal>
          </div>
          {/* Objectives Table */}
          {objectives.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Objective</TableHead>
                    <TableHead>Tasks</TableHead>
                    {/* <TableHead>Progress</TableHead> */}
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {objectives.map((objective) => {
                    const stats = getObjectiveStats(objective);
                    return (
                      <TableRow
                        key={objective.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedObjective(objective)}
                      >
                        <TableCell>
                          <div className="max-w-[80%]">
                            <p className="font-medium text-base line-clamp-1">
                              {objective.title}
                            </p>
                            {objective.description && (
                              <p className="text-sm text-muted-foreground text-wrap line-clamp-2">
                                {objective.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{stats.totalTasks}</TableCell>
                        <TableCell>{/* Created date here */}</TableCell>
                        <TableCell>
                          {/* Actions here */}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4 h-full">
              <LibrarySquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No objectives yet</h3>
                <p className="text-muted-foreground text-sm">
                  Create your first objective to start organizing your
                  workflow tasks
                </p>
              </div>
              <ObjectiveModal workflowId={workflowId}>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Objective
                </Button>
              </ObjectiveModal>
            </div>
          )}
        </TabsContent>
        {/* All Tasks Tab */}
        <TabsContent value="tasks" className="flex-1 overflow-hidden">
          <TasksSection workflowId={workflowId} people={people} selectedTask={selectedTask} setSelectedTask={setSelectedTask} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ObjectivesSection;
