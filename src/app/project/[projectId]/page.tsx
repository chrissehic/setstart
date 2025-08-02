import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import Editor from "../../workflow/_components/core/Editor";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get all workflows for the user (for project switching)
  const allWorkflows = await prisma.workflow.findMany({
    where: {
      userId,
    },
    include: {
      tags: true,
      objectives: {
        include: {
          tasks: true,
        },
      },
      tasks: true,
      people: {
        include: {
          person: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get the specific workflow/project
  const currentWorkflow = allWorkflows.find(w => w.id === projectId);

  if (!currentWorkflow) {
    // If project not found, redirect to first available project or show error
    if (allWorkflows.length > 0) {
      redirect(`/project/${allWorkflows[0].id}`);
    } else {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Projects Found</h1>
            <p className="text-muted-foreground">Create your first project to get started.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <SidebarProvider>
      <Editor workflow={currentWorkflow} allWorkflows={allWorkflows} />
    </SidebarProvider>
  );
}
