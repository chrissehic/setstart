import React from "react";
import { TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, getStatusConfig } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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
          className={cn("text-xs cursor-pointer", statusConfig.color)}
        >
          {statusConfig.label}
          <ChevronDown className="h-4 w-4" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
              onClick={() => onStatusChange(statusOption)}
            >
              <span className="text-muted-foreground text-xs">Set as</span> 
              <Badge className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown; 