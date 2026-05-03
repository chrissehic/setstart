import React from "react";
import { TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, getStatusConfig } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { getTaskStatusIcon } from "../icons/TaskStatusIcons";

interface StatusDropdownProps {
  status: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  status,
  onStatusChange,
}) => {
  const statusConfig = getStatusConfig(status);

  // Safety check - if no config found, use a default
  if (!statusConfig) {
    return null;
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          className={cn("text-xs cursor-pointer flex items-center gap-1.5", statusConfig.color)}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={cn("text-xs shrink-0")}>
            {getTaskStatusIcon(status, "size-3 shrink-0")}
          </span>
          {statusConfig.label}
          <ChevronDown className="h-4 w-4" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        {[
          TaskStatus.NOT_STARTED,
          TaskStatus.IN_PROGRESS,
          TaskStatus.COMPLETED,
        ].map((statusOption) => {
          const config = getStatusConfig(statusOption);
          if (!config) return null; // Safety check
          return (
            <DropdownMenuItem
              key={statusOption}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(statusOption);
              }}
            >
              <span className="text-muted-foreground text-xs">Set as</span> 
              <Badge className={cn("text-xs flex items-center gap-1.5", config.color)}>
                <span className={cn("text-xs shrink-0")}>
                  {getTaskStatusIcon(statusOption, "size-3 shrink-0")}
                </span>
                <span className={cn("text-xs line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap")}>
                  {config.label}
                </span>
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown; 