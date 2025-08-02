"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Target, Users, Calendar, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useObjective } from "@/hooks/useObjectives";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/app/workflow/_components/ui/TaskCard";
import { TaskPriority, TaskStatus } from "@/types/workflow";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, Loader2 } from "lucide-react";

export default function ObjectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.workflowId as string;
  const objectiveId = params.objectiveId as string;

  const { data: objective, isLoading: objectiveLoading, error: objectiveError } = useObjective(objectiveId);
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks(workflowId);

  // Filter tasks for this objective
  const objectiveTasks = allTasks.filter(task => task.objectiveId === objectiveId);

  const getPriorityColor = (priority: string | TaskPriority | null | undefined) => {
    switch (priority) {
      case TaskPriority.HIGH:
      case 'HIGH':
        return "bg-red-100 text-red-800 border-red-200";
      case TaskPriority.MEDIUM:
      case 'MEDIUM':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case TaskPriority.LOW:
      case 'LOW':
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskStats = () => {
    const total = objectiveTasks.length;
    const completed = objectiveTasks.filter(task => task.status === TaskStatus.COMPLETE).length;
    const inProgress = objectiveTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const notStarted = objectiveTasks.filter(task => task.status === TaskStatus.NOT_STARTED).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, notStarted, progress };
  };

  const handleBack = () => {
    router.back()
  };

  if (objectiveLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (objectiveError || !objective) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircleIcon />
          <AlertTitle>Error loading objective</AlertTitle>
          <AlertDescription>
            <p>{objectiveError?.message || "Objective not found"}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workflow
          </Button>
        </div>

        {/* Objective Header */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{objective.title}</h1>
              {objective.priority && (
                <Badge
                  variant="outline"
                  className={getPriorityColor(objective.priority)}
                >
                  {objective.priority}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {objective.description && (
            <p className="text-muted-foreground mb-4">{objective.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-lg font-semibold">{stats.progress}%</p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-lg font-semibold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-background rounded-lg p-4 border">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-lg font-semibold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {new Date(objective.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {new Set(objectiveTasks.flatMap(task => task.assignedPeople.map(ap => ap.person.id))).size} people assigned
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>

          {objectiveTasks.length > 0 ? (
            <div className="space-y-4">
              {objectiveTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  workflowId={workflowId}
                  people={[]} // We'll need to pass people from the workflow
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No tasks yet</h3>
                <p className="text-muted-foreground text-sm">
                  Create your first task to start working on this objective
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Task
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
