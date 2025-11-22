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
import { ChevronsUpDown, LayoutTemplate, LogOut, Plus, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { WorkflowWithDetails } from "@/types";
import { CreateWorkflowModal } from "@/app/(dashboard)/workflows/_components/CreateWorkflowModal";
import { SettingsDialog } from "../ui/SettingsDialog";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useCallback, useMemo, memo } from "react";
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
import SetIcon from "@/components/SetIcon";
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

const Sidebar = memo(function Sidebar({
  active,
  onTabChange,
  items,
  allWorkflows,
  currentWorkflow,
  currentMode,
  onModeChange,
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
  currentMode?: 'previewPanel' | 'assistant';
  onModeChange?: (mode: 'previewPanel' | 'assistant') => void;
}) {
  // Check if sections should be disabled (no description)
  const sectionsDisabled =
    !currentWorkflow?.description || currentWorkflow.description.trim() === "";
  const isMobile = useIsMobile();
  const { isCollapsed, sidebarRef } = useSidebarWidth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Memoize user data to prevent unnecessary re-renders and reloads
  const userDisplayName = useMemo(() => {
    if (!user) return "User";
    return user.fullName || user.firstName || "User";
  }, [user]);
  
  const userEmail = useMemo(() => {
    if (!user?.emailAddresses?.[0]) return 'No email';
    return user.emailAddresses[0].emailAddress;
  }, [user]);
  
  const userInitial = useMemo(() => {
    if (!user) return "U";
    return user.fullName?.[0] || user.firstName?.[0] || "U";
  }, [user]);

  // Use the currentMode from props, fallback to "previewPanel" if not provided
  const switchMode = currentMode || "previewPanel";

  const handleProjectChange = useCallback(
    (workflow: WorkflowWithTasks) => {
      router.push(`/project/${workflow.id}`);
    },
    [router]
  );

  const handleCreateProject = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleModeToggle = useCallback(() => {
    const newMode = switchMode === "previewPanel" ? "assistant" : "previewPanel";
    onModeChange?.(newMode);
  }, [switchMode, onModeChange]);

  const buttonText = useMemo(() => {
    return switchMode === "previewPanel" ? "Ask assistant" : "Dashboard  ";
  }, [switchMode]);
  return (
    <div ref={sidebarRef} className="h-full justify-between flex flex-col w-full">
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
                    tooltip={isCollapsed ? currentWorkflow.name : undefined}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={currentWorkflow.logoImage || ""} />
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                        {currentWorkflow.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {currentWorkflow.name}
                        </span>
                      </div>
                    )}
                    {!isCollapsed && <ChevronsUpDown className="size-3" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md"
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
                    <div className="flex size-6 items-center justify-center rounded border bg-transparent">
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
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  variant="outline"
                  onClick={handleModeToggle}
                  tooltip={isCollapsed ? buttonText : undefined}
                  disabled={sectionsDisabled}
                  className="text-center items-center !bg-primary/30 hover:!bg-primary/50 rounded-sm"
                >
                  {switchMode === "previewPanel" ? (
                    <SetIcon
                      className="!size-6 shrink-0 block brightness-250"
                      fill="var(--primary)"
                      animated={true}
                    />
                  ) : (
                    <LayoutTemplate className="text-primary-foreground/60 !h-6 !w-5 stroke-[1.5px]"/>
                  )}
                  {!isCollapsed && (
                    <span className="text-[15px] text-primary-foreground">{buttonText}</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="px-1">
          {!isCollapsed && <SidebarGroupLabel className="mb-2">Sections</SidebarGroupLabel>}
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
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <a
                      href={`#${item.value}`}
                      className={`text-sm ${
                        sectionsDisabled ? "pointer-events-none" : ""
                      }`}
                    >
                      {item.icon && <item.icon className="size-4! text-xs" />}
                      {!isCollapsed && <span>{item.title}</span>}
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
                <SettingsDialog currentWorkflow={currentWorkflow} isCollapsed={isCollapsed} />
              </SidebarMenuItem>
              {!isCollapsed && <Separator />}
            </>
          )}

          {/* Mode toggle */}
          <SidebarMenuItem>
            <ModeToggle isCollapsed={isCollapsed} />
          </SidebarMenuItem>

          {/* Authenticated user - only show when Clerk is loaded */}
          {isUserLoaded && (
            <>
              <SignedIn>
                <SidebarMenuItem>
                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        tooltip={isCollapsed ? userDisplayName : undefined}
                      >
                        <Avatar className="h-8 w-8 rounded-md shrink-0">
                          <AvatarImage
                            src={user?.imageUrl || ""}
                            alt={userDisplayName}
                          />
                          <AvatarFallback className="rounded-md">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                            <span className="truncate font-medium">
                              {userDisplayName}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {userEmail}
                            </span>
                          </div>
                        )}
                        {!isCollapsed && <ChevronsUpDown className="ml-auto size-4 shrink-0" />}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="min-w-56 rounded-md"
                      side={isMobile ? "bottom" : "right"}
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar className="h-8 w-8 rounded-md shrink-0">
                            <AvatarImage
                              src={user?.imageUrl || ""}
                              alt={userDisplayName}
                            />
                            <AvatarFallback className="rounded-md">
                              {userInitial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                            <span className="truncate font-medium">
                              {userDisplayName}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {userEmail}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        asChild
                        className="w-full flex justify-start"
                      >
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
            </>
          )}

          {/* Loading state - show placeholder while Clerk loads */}
          {!isUserLoaded && (
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                disabled
                className="cursor-default opacity-50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                tooltip={isCollapsed ? "Loading..." : undefined}
              >
                <Avatar className="h-8 w-8 rounded-md shrink-0">
                  <AvatarFallback className="rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium text-muted-foreground">
                      Loading...
                    </span>
                    <span className="truncate text-xs text-muted-foreground/50">
                      &nbsp;
                    </span>
                  </div>
                )}
                {!isCollapsed && <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-30" />}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
});

export default Sidebar;
