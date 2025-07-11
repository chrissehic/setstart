import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/base-node";
import { NodeHeader } from "@/components/node-header";
import RolesList from "../RolesList";
import { RolesNodeData } from "@/types/workflow-components";

type RolesNodeProps = {
  id: string;
  data: RolesNodeData;
  type?: string;
  selected?: boolean;
  isConnectable?: boolean;
  xPos?: number;
  yPos?: number;
  dragging?: boolean;
  targetPosition?: 'top' | 'right' | 'bottom' | 'left';
  sourcePosition?: 'top' | 'right' | 'bottom' | 'left';
};

const RolesNode = memo(function RolesNode({ data }: RolesNodeProps) {
  return (
    <BaseNode>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
          {/* <div className={sectionClass}> */}
      {/* <div className="flex flex-col justify-start gap-2 w-full"> */}
        <h4 className="scroll-m-20 text-xl font-medium">Roles</h4>
      </NodeHeader>        <RolesList data={data} />

    </BaseNode>
  );
});

export default RolesNode;
