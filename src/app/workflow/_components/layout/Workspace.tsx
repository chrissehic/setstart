"use client";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
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
import { CARD_CLASS, WORKSPACE_ITEMS } from "@/lib/constants";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SectionTabs } from "./SectionTabs";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { TabContent } from "./TabContent";
import { AssistantPane } from "../ui/AssistantPane";

/** Below this width, use stacked layout (no horizontal % panels). Slightly above Tailwind `xl` so 1280–1399px stays comfortable. */
const STACK_BREAKPOINT_PX = 1400;

/** react-resizable-panels only supports %; preview column only (sidebar is outside the group). */
const LEFT_PANEL_MIN_PX = 340;
const LEFT_PANEL_TARGET_PX = 420;

function computeHorizontalLeftPercents(groupWidthPx: number) {
  const w = Math.max(groupWidthPx, 360);
  const minSize = Math.min(
    58,
    Math.max(18, Math.ceil((LEFT_PANEL_MIN_PX / w) * 100))
  );
  const target = Math.round((LEFT_PANEL_TARGET_PX / w) * 100);
  const defaultSize = Math.min(
    50,
    Math.max(minSize + 2, Math.min(target, minSize + 16))
  );
  const maxSize = Math.min(
    54,
    Math.max(minSize + 4, Math.min(defaultSize + 8, minSize + 20))
  );
  const rightMin = Math.max(34, 100 - maxSize - 1);
  const rightDefault = Math.max(rightMin, 100 - defaultSize);
  return {
    leftMin: minSize,
    leftMax: maxSize,
    leftDefault: Math.min(maxSize - 1, Math.max(minSize + 1, defaultSize)),
    rightMin,
    rightDefault: Math.min(100 - minSize, rightDefault),
  };
}

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
  const [fullScreen, setFullScreen] = useState(false);
  const [currentMode, setCurrentMode] = useState<"previewPanel" | "assistant">(
    "previewPanel"
  );
  // Fixed defaults for SSR + first client paint so hydration matches (no `window` in useState).
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const panelGroupContainerRef = useRef<HTMLDivElement>(null);
  const [groupWidth, setGroupWidth] = useState(1440);

  const handleModeChange = useCallback(
    (mode: "previewPanel" | "assistant") => {
      if (fullScreen) {
        setFullScreen(false);
      }
      setCurrentMode(mode);
    },
    [fullScreen]
  );

  const checkScreenSize = useCallback(() => {
    setIsSmallScreen(window.innerWidth < STACK_BREAKPOINT_PX);
  }, []);

  useLayoutEffect(() => {
    checkScreenSize();
  }, [checkScreenSize]);

  useEffect(() => {
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [checkScreenSize]);

  useLayoutEffect(() => {
    if (isSmallScreen) return;
    const el = panelGroupContainerRef.current;
    if (!el) return;
    const measure = () => {
      setGroupWidth(Math.max(el.getBoundingClientRect().width, 320));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isSmallScreen]);

  useEffect(() => {
    if (isSmallScreen && fullScreen) {
      setFullScreen(false);
    }
  }, [isSmallScreen, fullScreen]);

  const stageObj = useMemo(
    () =>
      COMPANY_STAGES?.find((s) => s?.key === data.stage) ?? COMPANY_STAGES[0],
    [data.stage]
  );

  const horizontalPercents = useMemo(
    () => computeHorizontalLeftPercents(groupWidth),
    [groupWidth]
  );

  const previewAssistantBlock = (
    <div className="relative min-h-0 flex-1 w-full min-w-0">
      <div
        className={cn(
          "h-full w-full transition-all duration-300 ease-out overflow-y-auto scrollbar-thin",
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

      <div
        className={cn(
          "h-full w-full transition-all duration-300 ease-out",
          currentMode === "assistant"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
        )}
      >
        <AssistantPane data={data} currentSection={tabActive} />
      </div>
    </div>
  );

  const workflowSidebar = (
    <Sidebar
      active={tabActive}
      onTabChange={handleTabChange}
      items={WORKSPACE_ITEMS}
      allWorkflows={allWorkflows}
      currentWorkflow={currentWorkflow}
      currentMode={currentMode}
      onModeChange={handleModeChange}
    />
  );

  const detailBlock = (
    <Tabs
      value={tabActive}
      onValueChange={handleTabChange}
      defaultValue=""
      className="flex h-full w-full min-h-0 flex-col"
    >
      <SectionHeader
        isSmallScreen={isSmallScreen}
        tabActive={tabActive}
        fullScreen={fullScreen}
        handleFullScreen={() => setFullScreen(!fullScreen)}
      />
      <TabContent data={data} stageObj={stageObj} />
    </Tabs>
  );

  const shellClass = "flex h-full min-h-0 w-full !min-h-0";

  if (fullScreen && !isSmallScreen) {
    return (
      <SidebarProvider className={shellClass}>
        {workflowSidebar}
        <SidebarInset className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
          <div
            className={cn(
              "relative flex h-full min-h-0 w-full flex-col overflow-hidden",
              CARD_CLASS
            )}
          >
            {detailBlock}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (isSmallScreen) {
    return (
      <SidebarProvider className={shellClass}>
        {workflowSidebar}
        <SidebarInset className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
          <div className="flex shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1 shrink-0" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            <div
              className={cn(
                "flex min-h-0 flex-[1.2] basis-0 flex-col overflow-hidden rounded-md border border-border",
                CARD_CLASS
              )}
            >
              <Tabs
                value={tabActive}
                onValueChange={handleTabChange}
                defaultValue=""
                className="flex min-h-0 min-w-0 flex-1 flex-col"
              >
                {previewAssistantBlock}
              </Tabs>
            </div>
            <div
              className={cn(
                "flex min-h-0 flex-1 basis-0 flex-col overflow-hidden",
                CARD_CLASS
              )}
            >
              {detailBlock}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider className={shellClass}>
      {workflowSidebar}
      <SidebarInset className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
        <div
          ref={panelGroupContainerRef}
          className="h-full min-h-0 min-w-0 flex-1 overflow-hidden"
        >
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full w-full gap-2"
          >
            <ResizablePanel
              id="workspace-left"
              order={1}
              defaultSize={horizontalPercents.leftDefault}
              minSize={horizontalPercents.leftMin}
              maxSize={horizontalPercents.leftMax}
              className={cn(
                "relative flex min-h-0 min-w-0 transition-all duration-300 ease-out",
                "animate-in fade-in slide-in-from-left-2",
                CARD_CLASS
              )}
              data-testid={`workspace-${id}`}
            >
              <Tabs
                value={tabActive}
                onValueChange={handleTabChange}
                defaultValue=""
                className="flex h-full min-h-0 min-w-0 w-full flex-col"
              >
                {previewAssistantBlock}
              </Tabs>
            </ResizablePanel>

            <ResizableHandle className="transition-opacity duration-300 ease-out" />

            <ResizablePanel
              id="workspace-right"
              order={2}
              defaultSize={horizontalPercents.rightDefault}
              minSize={horizontalPercents.rightMin}
              className={cn(
                "relative flex min-h-0 min-w-0 flex-col overflow-hidden transition-all duration-300 ease-out scrollbar-thin",
                "animate-in fade-in slide-in-from-right-1",
                CARD_CLASS
              )}
            >
              {detailBlock}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Workspace;
