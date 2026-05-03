"use client";

import { useState } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { cn } from "@/lib/utils";
import {
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
import { ObjectiveModal } from "../modals/ObjectiveModal";
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
import { TaskStatus } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "../ui/TaskCard";
import { TaskModal } from "../modals/TaskModal";
import { TaskSelectorDialog } from "../modals/TaskSelectorDialog";
import { ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksSection from "./TasksSection";
import TaskDetailPane from "../tasks/TaskDetailPane";
import { Badge } from "@/components/ui/badge";
import { UpdateTask } from "@/actions/tasks/updateTask";
import { useDeleteObjective } from "@/hooks/useObjectives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DetailPaneHeader } from "../ui/DetailPaneHeader";

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter tasks by objectiveId and exclude archived tasks
  const objectiveTasks =
    tasks?.filter(
      (task) =>
        task.objectiveId === objectiveId &&
        task.status !== TaskStatus.ARCHIVED
    ) || [];

  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-5">
        <h3 className="text-lg font-semibold">Related tasks</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-5">
        <h3 className="text-lg font-semibold">Related tasks</h3>
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
          <h3 className="text-lg font-semibold">Related tasks</h3>
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
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookmarkCheck className="h-8 w-8 stroke-muted-foreground stroke-1" />
            </div>
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
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
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
    </>
  );
}

