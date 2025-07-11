import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex flex-1 flex-row h-full justify-center items-center text-center bg-accent gap-2 p-2">
        <div className="flex flex-1 flex-row gap-3">
          <Button
            asChild
            className="group flex flex-row gap-2"
            variant={"outline"}
          >
            <Link href={"/workflows"} className="">
              <ArrowLeft />
              Back to projects
            </Link>
          </Button>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          <Badge
            className="capitalize h-fit"
            variant={
              statusVariants[workflow.status as WorkflowStatus] || "default"
            }
          >
            {workflow.status.toLowerCase()}
          </Badge>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-shadow-xs">
            {workflow.name}
          </h4>
        </div>
        <div className="flex flex-1"></div>
      </div>
    </header>
  );
}

export default MenuBar;
