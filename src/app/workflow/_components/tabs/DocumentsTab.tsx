"use client";

import { DocumentsPreview } from "../ui/DocumentsPreview";

interface DocumentsTabProps {
  workflowId: string;
}

export function DocumentsTab({ workflowId }: DocumentsTabProps) {
  return <DocumentsPreview workflowId={workflowId} />;
}