const ObjectivesSection = ({
  workflowId,
  objectives = [],
  tasks: tasksProp = [],
  people = [],
  isLoading = false,
  error = null,
}: ObjectivesSectionProps) => {
  // Use useTasks hook to get tasks with proper assignedPeople structure
  // This ensures tasks always have assignedPeople, unlike tasks from workflow data
  const { data: tasksFromHook = [] } = useTasks(workflowId);

  // Use tasks from hook if available, otherwise fall back to prop
  // The hook ensures tasks have proper assignedPeople structure
  const tasks = tasksFromHook.length > 0 ? tasksFromHook : tasksProp;

  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("objectives").withOptions({ history: "push" })
  );
  const [selectedObjectiveId, setSelectedObjectiveId] = useQueryState(
    "objective",
    parseAsString.withOptions({ history: "push" })
  );
  const [selectedTaskId, setSelectedTaskId] = useQueryState(
    "task",
    parseAsString.withOptions({ history: "push" })
  );

  // Derive selectedObjective and selectedTask from IDs
  const selectedObjective = selectedObjectiveId
    ? objectives.find((obj) => obj.id === selectedObjectiveId) || null
    : null;
  const selectedTask = selectedTaskId
    ? tasks.find((task) => task.id === selectedTaskId) || null
    : null;

  // Helper to set selected objective
  const handleSetSelectedObjective = (objective: Objective | null) => {
    if (objective) {
      setSelectedObjectiveId(objective.id);
    } else {
      setSelectedObjectiveId(null);
    }
  };

  // Helper to set selected task
  const handleSetSelectedTask = (task: Task | null) => {
    if (task) {
      setSelectedTaskId(task.id);
    } else {
      setSelectedTaskId(null);
    }
  };

  // Use the delete objective hook for optimistic updates
  const deleteObjectiveMutation = useDeleteObjective();
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    id: string | null;
    title: string | null;
  }>({ open: false, id: null, title: null });

  // Handle back to objectives list
  const handleBackToObjectives = () => {
    handleSetSelectedObjective(null);
  };

  const handleDeleteObjective = async (id: string, title: string) => {
    setDeleteDialogState({ open: true, id, title });
  };

  const confirmDeleteObjective = async () => {
    if (!deleteDialogState.id || !deleteDialogState.title) return;

    try {
      console.log("Deleting objective:", deleteDialogState.id);
      await deleteObjectiveMutation.mutateAsync({
        id: deleteDialogState.id,
        workflowId,
      });
      toast.success("Objective deleted successfully");
      setDeleteDialogState({ open: false, id: null, title: null });
      // Navigate back to objectives list after successful deletion
      handleSetSelectedObjective(null);
    } catch (error) {
      console.error("Error deleting objective:", error);
      toast.error("Failed to delete objective");
    }
  };

  // Helper function to get objective stats
  const getObjectiveStats = (objective: Objective) => {
    const tasks = (objective.tasks || []).filter(
      (task) => task.status !== TaskStatus.ARCHIVED
    );
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED"
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
        <TaskDetailPane
          task={selectedTask}
          onTaskUpdate={UpdateTask}
          onBack={() => handleSetSelectedTask(null)}
          people={people}
        />
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
        <DetailPaneHeader
          onBack={handleBackToObjectives}
          menuContent={
            <>
              <ObjectiveModal
                workflowId={workflowId}
                objective={selectedObjective}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              </ObjectiveModal>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  handleDeleteObjective(
                    selectedObjective.id,
                    selectedObjective.title
                  );
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          }
        />

        {/* Objective details */}
        <div className="w-full flex flex-col items-start gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            {selectedObjective.title}
          </h2>
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
          setSelectedTask={handleSetSelectedTask}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteDialogState.open}
          onOpenChange={(open) =>
            setDeleteDialogState({ ...deleteDialogState, open })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteDialogState.title}
                &quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() =>
                  setDeleteDialogState({ open: false, id: null, title: null })
                }
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteObjective}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Main view with tabs (only hidden when a task is selected)
  return (
    <div className={cn(SECTION_CLASS, "flex flex-col w-full")}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "objectives" | "tasks")}
        className="flex flex-col w-full"
      >
        <TabsList className="sticky top-0 z-10 backdrop-blur-3xl bg-card border-b border-border/50 py-4 mb-4 grid w-full grid-cols-2 gap-2">
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
        <TabsContent value="objectives" className="flex-1">
          {/* Header */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Objectives
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your project objectives and track its tasks and their
                  progress
                </p>
              </div>
              <div className="flex-shrink-0">
                <ObjectiveModal workflowId={workflowId}>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Objective
                  </Button>
                </ObjectiveModal>
              </div>
            </div>

            {/* Objectives Table */}
            {objectives.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16"></TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead>Tasks</TableHead>
                      {/* <TableHead>Progress</TableHead> */}
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...objectives]
                      .sort(
                        (a, b) =>
                          new Date(a.createdAt).getTime() -
                          new Date(b.createdAt).getTime()
                      )
                      .map((objective, index) => {
                        const stats = getObjectiveStats(objective);
                        const isLast = index === objectives.length - 1;
                        const stepNumber = index + 1;
                        return (
                          <TableRow
                            key={objective.id}
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleSetSelectedObjective(objective)}
                          >
                            <TableCell className="w-16 relative">
                              <div className="flex items-center justify-center h-full py-4">
                                <div className="flex flex-col items-center h-full">
                                  {/* Connecting line above */}
                                  {index > 0 && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-0.25 bg-input" />
                                  )}
                                  {/* Step circle */}
                                  <div className=" z-10 ring-2 ring-input flex items-center justify-center size-6 rounded-full border-2 border-primary bg-background">
                                    <span className="text-xs font-normal text-foreground">
                                      {stepNumber}
                                    </span>
                                  </div>
                                  {/* Connecting line below */}
                                  {!isLast && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1/2 w-0.25 bg-input" />
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                            <div className="flex gap-2 flex-col items-start py-1">
                              <p className="font-medium text-base line-clamp-1 text-ellipsis">
                                {objective.title}
                              </p>
                              {objective.description && (
                                <p className="text-sm text-muted-foreground text-wrap line-clamp-2">
                                  {objective.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "flex flex-row items-center gap-1 justify-center shrink-0 border",
                                stats.totalTasks > 0
                                  ? "border-primary bg-primary/30"
                                  : "border-input"
                              )}
                            >
                              <BookmarkCheck className="size-4" />
                              <span className="text-sm">
                                {stats.completedTasks === 0 &&
                                stats.totalTasks === 0 ? (
                                  <span className="text-muted-foreground">
                                    0
                                  </span>
                                ) : (
                                  <>
                                    <span
                                      className={cn(
                                        stats.completedTasks === 0 &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      {stats.completedTasks}
                                    </span>
                                    <span
                                      className={cn(
                                        stats.completedTasks === 0 &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      /
                                    </span>
                                    <span
                                      className={cn(
                                        stats.totalTasks === 0 &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      {stats.totalTasks}
                                    </span>
                                  </>
                                )}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {new Date(
                                objective.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{/* Actions here */}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center py-12 space-y-4 h-full">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <LibrarySquare className="size-8 stroke-muted-foreground stroke-1" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">No objectives yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first objective to start organizing your
                    workflow tasks
                  </p>
                </div>
                <ObjectiveModal workflowId={workflowId}>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Objective
                  </Button>
                </ObjectiveModal>
              </div>
            )}
          </div>
        </TabsContent>
        {/* All Tasks Tab */}
        <TabsContent value="tasks" className="flex-1">
          <TasksSection
            workflowId={workflowId}
            people={people}
            selectedTask={selectedTask}
            setSelectedTask={handleSetSelectedTask}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogState.open}
        onOpenChange={(open) =>
          setDeleteDialogState({ ...deleteDialogState, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialogState.title}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setDeleteDialogState({ open: false, id: null, title: null })
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteObjective}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ObjectivesSection;
