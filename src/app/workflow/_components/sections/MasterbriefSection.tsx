"use client";

import { cn } from "@/lib/utils";
import { SECTION_CLASS } from "@/lib/constants";
import SetIcon from "@/components/SetIcon";
import { Skeleton } from "@/components/ui/skeleton";

interface MasterbriefSectionProps {
  workflowId: string;
}

export default function MasterbriefSection({
  workflowId,
}: MasterbriefSectionProps) {
  // const { data: masterbrief = [], isLoading } = useMasterbrief(workflowId);

  // if (isLoading) {
  //   return (
  //     <div className={cn(SECTION_CLASS)}>
  //       <div className="flex flex-col items-center justify-center py-12 text-center w-full">
  //         <div className="aspect-[1/1.414] w-full bg-muted rounded-lg">
  //           <Skeleton className="w-full h-full" />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={cn(SECTION_CLASS)}>
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Masterbrief</h2>
          <p className="text-sm text-muted-foreground">
            The central strategic document that defines your entire workspace
            direction
          </p>
        </div>
      </div>

      {/* Empty State */}
      {/* <div className="flex flex-col items-center justify-center py-12 text-center w-full">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <SetIcon className="h-8 w-8 " />
        </div>
        <h3 className="text-lg font-medium mb-2">No masterbrief document yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Create your masterbrief document to establish the strategic foundation 
          and core direction for your entire workspace. This document will guide 
          all your decisions and planning.
        </p>

      </div> */}

      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
        <div className="aspect-[1/1.414] w-full bg-muted rounded-lg">

        </div>
      </div>
    </div>
  );
}
