"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Tabs } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { EditableImage } from "../ui/EditableImage";
import Sidebar from "../layout/SidebarMenu";
import type { WorkflowData, WorkflowWithDetails } from "@/types/workflow";
import { COMPANY_STAGES } from "@/types/companyStages";
import { SectionHeader } from "../ui/SectionHeader";
import { CARD_CLASS, SECTION_CLASS, WORKSPACE_ITEMS } from "@/lib/constants";
import { SectionTabs } from "./SectionTabs";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { TabContent } from "./TabContent";
import { AssistantPane } from "../ui/AssistantPane";
// import ProjectChatButton from "../ui/ProjectChatButton";
// import { useOnboarding } from "@/hooks/useOnboarding";

interface WorkspaceProps {
  id: string;
  data: WorkflowData;
  allWorkflows?: WorkflowWithDetails[];
  currentWorkflow?: WorkflowWithDetails;
}

const Workspace = ({
  id,
  data,
  allWorkflows,
  currentWorkflow,
}: WorkspaceProps) => {
  const { tabActive, handleTabChange } = useWorkspaceNavigation();
  // const { shouldShowOverlay } = useOnboarding(data);
  const [fullScreen, setFullScreen] = useState(false);
  const [currentMode, setCurrentMode] = useState<"previewPanel" | "assistant">(
    "previewPanel"
  );
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const handleModeChange = useCallback(
    (mode: "previewPanel" | "assistant") => {
      // If we're in fullscreen mode, exit it and switch to the new mode
      if (fullScreen) {
        setFullScreen(false);
      }
      // Always update the mode (don't check if mode === currentMode)
      // This allows toggling between preview and assistant
      setCurrentMode(mode);
    },
    [fullScreen]
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Memoize stageObj calculation to prevent unnecessary recalculations
  const stageObj = useMemo(
    () =>
      COMPANY_STAGES?.find((s) => s?.key === data.stage) ?? COMPANY_STAGES[0],
    [data.stage]
  );

  return (
    <main className={cn("grid gap-2 h-full w-full overflow-hidden p-2")}>
      <ResizablePanelGroup
        key={`${fullScreen}-${isSmallScreen}`}
        direction="horizontal"
        className="h-full w-full gap-2"
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          defaultSize={20}
          minSize={20}
          maxSize={isSmallScreen ? 30 : 15}
          className={cn(CARD_CLASS, "overflow-auto!")}
        >
          <div className={SECTION_CLASS}>
            <Sidebar
              active={tabActive}
              onTabChange={handleTabChange}
              items={WORKSPACE_ITEMS}
              allWorkflows={allWorkflows}
              currentWorkflow={currentWorkflow}
              currentMode={currentMode}
              onModeChange={handleModeChange}
            />
          </div>
        </ResizablePanel>

        {/* Main Content Panel - hidden on small screens */}
        {!fullScreen && !isSmallScreen && (
          <>
            <ResizableHandle />
            <ResizablePanel
              defaultSize={30}
              minSize={30}
              maxSize={40}
              className={cn("relative", CARD_CLASS)}
              data-testid={`workspace-${id}`}
            >
              <Tabs
                value={tabActive}
                onValueChange={handleTabChange}
                defaultValue=""
                className="w-full h-full"
              >
                <div className="h-full w-full relative">
                  {/* Preview Panel - always rendered but conditionally visible */}
                  <div
                    className={cn(
                      "h-full w-full transition-all duration-300 ease-out overflow-y-auto",
                      currentMode === "previewPanel"
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    )}
                  >
                    <EditableImage
                      workflowId={data.id}
                      field="backgroundImage"
                      imageUrl={data.backgroundImage || undefined}
                      alt="Background"
                      className="relative flex-1 bg-accent/40 aspect-7/3 w-full max-h-40 z-0 border-b border-accent"
                      imageClassName="object-cover object-center brightness-90"
                    />
                    <SectionTabs data={data} />
                  </div>

                  {/* Assistant Panel - always rendered but conditionally visible */}
                  <div
                    className={cn(
                      "h-full w-full transition-all duration-300 ease-out",
                      currentMode === "assistant"
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                    )}
                  >
                    <AssistantPane data={data} />
                  </div>
                </div>
              </Tabs>
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Handle for small screens or fullScreen - only between sidebar and detail */}
        {(fullScreen || isSmallScreen) && <ResizableHandle />}

        {/* Detail Panel */}
        {tabActive !== "" && (
          <ResizablePanel
            defaultSize={isSmallScreen ? 75 : 50}
            minSize={isSmallScreen ? 50 : 20}
            className={cn("relative", CARD_CLASS)}
          >
            <Tabs
              value={tabActive}
              onValueChange={handleTabChange}
              defaultValue=""
              className="w-full h-full"
            >
              <SectionHeader
                isSmallScreen={isSmallScreen}
                tabActive={tabActive}
                fullScreen={fullScreen}
                handleFullScreen={() => setFullScreen(!fullScreen)}
              />
              <TabContent data={data} stageObj={stageObj} />
            </Tabs>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      {/* Project Chat Button */}
      {/* <ProjectChatButton
        onSubmit={(message) => {
          console.log("Project chat message:", message);
          // TODO: Implement project chat functionality
        }}
        placeholder="Ask about your project..."
        onboardingState={{ shouldShowOverlay }}
      /> */}
    </main>
  );
};

export default Workspace;
