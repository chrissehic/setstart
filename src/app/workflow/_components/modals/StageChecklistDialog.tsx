"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { StageChecklistContent } from "../stages/StageChecklistContent";
import { useMutation } from "@tanstack/react-query";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { toast } from "sonner";
import { CompanyStage } from "@/types";
import { ArrowLeftRight } from "lucide-react";

export function StageChecklistDialog({
  workflowId,
  stageName,
  checklist,
  stageKey,
  direction = "forward", // NEW
}: {
  workflowId: string;
  stageName: string;
  stageKey: CompanyStage;
  direction?: "forward" | "backward"; // NEW
  checklist?: {
    id: string;
    title: string;
    description: string;
  }[];
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const updateMutation = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success("Stage updated successfully");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update stage. Please try again.");
    },
  });

  const handleContinue = () => {
    updateMutation.mutate({
      id: workflowId,
      stage: stageKey,
    });
  };

  const checklistContent = (
    <StageChecklistContent
      stageName={stageName}
      checklist={checklist}
      onContinue={handleContinue} // call mutation when continuing
      onSkip={handleContinue}
      direction={direction}
    />
  );

  const descriptionText =
    direction === "backward"
      ? "Review and optionally check the items before returning to the previous stage."
      : "Review and complete the checklist before moving to the next stage.";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="md:w-fit font-semibold">
            <ArrowLeftRight /> Switch to stage
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{stageName} checklist</DialogTitle>
            <DialogDescription>{descriptionText}</DialogDescription>
          </DialogHeader>
          {checklistContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" className="md:w-fit font-semibold">
          <ArrowLeftRight /> Switch to stage
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{stageName} checklist</DrawerTitle>
          <DrawerDescription>{descriptionText}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{checklistContent}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
