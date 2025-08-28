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
      products: true,
      people: {
        include: {
          person: true,
        },
      },
      socialLinks: true,
      competitors: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get the specific workflow/project
  const currentWorkflow = allWorkflows.find(w => w.id === projectId);

  if (!currentWorkflow) {
    // If project not found and no projects exist, redirect to onboarding
    if (allWorkflows.length === 0) {
      redirect("/");
    } else {
      // If project not found but other projects exist, redirect to first available project
      redirect(`/project/${allWorkflows[0].id}`);
    }
  }

  return (
    <SidebarProvider>
      <Editor workflow={currentWorkflow} allWorkflows={allWorkflows} />
    </SidebarProvider>
  );
}
