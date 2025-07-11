"use client";

import React from "react";
import { WorkflowStatus, WorkflowWithDetails } from "@/types";
import Workspace from "./Workspace";
import MenuBar from "./Header";
import AIInputForm from "@/components/SearchInput";

function Editor({ workflow }: { workflow: WorkflowWithDetails }) {
  // Transform workflow data to match WorkflowData interface

  return (
    <div className="h-full w-full flex flex-col">
      <MenuBar workflow={workflow}/>
      <Workspace id={`workspace-${workflow.id}`} data={{...workflow, stage: "Existence", status: WorkflowStatus.BLUEPRINT}} />
      <AIInputForm workflowId={workflow.id}/>
    </div>
  );
}

export default Editor;
