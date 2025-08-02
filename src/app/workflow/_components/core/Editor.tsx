"use client";

import React from "react";
import { WorkflowStatus, WorkflowWithDetails } from "@/types";
import Workspace from "../layout/Workspace";
// import AIInputForm from "@/components/SearchInput";

function Editor({ 
  workflow, 
  allWorkflows 
}: { 
  workflow: WorkflowWithDetails;
  allWorkflows?: WorkflowWithDetails[];
}) {
  // Transform workflow data to match WorkflowData interface

  return (
    <div className="w-full flex flex-col h-screen">
      {/* <MenuBar workflow={workflow}/> */}
      <Workspace 
        id={`workspace-${workflow.id}`} 
        data={{...workflow, status: WorkflowStatus.BLUEPRINT}} 
        allWorkflows={allWorkflows}
        currentWorkflow={workflow}
      />
      {/* <AIInputForm workflowId={workflow.id}/> */}
    </div>
  );
}

export default Editor;
