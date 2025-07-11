import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { BaseNode } from "@/components/base-node";
import { NodeHeader } from "@/components/node-header";
import TagsList from "../TagsList";
import { TagsNodeData } from "@/types/workflow-components";

type TagsNodeProps = {
  id: string;
  data: TagsNodeData;
  type?: string;
  selected?: boolean;
  isConnectable?: boolean;
  xPos?: number;
  yPos?: number;
  dragging?: boolean;
  targetPosition?: 'top' | 'right' | 'bottom' | 'left';
  sourcePosition?: 'top' | 'right' | 'bottom' | 'left';
};

const TagsNode = ({ data }: TagsNodeProps) => {
  const tags = data?.tags || [];
  
  return (
    <BaseNode>
      <Handle type="target" position={Position.Top} />
      <NodeHeader>
        <TagsList tags={tags} />
      </NodeHeader>
    </BaseNode>
  );
};

export default memo(TagsNode);
