import { GetWorkflowsForUser } from "@/actions/workflows/getWorkflowsForUser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SquareAsterisk } from "lucide-react";
import React, { Suspense } from "react";
import { CreateWorkflowModal } from "./_components/CreateWorkflowModal";
import WorkflowCard from "./_components/WorkflowCard";

export default function Workflows() {
  return (
    <div className="flex flex-1 flex-col h-full gap-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col">
          <h1 className="scroll-m-20 text-4xl font-medium tracking-tight text-balance">
            Projects
          </h1>
          <p className="mt-3">
            Create and manage structure flows for your next projects
          </p>
        </div>
        <CreateWorkflowModal />
      </div>
      <div className="h-full">
        <Suspense fallback={<UserWorkflowSkeleton />}>
          <UserWorkflow />
        </Suspense>
      </div>
    </div>
  );
}

function UserWorkflowSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 bg-accent" />
      ))}
    </div>
  );
}

async function UserWorkflow() {
  const workflows = await GetWorkflowsForUser();
  if (!workflows) {
    return (
      <Alert variant={"destructive"}>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong, please try again later...
        </AlertDescription>
      </Alert>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <div className="rounded-full bg-primary/10 flex items-center justify-center p-4">
          <SquareAsterisk className="size-20 text-primary"></SquareAsterisk>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">
            No projects created yet
          </h3>
          <p className="leading-7 text-muted-foreground">
            Start a new project and manage it here
          </p>
        </div>
        <CreateWorkflowModal triggerLabel="Create your first project" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  );
}
