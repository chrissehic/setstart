import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkflowWithDetails } from "@/types";
import { CreateWorkflowModal } from "@/app/(dashboard)/workflows/_components/CreateWorkflowModal";
import { SettingsDialog } from "../ui/SettingsDialog";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ThemeModeToggle";
import { useUser } from "@clerk/nextjs";
import { Separator } from "@/components/ui/separator";
// import SetIcon from "@/components/SetIcon";
// import SetStartText from "@/components/SetStartText";

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
  // Check if sections should be disabled (no description)
  const sectionsDisabled =
    !currentWorkflow?.description || currentWorkflow.description.trim() === "";
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useUser();
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
        <SidebarHeader className="w-full px-1">
          <SidebarMenu>
            {/* <SidebarMenuItem className="relative w-full h-12 overflow-hidden flex items-center justify-start px-2 py-1">
              <div className="flex flex-row gap-2 items-center text-foreground/60">
                <SetIcon className="size-7" />
                <SetStartText className="h-3.5" />
              </div>
            </SidebarMenuItem> */}
            <SidebarMenuItem className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={currentWorkflow.logoImage || ""} />
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                        {currentWorkflow.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {currentWorkflow.name}
                      </span>
                    </div>
                    <ChevronsUpDown className="size-3" />
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
                  {allWorkflows.map((workflow) => (
                    <DropdownMenuItem
                      key={workflow.id}
                      onClick={() => handleProjectChange(workflow)}
                      className="gap-2 p-2"
                    >
                      <Avatar className="size-8">
                        <AvatarImage src={workflow.logoImage || ""} />
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                          {workflow.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium">{workflow.name}</span>
                      </div>
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
                    <div className="text-muted-foreground font-medium">
                      Add project
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <Separator className="" />
      <CreateWorkflowModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <SidebarContent className="w-full">
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="mb-2">Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="w-full">
                  <SidebarMenuButton
                    asChild
                    isActive={item.value === active}
                    onClick={() => !sectionsDisabled && onTabChange(item.value)}
                    className={`w-full ${
                      sectionsDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={sectionsDisabled}
                  >
                    <a
                      href={`#${item.value}`}
                      className={`text-sm ${
                        sectionsDisabled ? "pointer-events-none" : ""
                      }`}
                    >
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
      <SidebarFooter className="flex flex-col gap-2 p-1">
        <SidebarMenu className="flex flex-col gap-2">
          {/* Settings button */}
          {currentWorkflow && (
            <>
              <SidebarMenuItem>
                <SettingsDialog currentWorkflow={currentWorkflow} />
              </SidebarMenuItem>
              <Separator />
            </>
          )}

          {/* Mode toggle */}
          <SidebarMenuItem>
            <ModeToggle />
          </SidebarMenuItem>

          {/* Authenticated user */}
          <SignedIn>
            <SidebarMenuItem>
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.imageUrl || ""}
                        alt={user?.fullName || ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.fullName?.[0] || "CN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user?.fullName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.emailAddresses[0].emailAddress}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user?.imageUrl || ""}
                          alt={user?.fullName || ""}
                        />
                        <AvatarFallback className="rounded-lg">
                          {user?.fullName?.[0] || "CN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user?.fullName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user?.emailAddresses[0].emailAddress}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <SignOutButton>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-0 text-left"
                      >
                        <LogOut className="mr-2 size-4" />
                        Log out
                      </Button>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SignedIn>

          {/* Unauthenticated user */}
          <SignedOut>
            <SidebarMenuItem>
              <SignInButton>
                <Button className="w-full">Log In</Button>
              </SignInButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SignUpButton>
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </SignUpButton>
            </SidebarMenuItem>
          </SignedOut>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

export default Sidebar;
