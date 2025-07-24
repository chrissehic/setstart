import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus, Briefcase } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkflowWithDetails } from "@/types";
import { CreateWorkflowModal } from "@/app/(dashboard)/workflows/_components/CreateWorkflowModal";
import { useRouter } from "next/navigation";
import React from "react";

// Extended type for workflows that include tasks
type WorkflowWithTasks = WorkflowWithDetails & {
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    [key: string]: unknown;
  }>;
};

function Sidebar({
  active,
  onTabChange,
  items,
  allWorkflows,
  currentWorkflow,
}: {
  active: string;
  onTabChange: (tab: string) => void;
  items: {
    title: string;
    value: string;
    url: string;
    icon?: React.ElementType;
  }[];
  allWorkflows?: WorkflowWithTasks[];
  currentWorkflow?: WorkflowWithTasks;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const handleProjectChange = (workflow: WorkflowWithTasks) => {
    router.push(`/project/${workflow.id}`);
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };
  return (
    <>
      {/* Project Selection Header */}
      {allWorkflows && currentWorkflow && (
        <SidebarHeader className="border-b pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Briefcase className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{currentWorkflow.name}</span>
                     
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side={isMobile ? "bottom" : "right"}
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Projects
                  </DropdownMenuLabel>
                  {allWorkflows.map((workflow, index) => (
                    <DropdownMenuItem
                      key={workflow.id}
                      onClick={() => handleProjectChange(workflow)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Briefcase className="size-3.5 shrink-0" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{workflow.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {workflow.tasks?.length || 0} tasks
                        </span>
                      </div>
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 p-2"
                    onClick={handleCreateProject}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Plus className="size-4" />
                    </div>
                    <div className="text-muted-foreground font-medium">Add project</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <CreateWorkflowModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      
      <SidebarContent>
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="mb-4">Sections</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.value === active}
                  onClick={() => onTabChange(item.value)}
                >
                  <a href={`#${item.value}`} className="text-sm">
                    {item.icon && <item.icon className="size-4! text-xs" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    </>
  );
}

export default Sidebar;
