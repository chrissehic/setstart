import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/helpers/getInitials";
import { cn, getCategoryConfig } from "@/lib/utils";
import { Task } from "@/types";

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  const categoryConfig = getCategoryConfig(task.category);
  return (
    <div
      className={cn(
        "flex flex-row items-end justify-between gap-2 px-1 py-1 rounded-md",
        categoryConfig.color
      )}
    >
      <div className="flex flex-col items-start overflow-hidden px-2">
        <span className={cn("text-sm line-clamp-1")} title={task.title}>
          {task.title}
        </span>
      </div>

      <div className="flex -space-x-1 flex-row">
        {task.assignedPeople.map(({ person }) => {
          if (!person) return null;
          
          return (
            <Avatar key={person.id} className="w-6 h-6 rounded-full">
              {person.avatarImage && (
                <AvatarImage src={person.avatarImage} alt={person.name} />
              )}
              <AvatarFallback className="bg-accent text-xs text-foreground border-input border rounded-full">
                {getInitials(person.name)}
              </AvatarFallback>
            </Avatar>
          );
        })}
      </div>
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
          <Badge variant="inverse" className="text-xs bg-accent-foreground/20 hover:bg-accent-foreground/30">
            <span className="text-foreground ">+{tasks.length - max} more</span>
          </Badge>
        </div>
      )}
    </div>
  );
}
