"use client"

import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ColorMode,
  Panel,
  Background,
  BackgroundVariant,
  MiniMap,
  Position,
  ConnectionLineType,
  useReactFlow,
  type Connection,
} from "@xyflow/react"
import { useCallback, useRef, useState, useEffect } from "react"
import { WorkflowStatus } from "@/types/workflow"

import "@xyflow/react/dist/style.css"
// import MenuBar from "../Header"
import NodeContextMenu from "../ContextMenu"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

import MainNode from "./MainNode"
import { Loader2 } from "lucide-react"
import AIInputForm from "@/components/SearchInput"
import type { WorkflowWithDetails } from "@/types"
import dagre from "@dagrejs/dagre"
import TagsNode from "./TagsNode"
import RolesNode from "./RolesNode"

const statusVariants: Record<WorkflowStatus, "blueprint" | "operational"> = {
  [WorkflowStatus.BLUEPRINT]: "blueprint",
  [WorkflowStatus.OPERATIONAL]: "operational",
}

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

// Default dimensions as fallback
const DEFAULT_NODE_WIDTH = 200
const DEFAULT_NODE_HEIGHT = 100

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const isHorizontal = direction === "LR"
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 })

  nodes.forEach((node) => {
    // Use measured dimensions if available, otherwise fall back to defaults
    const width = node.measured?.width || node.width || DEFAULT_NODE_WIDTH
    const height = node.measured?.height || node.height || DEFAULT_NODE_HEIGHT

    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const width = node.measured?.width || node.width || DEFAULT_NODE_WIDTH
    const height = node.measured?.height || node.height || DEFAULT_NODE_HEIGHT

    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    }

    return newNode
  })

  return { nodes: newNodes, edges }
}

