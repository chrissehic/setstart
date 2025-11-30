import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddTask } from "@/actions/tasks/addTask";
import { UpdateTask } from "@/actions/tasks/updateTask";
import { DeleteTask } from "@/actions/tasks/deleteTask";
import { GetTasks } from "@/actions/tasks/getTasks";
import { Task, TaskStatus, TaskPriority, Responsibility } from "@/types";
import { toast } from "sonner";

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  byWorkflow: (workflowId: string) => [...taskKeys.all, 'workflow', workflowId] as const,
};

// Hooks
export function useTasks(workflowId: string) {
  return useQuery({
    queryKey: taskKeys.byWorkflow(workflowId),
    queryFn: () => GetTasks(workflowId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddTask(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: AddTask,
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.byWorkflow(workflowId) });
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.byWorkflow(workflowId));
      
      // Optimistically update
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        workflowId,
        objectiveId: newTask.objectiveId || null,
        title: newTask.title,
        category: newTask.category,
        description: newTask.description || null,
        status: (newTask.status as TaskStatus) || TaskStatus.NOT_STARTED,
        responsibility: (newTask.responsibility as Responsibility) || Responsibility.IN_HOUSE,
        priority: (newTask.priority as TaskPriority) || TaskPriority.MEDIUM,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
        assignedPeople: [], // Will be populated after server response
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      queryClient.setQueryData<Task[]>(
        taskKeys.byWorkflow(workflowId),
        (old) => old ? [optimisticTask, ...old] : [optimisticTask]
      );
      
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(taskKeys.byWorkflow(workflowId), context?.previousTasks);
      toast.error("Failed to add task");
    },
    onSuccess: () => {
      toast.success("Task added successfully");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: taskKeys.byWorkflow(workflowId) });
      // Also invalidate objectives cache since adding a task affects objective task counts
      queryClient.invalidateQueries({ queryKey: ["objectives", workflowId] });
    },
  });
}

export function useUpdateTask(workflowId: string, showToast: boolean = true) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UpdateTask,
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byWorkflow(workflowId) });
      
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.byWorkflow(workflowId));
      
      // Optimistically update
      queryClient.setQueryData<Task[]>(
        taskKeys.byWorkflow(workflowId),
        (old) => old?.map(task => {
          if (task.id !== updatedTask.id) return task;
          
          // Preserve assignedPeople unless explicitly being updated
          let assignedPeople = task.assignedPeople || [];
          if (updatedTask.assignedPeople !== undefined) {
            // If assignedPeople is being updated, map personIds to person objects
            // We need to get person data from the existing task's assignedPeople
            assignedPeople = updatedTask.assignedPeople.map(personId => {
              // Try to find existing person data from the current task
              const existingAssignment = task.assignedPeople?.find(ap => ap.person.id === personId);
              if (existingAssignment) {
                return existingAssignment;
              }
              // If not found, create a placeholder (will be replaced by server response)
              return {
                person: {
                  id: personId,
                  name: '', // Will be populated by server
                  avatarImage: undefined,
                }
              };
            });
          }
          
          return { 
                ...task, 
                title: updatedTask.title ?? task.title,
                category: updatedTask.category ?? task.category,
                description: updatedTask.description ?? task.description,
                status: updatedTask.status ?? task.status,
                priority: updatedTask.priority ?? task.priority,
                responsibility: updatedTask.responsibility ?? task.responsibility,
                dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : task.dueDate,
            assignedPeople, // Always preserve assignedPeople
                updatedAt: new Date() 
          };
        }) || []
      );
      
      return { previousTasks };
    },
    onError: (err, updatedTask, context) => {
      queryClient.setQueryData(taskKeys.byWorkflow(workflowId), context?.previousTasks);
      toast.error("Failed to update task");
    },
    onSuccess: () => {
      if (showToast) {
        toast.success("Task updated successfully");
      }
    },
    onSettled: (_, __, updatedTask) => {
      // Invalidate tasks cache
      queryClient.invalidateQueries({ queryKey: taskKeys.byWorkflow(workflowId) });
      
      // If task status changed, also invalidate objectives cache since objectives include task data
      if (updatedTask.status !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["objectives", workflowId] });
      }
    },
  });
}

export function useDeleteTask(workflowId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: DeleteTask,
    onMutate: async (deletedTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byWorkflow(workflowId) });
      
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.byWorkflow(workflowId));
      
      // Optimistically remove
      queryClient.setQueryData<Task[]>(
        taskKeys.byWorkflow(workflowId),
        (old) => old?.filter(task => task.id !== deletedTask.id) || []
      );
      
      return { previousTasks };
    },
    onError: (err, deletedTask, context) => {
      queryClient.setQueryData(taskKeys.byWorkflow(workflowId), context?.previousTasks);
      toast.error("Failed to delete task");
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byWorkflow(workflowId) });
      // Also invalidate objectives cache since deleting a task affects objective task counts
      queryClient.invalidateQueries({ queryKey: ["objectives", workflowId] });
    },
  });
}
