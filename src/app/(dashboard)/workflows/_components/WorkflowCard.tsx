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
    <Link href={`/workflow/editor/${workflow.id}`} className="block">
      <Card
        className={cn(
          "group cursor-pointer border rounded-xl h-full",
          "transition-all duration-150 bg-card hover:bg-accent/80",
        )}
      >
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="uppercase text-[11px] tracking-wide text-muted-foreground">
                  Edited {workflow.updatedAt.toLocaleDateString()}
                </span>
                <h4 className="text-lg font-medium leading-snug tracking-normal">
                  {workflow.name}
                </h4>
                <Badge
                  variant={
                    statusVariants[workflow.status as WorkflowStatus] ||
                    "default"
                  }
                  className="self-start mt-1 text-xs capitalize"
                >
                  {workflow.status.toLowerCase()}
                </Badge>
              </div>

              <div
                className={cn(
                  "flex gap-1 items-center",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-100",
                  dropdownOpen && "opacity-100"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </Button>

                <WorkflowActions
                  workflowId={workflow.id}
                  workflowName={workflow.name}
                  onDropdownChange={setDropdownOpen}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {workflow?.description ??
                "Here will be shown an AI-generated description"}
            </p>
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
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <EllipsisVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <DeleteWorkflowAlert
              workflowName={workflowName}
              workflowId={workflowId}
            >
              <div className="w-full text-sm text-destructive flex items-center gap-1 px-2 py-1 hover:bg-destructive/10 cursor-pointer">
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
