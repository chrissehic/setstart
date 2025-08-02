import { Stage } from "@/types";
import { Separator } from "@radix-ui/react-separator";
import { Circle } from "lucide-react";
import React from "react";

type StagePreviewProps = {
  stage: Stage;
  isLast: boolean;
};

export function StagePreview({ stage, isLast }: StagePreviewProps) {
  return (
    <div className="w-full grid grid-cols-5">
      <div className="col-span-2 flex flex-col justify-center items-start">
        {stage.stageNumber > 1 && (
          <div className="h-5 flex flex-col w-full justify-center items-center">
            <Separator className="bg-gradient-to-l w-full h-1 rounded-full from-accent-foreground to-transparent" />
          </div>
        )}
      </div>
      <div className="col-span-1 flex flex-col justify-center items-center gap-2">
                <span className="uppercase text-foreground text-sm h-7">
          Stage {stage.stageNumber}
        </span>
        <div className="flex flex-col justify-center items-center">
          <Circle className="text-foreground size-5 fill-foreground animate-ping ease-in-out absolute" />
          <Circle className={`text-foreground size-5 fill-foreground`} />
        </div>
        <div className="flex flex-col justify-center items-center">
          <span className="text-foreground text-lg font-semibold">
            {stage.title}
          </span>
        </div>
      </div>
      <div className="col-span-2 flex flex-col justify-center items-start">
        {!isLast && (
          <div className="h-5 flex flex-col w-full justify-center items-center">
            <Separator className="bg-gradient-to-r w-full h-1 rounded-full from-accent-foreground to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StagePreview;
