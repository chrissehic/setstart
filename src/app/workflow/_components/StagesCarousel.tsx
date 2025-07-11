import { Separator } from "@radix-ui/react-separator";
import { Circle } from "lucide-react";
import React from "react";

function StagePreview() {
  return (
    <div className="w-full grid grid-cols-5">
      <div className="col-span-2"></div>
      <div className="col-span-1 flex flex-col justify-center items-center gap-4">
        <div className="flex flex-col justify-center items-center">
          <Circle className="text-foreground size-5 fill-white animate-ping ease-in-out absolute" />
          <Circle className="text-foreground size-5 fill-accent-foreground" />
        </div>
        <div className="flex flex-col justify-center items-center">
          <span className="uppercase text-foreground text-sm">Stage 1</span>
          <span className="text-foreground text-lg font-semibold">
            Existence
          </span>
        </div>
      </div>
      <div className="col-span-2 flex flex-col justify-start items-start">
        <div className="h-5 flex flex-col w-full justify-center items-center">
          <Separator className="bg-gradient-to-r w-full h-1 rounded-full from-accent-foreground to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default StagePreview;
