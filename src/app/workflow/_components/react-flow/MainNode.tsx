import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { ArrowUpRight, Circle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { EditableImage } from "../ui/EditableImage";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import TagsList from "../ui/TagsList";
import RolesList from "../ui/RolesList";
import { MainNodeData } from "@/types/workflow-components";

const sectionClass =
  "relative flex flex-row justify-start items-center flex-wrap gap-2 rounded-sm p-1 border-2 border-transparent";

interface MainNodeProps {
  id: string;
  data: MainNodeData;
  type?: string;
  selected?: boolean;
  isConnectable?: boolean;
  xPos?: number;
  yPos?: number;
  dragging?: boolean;
  targetPosition?: 'top' | 'right' | 'bottom' | 'left';
  sourcePosition?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * MainNode represents the primary workflow node in the flow editor.
 * It displays the main workflow information including title, description, tags, and roles.
 */
const MainNode = memo(function MainNode({ 
  data,
  selected = false,
  isConnectable = true
}: MainNodeProps) {
  return (
    <div 
      className={`flex flex-col bg-accent w-xl rounded-2xl overflow-hidden group shadow-sm border ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      data-testid="main-node"
    >
      <EditableImage
        workflowId={data.workflowId}
        field="backgroundImage"
        imageUrl={data.backgroundImage || undefined}
        alt="Background"
        className="relative flex-1 bg-card/50 aspect-7/3 z-10"
        imageClassName="object-cover object-center brightness-90"
      />
      
      <div className="flex flex-col flex-3 bg-card p-6 gap-5 z-20">
        {/* Logo and Title Section */}
        <div className="flex flex-col justify-center items-center gap-4 rounded-md p-1 border-2 border-transparent">
          <div className="h-12 flex flex-col justify-end">
            <EditableImage
              workflowId={data.workflowId}
              field="logoImage"
              imageUrl={data.logoImage || undefined}
              alt="Logo"
              className="relative aspect-square size-32 bg-accent rounded-lg"
              imageClassName="object-cover object-center rounded-lg"
            />
          </div>
          <h2 className="scroll-m-20 text-4xl font-medium tracking-tight first:mt-0 text-center">
            {data.title}
          </h2>
        </div>

        {/* Tags Section */}
        <div className={sectionClass}>
          <TagsList tags={data.tags} maxTags={6} />
          <Handle
            id="tags-source"
            type="source"
            position={Position.Right}
            className="!bottom-[-6px] text-2xl"
            style={{ height: "12px", width: "12px" }}
            isConnectable={isConnectable}
          />
        </div>

        {/* Description Section */}
        <div className={sectionClass}>
          {data.tagline && (
            <h3 className="scroll-m-20 text-2xl font-medium tracking-tight">
              {data.tagline}
            </h3>
          )}
          {data.description && (
            <p className="leading-6 text-md">{data.description}</p>
          )}
        </div>

        {/* Stage Indicator Section */}
        <div className={sectionClass}>
          <Tooltip>
            <TooltipTrigger>
              <h4 className="scroll-m-20 text-xl font-medium inline-flex justify-center items-center gap-2">
                Current stage <Info className="size-4" />
              </h4>
            </TooltipTrigger>
            <TooltipContent>
              <Link
                className="flex flex-row justify-center items-center"
                target="_blank"
                rel="noopener noreferrer"
                href="https://hbr.org/1983/05/the-five-stages-of-small-business-growth"
              >
                <p className="text-xs underline">
                  Based on HBR&apos;s Five Stages of Growth
                </p>
                <ArrowUpRight className="size-3" />
              </Link>
            </TooltipContent>
          </Tooltip>

          <div className="w-full grid grid-cols-5">
            <div className="col-span-2"></div>
            <div className="col-span-1 flex flex-col justify-center items-center gap-4">
              <div className="flex flex-col justify-center items-center">
                <Circle className="text-foreground size-5 fill-white animate-ping ease-in-out absolute" />
                <Circle className="text-foreground size-5 fill-accent-foreground" />
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="uppercase text-foreground text-sm">
                  Stage 1
                </span>
                <span className="text-foreground text-lg font-semibold">
                  Existence
                </span>
              </div>
            </div>
            <div className="col-span-2 flex flex-col justify-start items-start">
              <div className="h-5 flex flex-col w-full justify-center items-center">
                <Separator className="bg-gradient-to-r from-accent-foreground to-transparent" />
              </div>
            </div>
          </div>
          <Handle
            type="source"
            position={Position.Right}
            className="hidden group-hover:flex text-2xl"
            style={{ height: "12px", width: "12px" }}
            isConnectable={isConnectable}
          />
        </div>

        {/* Roles Section */}
        <div className={sectionClass}>
          <div className="flex flex-col justify-start gap-2 w-full">
            <h4 className="scroll-m-20 text-xl font-medium">Roles</h4>
            <div className="flex flex-row justify-start items-center flex-wrap gap-2 w-full">
              <RolesList data={data} />
            </div>
          </div>
          <Handle
            id="roles-source"
            type="source"
            position={Position.Right}
            className="hidden group-hover:flex text-2xl"
            style={{ height: "12px", width: "12px" }}
            isConnectable={isConnectable}
          />
        </div>
      </div>
    </div>
  );
});

export default MainNode;