const FlowEditor = ({ workflow }: { workflow: WorkflowWithDetails }) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLayouting, setIsLayouting] = useState(false)
  const [initialLayoutApplied, setInitialLayoutApplied] = useState(false) // New state variable
  const reactFlowInstance = useReactFlow()

  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const ref = useRef(null)

  const nodeTypes = {
    mainNode: MainNode,
    tagsNode: TagsNode,
    rolesNode: RolesNode,
  }

  const initialNodes: Node[] = [
    {
      id: "1",
      type: "mainNode",
      data: {
        title: workflow.name,
        tagline: workflow.tagline,
        description: workflow.description,
        logoImage: workflow.logoImage,
        backgroundImage: workflow.backgroundImage,
        tags: workflow.tags,
        people: workflow.people,
        estimatedDuration: workflow.estimatedDuration,
        workflowId: workflow.id,
      },
      position: { x: 0, y: 0 },
    },
    {
      id: "2",
      type: "tagsNode",
      data: {
        title: "Associated Tags",
        tags: workflow.tags,
        workflowId: workflow.id,
      },
      position: { x: 0, y: 0 },
    },
    {
      id: "3",
      type: "rolesNode",
      data: {
        title: "Associated Roles",
        people: workflow.people,
        workflowId: workflow.id,
      },
      position: { x: 0, y: 0 },
    },
  ]

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      type: ConnectionLineType.SmoothStep,
      animated: true,
      // sourceHandle: "tags-source",
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      type: ConnectionLineType.SmoothStep,
      animated: true,
      // sourceHandle: "roles-source",
    },
  ]

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Function to wait for nodes to be measured
  const waitForNodeMeasurements = useCallback(
    async (nodeIds: string[]) => {
      return new Promise<void>((resolve) => {
        const checkMeasurements = () => {
          const allMeasured = nodeIds.every((id) => {
            const node = reactFlowInstance.getNode(id)
            return node?.measured?.width && node?.measured?.height
          })

          if (allMeasured) {
            resolve()
          } else {
            // Check again in the next frame
            requestAnimationFrame(checkMeasurements)
          }
        }

        checkMeasurements()
      })
    },
    [reactFlowInstance],
  )

  // Auto-layout with proper measurements
  const applyAutoLayout = useCallback(
    async (direction = "TB") => {
      setIsLayouting(true)

      try {
        // Get current nodes and edges directly from the instance
        const currentNodes = reactFlowInstance.getNodes()
        const currentEdges = reactFlowInstance.getEdges()

        // Wait for all nodes to be measured
        const nodeIds = currentNodes.map((node) => node.id)
        await waitForNodeMeasurements(nodeIds)

        // Get the latest nodes with measurements again, as they might have updated during waitForNodeMeasurements
        const measuredNodes = nodeIds.map((id) => reactFlowInstance.getNode(id)).filter(Boolean) as Node[]

        // Apply layout with measured dimensions
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          measuredNodes,
          currentEdges,
          direction,
        )

        setNodes(layoutedNodes)
        setEdges(layoutedEdges)

        // Fit view after layout
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.1 })
        }, 0)
      } catch (error) {
        console.error("Error applying auto layout:", error)
      } finally {
        setIsLayouting(false)
      }
    },
    [reactFlowInstance, waitForNodeMeasurements, setNodes, setEdges], // Stable dependencies
  )

  // Initial layout effect
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Update node data while preserving positions
    setNodes(nodes => {
      return nodes.map(node => {
        // Only update the data, keep position and other properties
        if (node.id === "1") {
          return {
            ...node,
            data: {
              ...node.data,
              title: workflow.name,
              tagline: workflow.tagline,
              description: workflow.description,
              logoImage: workflow.logoImage,
              backgroundImage: workflow.backgroundImage,
              tags: workflow.tags,
              people: workflow.people,
              estimatedDuration: workflow.estimatedDuration,
              workflowId: workflow.id,
            }
          };
        } else if (node.id === "2") {
          return {
            ...node,
            data: {
              ...node.data,
              tags: workflow.tags,
              workflowId: workflow.id,
            }
          };
        } else if (node.id === "3") {
          return {
            ...node,
            data: {
              ...node.data,
              people: workflow.people,
              workflowId: workflow.id,
            }
          };
        }
        return node;
      });
    });
    
    // Don't auto-layout here to prevent jumping
    // The initial layout is already handled by the other effect
  }, [workflow, applyAutoLayout, setNodes, setEdges])

  useEffect(() => {
    if (mounted && nodes.length > 0 && !initialLayoutApplied) {
      // Small delay to ensure nodes are rendered and measured
      const timer = setTimeout(() => {
        applyAutoLayout("TB")
        setInitialLayoutApplied(true) // Mark layout as applied
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [mounted, nodes.length, initialLayoutApplied, applyAutoLayout]) // applyAutoLayout is now stable

  const colorMode: ColorMode = mounted
    ? resolvedTheme === "dark" || resolvedTheme === "light"
      ? resolvedTheme
      : "system"
    : "system"

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)),
    [setEdges],
  )

  const onLayout = useCallback(
    (direction: string) => {
      applyAutoLayout(direction)
    },
    [applyAutoLayout],
  )

  if (!mounted) {
    return (
      <main className="h-full w-full">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="h-full w-full">
      <ReactFlow
        ref={ref}
        nodeTypes={nodeTypes}
        colorMode={colorMode}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodesDraggable={false}
        nodesConnectable={false}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.1 }}
      >
        <Panel position="top-left">
          {/* <MenuBar /> */}
        </Panel>
        <Panel position="top-center">
          <div className="flex flex-row justify-center items-center text-center gap-2">
            <div className="flex flex-col gap-1 justify-center">
              <Badge className="capitalize" variant={statusVariants[workflow.status as WorkflowStatus] || "default"}>
                {workflow.status.toLowerCase()}
              </Badge>
            </div>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-shadow-xs">{workflow.name}</h4>
          </div>
        </Panel>
        <Panel position="bottom-center" className="w-full !pointer-events-none" onClick={(e) => e.stopPropagation()}>
          <AIInputForm workflowId={workflow.id} onSuccess={() => console.log("Updated!")} />
        </Panel>
        <Panel position="top-right">
          <div className="flex flex-col gap-2">
            <button className="xy-theme__button" onClick={() => onLayout("TB")} disabled={isLayouting}>
              {isLayouting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vertical Layout"}
            </button>
            <button className="xy-theme__button" onClick={() => onLayout("LR")} disabled={isLayouting}>
              {isLayouting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Horizontal Layout"}
            </button>
          </div>
        </Panel>
        <Background variant={BackgroundVariant.Dots} bgColor="bg-red-300" />
        {menu && menu.id !== "1" && (
          <NodeContextMenu id={menu.id} x={menu.x} y={menu.y} onClose={() => setMenu(null)} />
        )}
        <MiniMap />
      </ReactFlow>
    </main>
  )
}

export default FlowEditor
