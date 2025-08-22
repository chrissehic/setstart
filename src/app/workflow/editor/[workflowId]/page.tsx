import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import Editor from "../../_components/core/Editor";

export default async function page({
  params,
}: {
  params: Promise<{ workflowId: string }>; // Ensure params is defined as a Promise type
}) {
  const { workflowId } = await params; // Await here because params is a Promise
  const { userId } = await auth(); // Keep await since auth() is asynchronous

  if (!userId) return <div>unauthenticated</div>;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
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
      competitors: true,
    },
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return <Editor workflow={workflow}></Editor>;
}
