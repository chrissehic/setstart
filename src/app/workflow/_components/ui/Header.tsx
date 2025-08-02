import React from "react";
import { Badge } from "@/components/ui/badge";
import { WorkflowStatus } from "@/types/workflow";
import { WorkflowWithDetails } from "@/types";

const statusVariants: Record<WorkflowStatus, "blueprint" | "operational"> = {
  [WorkflowStatus.BLUEPRINT]: "blueprint",
  [WorkflowStatus.OPERATIONAL]: "operational",
};

function MenuBar({ workflow }: { workflow: WorkflowWithDetails }) {
  return (
    <header className="flex flex-row w-full">
      <div className="flex flex-1 flex-row h-full justify-center items-center text-center bg-background gap-2 p-2">
        <div className="flex w-full flex-row gap-2 justify-center items-center">
          <Badge
            className="capitalize h-fit"
            variant={
              statusVariants[workflow.status as WorkflowStatus] || "default"
            }
          >
            {workflow.status.toLowerCase()}
          </Badge>
          <h4 className="scroll-m-20 text-lg font-medium tracking-tight text-shadow-xs">
            {workflow.name}
          </h4>
        </div>
        <div className="flex flex-1"></div>
      </div>
    </header>
  );
}

export default MenuBar;
