"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tabs } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { EditableImage } from "./EditableImage"
import Sidebar from "./SidebarMenu"
import type { WorkflowData } from "@/types/workflow"
import { COMPANY_STAGES } from "@/types/companyStages"
import { WorkspaceHeader } from "./WorkspaceHeader"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { CARD_CLASS, SECTION_CLASS, WORKSPACE_ITEMS } from "@/lib/constants"
import { SectionTabs } from "./SectionTabs"
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation"
import { TabContent } from "./TabContent"

interface WorkspaceProps {
  id: string
  data: WorkflowData
}

const Workspace = ({ id, data }: WorkspaceProps) => {
  const [mounted, setMounted] = useState(false)
  const { tabActive, handleTabChange } = useWorkspaceNavigation()

  const stageObj = COMPANY_STAGES?.find((s) => s?.key === data.stage) ?? COMPANY_STAGES[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <LoadingSpinner />
  }

  return (
    <main className={cn("grid gap-2 h-full w-full overflow-hidden p-2")}>
      <ResizablePanelGroup direction="horizontal" className="h-full w-full gap-2">
        {/* Sidebar Panel */}
        <ResizablePanel defaultSize={10} minSize={10} maxSize={30} className={cn(CARD_CLASS, "overflow-auto!")}>
          <div className={SECTION_CLASS}>
            <Sidebar active={tabActive} onTabChange={handleTabChange} items={WORKSPACE_ITEMS} />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <Tabs value={tabActive} onValueChange={handleTabChange} defaultValue="" className="w-full">
          {/* Main Content Panel */}
          <ResizablePanel
            defaultSize={40}
            minSize={20}
            className={cn("relative pb-26", CARD_CLASS)}
            data-testid={`workspace-${id}`}
          >
            <EditableImage
              workflowId={data.id}
              field="backgroundImage"
              imageUrl={data.backgroundImage || undefined}
              alt="Background"
              className="relative flex-1 bg-card/50 aspect-7/3 max-h-40 z-10"
              imageClassName="object-cover object-center brightness-90"
            />

            <SectionTabs data={data} stageObj={stageObj} />
          </ResizablePanel>

          <ResizableHandle />

          {/* Detail Panel */}
          {tabActive !== "" && (
            <ResizablePanel defaultSize={50} minSize={20} className={cn("relative", CARD_CLASS)}>
              <WorkspaceHeader tabActive={tabActive} />
              <TabContent data={data} stageObj={stageObj} />
            </ResizablePanel>
          )}
        </Tabs>
      </ResizablePanelGroup>
    </main>
  )
}

export default Workspace
