"use client";

import React from "react";
import { WorkflowData, WorkflowStatus, WorkflowWithDetails } from "@/types";
import Workspace from "../layout/Workspace";
import { OnboardingOverlay } from "../ui/OnboardingOverlay";

function Editor({ 
  workflow, 
  allWorkflows 
}: { 
  workflow: WorkflowWithDetails;
  allWorkflows?: WorkflowWithDetails[];
}) {
  // Transform workflow data to match WorkflowData interface
  // Transform tasks to ensure assignedPeople structure matches Task interface
  const transformedTasks = workflow.tasks?.map(task => ({
    ...task,
    assignedPeople: (task.assignedPeople || []).map((ap: any) => ({
      person: {
        id: ap.person.id,
        name: ap.person.name,
        avatarImage: ap.person.avatarImage || undefined,
      },
    })),
  })) || [];

  // Transform objectives tasks as well
  const transformedObjectives = workflow.objectives?.map(objective => ({
    ...objective,
    tasks: (objective.tasks || []).map((task: any) => ({
      ...task,
      assignedPeople: (task.assignedPeople || []).map((ap: any) => ({
        person: {
          id: ap.person.id,
          name: ap.person.name,
          avatarImage: ap.person.avatarImage || undefined,
        },
      })),
    })),
  })) || [];

  const workflowData = {
    ...workflow, 
    status: WorkflowStatus.BLUEPRINT,
    tasks: transformedTasks,
    objectives: transformedObjectives,
  };



  return (
    <div className="w-full flex flex-col h-screen relative">
      {/* <MenuBar workflow={workflow}/> */}
      <Workspace 
        id={`workspace-${workflow.id}`} 
        data={workflowData as WorkflowData} 
        allWorkflows={allWorkflows}
        currentWorkflow={workflow}
      />
      
      {/* Conditional Onboarding Overlay */}
      <OnboardingOverlay 
        workflow={workflowData as WorkflowData}
        onDismiss={() => {
          console.log("Onboarding dismissed");
        }}
        onComplete={() => {
          console.log("Onboarding completed");
        }}
      />
      
      {/* Floating Search Bar */}

      
      {/* <AIInputForm workflowId={workflow.id}/> */}
    </div>
  );
}

export default Editor;
