import React, { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";

interface NodeContextMenuProps {
  id: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function NodeContextMenu({ id, x, y, onClose }: NodeContextMenuProps) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;

    const newNode = {
      ...node,
      id: `${node.id}-copy-${Date.now()}`, // Better unique ID
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };

    addNodes(newNode);
    onClose();
  }, [id, getNode, addNodes, onClose]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => 
      edges.filter((edge) => edge.source !== id && edge.target !== id)
    );
    onClose();
  }, [id, setNodes, setEdges, onClose]);

  return (
    <div
      className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ left: x, top: y }}
    >
       <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 h-8"
        onClick={duplicateNode}
      >
        <Copy className="h-4 w-4" />
        Duplicate
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 h-8 text-destructive hover:text-destructive"
        onClick={deleteNode}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}