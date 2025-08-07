"use client"

import * as React from "react"
import { Trash2, Settings, Palette, User, Shield, Globe, AlertCircleIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ThemeModeToggle"
import DeleteWorkflowAlert from "@/app/(dashboard)/workflows/_components/DeleteWorkflowAlert"
import { WorkflowWithDetails } from "@/types"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Extended type for workflows that include tasks
type WorkflowWithTasks = WorkflowWithDetails & {
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    [key: string]: unknown;
  }>;
};

interface SettingsDialogProps {
  currentWorkflow?: WorkflowWithTasks;
}

const settingsNav = [
  { name: "Appearance", icon: Palette, id: "appearance" },
  { name: "Account", icon: User, id: "account" },
  { name: "Privacy", icon: Shield, id: "privacy" },
  { name: "Language", icon: Globe, id: "language" },
  { name: "Delete Project", icon: Trash2, id: "delete", destructive: true },
]

export function SettingsDialog({ currentWorkflow }: SettingsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState("appearance")
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)

  const renderSectionContent = () => {
    switch (activeSection) {
      case "appearance":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Customize the appearance of your workspace.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme Mode</label>
              <ModeToggle />
            </div>
          </div>
        )
      case "account":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Account Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and profile.
              </p>
            </div>
            <div className="bg-muted/50 aspect-video max-w-3xl rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">Account settings content</p>
            </div>
          </div>
        )
      case "privacy":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Privacy & Security</h3>
              <p className="text-sm text-muted-foreground">
                Control your privacy settings and security preferences.
              </p>
            </div>
            <div className="bg-muted/50 aspect-video max-w-3xl rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">Privacy settings content</p>
            </div>
          </div>
        )
      case "language":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Language & Region</h3>
              <p className="text-sm text-muted-foreground">
                Set your preferred language and regional settings.
              </p>
            </div>
            <div className="bg-muted/50 aspect-video max-w-3xl rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">Language settings content</p>
            </div>
          </div>
        )
      case "delete":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-destructive">Delete Project</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project and all associated data.
              </p>
            </div>
            {currentWorkflow && (
              <div className="space-y-4">
                <Alert variant="destructive" className="bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircleIcon   className="size-4" />
                  <AlertDescription className="text-sm">
                  This action cannot be undone. This will permanently delete your
                  project and associated data from our servers.
                     <div className="flex justify-end w-full">

                  <DeleteWorkflowAlert
                  workflowName={currentWorkflow.name}
                  workflowId={currentWorkflow.id}
                  open={showDeleteModal}
                  onOpenChange={setShowDeleteModal}
                >
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Project
                  </Button>
                </DeleteWorkflowAlert>
                     </div>
                  </AlertDescription>
             
                </Alert>
               
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton size="default" className="cursor-pointer w-full text-sm">
          <Settings className="size-4" />
          <span>Settings</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[800px] lg:max-w-[900px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your workspace settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsNav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.id === activeSection}
                          className={item.destructive ? "text-sm text-destructive hover:text-destructive" : "text-sm"}
                        >
                          <button
                            onClick={() => setActiveSection(item.id)}
                            className="w-full flex items-center gap-2"
                          >
                            <item.icon className="size-4" />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {settingsNav.find(item => item.id === activeSection)?.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {renderSectionContent()}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
} 