"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
  Edit,
  List,
  Loader2,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
  AlertCircleIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ObjectiveModal } from "../ObjectiveModal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SECTION_CLASS } from "@/lib/constants"
import type { Objective, Task } from "@/types"
import type { Person } from "@/types/workflow"
import TasksSection from "./TasksSection"
import { useTasks } from "@/hooks/useTasks"
import TaskCard from "../TaskCard"
import { TaskModal } from "../TaskModal"
import { TaskSelectorDialog } from "../TaskSelectorDialog"
import { ChevronDown, Sparkles } from "lucide-react"

type ObjectivesSectionProps = {
  workflowId: string
  objectives: Objective[]
  tasks: Task[]
  people: Person[]
  isLoading?: boolean
  error?: string | null
}

type ObjectiveTasksDisplayProps = {
  workflowId: string
  people: Person[]
  objectiveId: string
}

// Component to display tasks for a specific objective
function ObjectiveTasksDisplay({ workflowId, people, objectiveId }: ObjectiveTasksDisplayProps) {
  const { data: tasks, isLoading, error } = useTasks(workflowId)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  
  // Filter tasks by objectiveId
  const objectiveTasks = tasks?.filter(task => task.objectiveId === objectiveId) || []
  
  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>Failed to load tasks for this objective.</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <>
      <div className="flex-1 overflow-hidden w-full flex flex-col gap-2">
        <div className="w-full flex flex-row justify-between items-center gap-3">
        <h3 className="text-lg font-semibold">Tasks</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add task
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom">
                <DropdownMenuItem onClick={() => setShowTaskModal(true)}>
                  <div className="flex items-center gap-2 w-full">
                    <Plus className="h-4 w-4" />
                    Create New Task
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTaskSelector(true)}>
                  <div className="flex items-center gap-2 w-full">
                    <Sparkles className="h-4 w-4" />
                    Select Existing Task
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        {objectiveTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground space-y-4">
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
                    <Plus className="h-4 w-4" />
                    Create New Task
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTaskSelector(true)}>
                  <div className="flex items-center gap-2 w-full">
                    <Sparkles className="h-4 w-4" />
                    Select Existing Task
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto">
            {objectiveTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                workflowId={workflowId}
                people={people}
              />
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
  )
}

const ObjectivesSection = ({
  workflowId,
  objectives = [],
  tasks = [],
  people = [],
  isLoading = false,
  error = null,
}: ObjectivesSectionProps) => {
  console.log('ObjectivesSection props:', { objectives, people, isLoading, error, tasks })
  const [activeTab, setActiveTab] = useState<"objectives" | "tasks">("objectives")
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null)

  // Handle objective selection - this switches to a detail view
  const handleObjectiveClick = (objective: Objective) => {
    setSelectedObjective(objective)
  }

  // Handle back to objectives list
  const handleBackToObjectives = () => {
    setSelectedObjective(null)
  }

  // Handle delete objective
  const handleDeleteObjective = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        console.log("Deleting objective:", id)
        toast.success("Objective deleted successfully")
      } catch (error) {
        console.error("Error deleting objective:", error)
        toast.error("Failed to delete objective")
      }
    }
  }

  // Helper function to get objective stats
  const getObjectiveStats = (objective: Objective) => {
    const tasks = objective.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "COMPLETE").length
    const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS").length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return { totalTasks, completedTasks, inProgressTasks, progress }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading objectives...</span>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertDescription>Failed to load objectives: {error}</AlertDescription>
      </Alert>
    )
  }

  // If an objective is selected, show its detail view
  if (selectedObjective) {
    // const objectiveTasks = selectedObjective.tasks || []
    const stats = getObjectiveStats(selectedObjective as Objective & { tasks: Task[] })

    return (
      <div className={cn(SECTION_CLASS, "flex flex-col h-full w-full gap-5")}>
        {/* Header with back button */}
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={handleBackToObjectives} className="p-0 h-6">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Objectives
          </Button>
          <div className="flex gap-2">
            <ObjectiveModal workflowId={workflowId} objective={selectedObjective}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </ObjectiveModal>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteObjective(selectedObjective.id, selectedObjective.title)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Objective details */}
        <div className="w-full flex flex-col items-start gap-3">
          <h2 className="text-2xl font-bold">{selectedObjective.title}</h2>
          {selectedObjective.description && (
            <p className="text-muted-foreground">{selectedObjective.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Tasks</div>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
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
        />
      </div>
    )
  }

  // Main view with tabs
  return (
    <div className={cn(SECTION_CLASS, "flex flex-col h-full w-full")}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "objectives" | "tasks")}
        className="flex-1 flex flex-col h-full w-full"
      >
        <TabsList className="grid w-fit grid-cols-2 mb-4 gap-2">
          <TabsTrigger value="objectives" className="">
            <Target className="h-4 w-4" />
            Objectives
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <List className="h-4 w-4" />
            All Tasks
          </TabsTrigger>
        </TabsList>

        {/* Objectives Tab */}
        <TabsContent value="objectives" className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">Objectives</h2>
                <p className="text-sm text-muted-foreground">Manage your workflow objectives and track progress</p>
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
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {objectives.map((objective) => {
                      const stats = getObjectiveStats(objective)
                      return (
                        <TableRow
                          key={objective.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleObjectiveClick(objective)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{objective.title}</p>
                              {objective.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{objective.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              {/* <span className="font-medium">{stats.completedTasks}</span> */}
                              
                              <Badge variant={'secondary'}><span className="text-accent-foreground">{stats.totalTasks}</span>
                              </Badge>
                     
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${stats.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{stats.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(objective.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <ObjectiveModal workflowId={workflowId} objective={objective}>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Objective
                                  </DropdownMenuItem>
                                </ObjectiveModal>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteObjective(objective.id, objective.title)
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Objective
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4 h-full">
                <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No objectives yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first objective to start organizing your workflow tasks
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
          </div>
        </TabsContent>

        {/* All Tasks Tab */}
        <TabsContent value="tasks" className="flex-1 overflow-hidden">
          <TasksSection workflowId={workflowId} people={people} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ObjectivesSection
