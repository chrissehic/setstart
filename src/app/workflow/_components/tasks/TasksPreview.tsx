import { Badge } from "@/components/ui/badge";
import { cn, getStatusConfig } from "@/lib/utils";
import { Task } from "@/types";
import AssignedPeopleBadge from "../sections/AssignedPeopleBadge";
import { getTaskStatusIcon } from "../icons/TaskStatusIcons";

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {

  const statusConfig = getStatusConfig(task.status);

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between font-normal gap-2 py-1 pr-1 rounded-md",
        statusConfig.color
      )}
    >
      <div className="flex items-center gap-1.5 overflow-hidden px-2 justify-center">
        <span className={cn("text-xs shrink-0")}>
          {getTaskStatusIcon(task.status, "size-3.5 shrink-0")}
        </span>
        <span
          className={cn(
            "text-xs line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap"
          )}
          title={task.title}
        >
          {task.title}
        </span>
      </div>

      {task.assignedPeople && task.assignedPeople.length > 0 ? (
        <AssignedPeopleBadge
          people={task.assignedPeople
            .map((ap) => ap?.person)
            .filter((person): person is NonNullable<typeof person> => !!person)}
          variant="compact"
          maxDisplay={3}
        />
      ) : null}
    </div>
  );
}

interface TasksPreviewProps {
  tasks: Task[];
  max?: number;
}

export default function TasksPreview({
  tasks,
  max = 4, // default to max 5 rows
}: TasksPreviewProps) {
  const visibleTasks = tasks.slice(0, max);

  return (
    <div className="flex flex-col gap-1 relative mb-2">
      {visibleTasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}

      {tasks.length > max && (
        <div className="absolute flex flex-row w-full items-center justify-center bg-transparent -bottom-4">
          <Badge
            variant="inverse"
            className="text-xs bg-accent-foreground/20 hover:bg-accent-foreground/30"
          >
            <span className="text-foreground ">+{tasks.length - max} more</span>
          </Badge>
        </div>
      )}
    </div>
  );
}
