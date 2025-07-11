"use client";
import { Workflow } from "@/generated/prisma";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WorkflowStatus } from "@/types/workflow";
import Link from "next/link";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import DeleteWorkflowAlert from "./DeleteWorkflowAlert";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<WorkflowStatus, "blueprint" | "operational"> = {
  [WorkflowStatus.BLUEPRINT]: "blueprint",
  [WorkflowStatus.OPERATIONAL]: "operational",
};

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <Link href={`/workflow/editor/${workflow.id}`} className="bg-red">
      <Card className="group cursor-pointer hover:bg-accent border shadow-xs rounded-lg overflow-hidden hover:shadow-sm dark:shadow-accent/30 transition-all duration-100">
        <CardContent>
          <div className="flex flex-row justify-between">
            <div className="flex flex-2 flex-col gap-1">
              <span className="uppercase text-xs">
                edited {workflow.updatedAt.toDateString()}
              </span>

              <div className="flex flex-col gap-1 justify-center">
                <Badge
                  className="capitalize"
                  variant={statusVariants[workflow.status as WorkflowStatus] || 'default'}
                >
                  {workflow.status.toLowerCase()}
                </Badge>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {workflow.name}
                </h4>
              </div>

              <p className="text-sm line-clamp-2">
                {workflow?.description ??
                  "Here will be shown an AI-generated description"}
              </p>
            </div>
            <div
              className={cn(
                "transition-all flex flex-1 flex-row gap-1 justify-end items-center h-fit",
                "invisible opacity-0 group-hover:visible group-hover:opacity-100",
                dropdownOpen && "visible opacity-100"
              )}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className="flex flex-row items-center justify-center gap-2">
                  <Pencil className="size-3" />
                  Edit
                </div>
              </Button>
              <WorkflowActions
                workflowId={workflow.id}
                workflowName={workflow.name}
                onDropdownChange={setDropdownOpen}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function WorkflowActions({
  onDropdownChange,
  workflowName,
  workflowId,
}: {
  onDropdownChange: (open: boolean) => void;
  workflowName: string;
  workflowId: string;
}) {
  return (
    <DropdownMenu onOpenChange={onDropdownChange}>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup className="w-full">
          <DropdownMenuItem
            asChild
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DeleteWorkflowAlert
              workflowName={workflowName}
              workflowId={workflowId}
            >
              <div className="w-full text-sm cursor-pointer text-destructive px-2 py-1 flex items-center gap-1 hover:bg-destructive/10">
                <Trash2 className="size-4" />
                Delete
              </div>
            </DeleteWorkflowAlert>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WorkflowCard;
