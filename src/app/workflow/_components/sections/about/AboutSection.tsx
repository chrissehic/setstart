import React from "react";
import { sectionClass } from "../../Workspace";
import { cn } from "@/lib/utils";
import TagsList from "../../TagsList";
import { Separator } from "@/components/ui/separator";
import { EditableImage } from "../../EditableImage";
import { AsteriskSquare, Info, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkflowData } from "@/types/workflow";
import EditableField from "../../EditableField";

const classWrapper = "flex flex-col justify-start gap-2 w-full py-5";

function AboutSection({ data }: { data: WorkflowData }) {
  return (
    <div className={cn(sectionClass)}>
      <EditableField
        workflowId={data.id}
        field="name"
        value={data.name}
        label="Name"
        className={classWrapper}
        placeholder="Your company name here"
      />
      <Separator className="h-0.5" />
      <div className={classWrapper}>
        <Tooltip>
          <TooltipTrigger className="w-fit">
            <span className="w-fit uppercase text-xs font-semibold text-muted-foreground inline-flex justify-center items-center gap-1">
              Identity
              <Info className="size-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">The company&apos;s visual identity</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex flex-row justify-start gap-3 overflow-auto">
          <div className="flex flex-col justify-start gap-1">
            <EditableImage
              alt="icon"
              workflowId={data.id}
              field="iconFile"
              imageUrl={undefined}
              className="relative w-fit h-28 bg-accent rounded-lg border-input/60 border px-4"
              imageClassName="object-cover object-center rounded-lg"
            >
              <span
                className="
                wordmark
                text-4xl font-bold text-transparent bg-clip-text opacity-30
                group-hover/image:opacity-10 transition-opacity duration-150 ease-in-out select-none
                "
              >
                setstart®
              </span>
            </EditableImage>
            <span className="text-sm">Main logo</span>
          </div>
          <div className="flex flex-col justify-start gap-1 ">
            <EditableImage
              alt="icon"
              workflowId={data.id}
              field="iconFile"
              imageUrl={undefined}
              className="relative w-fit aspect-square h-28 bg-accent rounded-lg border-input/60 border"
              imageClassName="object-cover object-center rounded-lg"
            >
              <AsteriskSquare
                className="size-12 stroke-1 stroke-foreground
                flex items-center justify-center
                text-4xl font-medium bg-clip-text opacity-30
                group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none"
              />
            </EditableImage>
            <span className="text-sm">Logo icon</span>
          </div>
          <div className="flex flex-col justify-start gap-1 ">
            <EditableImage
              alt="icon"
              workflowId={data.id}
              field="iconFile"
              imageUrl={undefined}
              className="relative w-fit aspect-square h-28 bg-accent rounded-lg border-input/60 border"
              imageClassName="object-cover object-center rounded-lg"
            >
              <Plus
                className="size-8 opacity-30
                group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none"
              />
            </EditableImage>
            <span className="text-sm">Add asset</span>
          </div>
        </div>
      </div>
      <Separator className="h-0.5" />
      <div className={classWrapper}>
        <span className="uppercase text-xs font-semibold text-muted-foreground">
          Avatar & banner
        </span>
        <div className="flex flex-row justify-start gap-3 h-fit relative overflow-auto">
          <div className="flex flex-col justify-start gap-1 min-h-0">
            <EditableImage
              workflowId={data.id}
              field="logoImage"
              imageUrl={data.logoImage || undefined}
              alt="Logo"
              className="relative aspect-square bg-accent h-32 rounded-lg border-input/60 border"
              imageClassName="object-cover object-center rounded-lg"
            >
              <Plus
                className="size-8 opacity-30
                group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none"
              />
            </EditableImage>
            <span className="text-sm shrink-0 h-fit">Avatar</span>
          </div>
          <div className="flex flex-col justify-start gap-1 min-h-0">
            <EditableImage
              workflowId={data.id}
              field="backgroundImage"
              imageUrl={data.backgroundImage || undefined}
              alt="Background"
              className="relative bg-accent z-10 h-32 aspect-7/2 rounded-lg border-input/60 border overflow-hidden"
              imageClassName="object-center brightness-90 w-auto object-cover"
            >
              <Plus
                className="size-8 opacity-30
                group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none"
              />
            </EditableImage>
            <span className="text-sm shrink-0 h-fit">Background banner</span>
          </div>
        </div>
      </div>
      <Separator className="h-0.5" />
      <EditableField
        workflowId={data.id}
        field="tagline"
        value={data.tagline}
        label="Tagline"
        placeholder="Your tagline here"
        className={classWrapper}
      />
      <Separator className="h-0.5" />
      <EditableField
        workflowId={data.id}
        field="description"
        value={data.description || ""}
        label="Description"
        placeholder="Your description here"
        className={classWrapper}
      />
      <Separator className="h-0.5" />
      <div className={classWrapper}>
        <span className="uppercase text-xs font-semibold text-muted-foreground">
          Categories
        </span>
        <TagsList tags={data.tags} />
      </div>
      <Separator className="h-0.5" />
      <div className={classWrapper}>
        <span className="uppercase text-xs font-semibold text-muted-foreground">
          Marketing
        </span>
        <div className="flex flex-row justify-start gap-3 overflow-auto">
          <div className="flex flex-col justify-start gap-1 ">
            <EditableImage
              alt="icon"
              workflowId={data.id}
              field="iconFile"
              imageUrl={undefined}
              className="relative w-fit aspect-video h-28 bg-accent rounded-lg border-input/60 border"
              imageClassName="object-cover object-center rounded-lg"
            >
              <Plus
                className="size-8 opacity-30
                group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none"
              />
            </EditableImage>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutSection;
