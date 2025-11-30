import React, { useState } from "react";
// Document type from Prisma
type Document = {
  id: string;
  workflowId: string;
  name: string;
  fileUrl?: string | null;
  fileType?: string | null;
  sizeBytes?: number | null;
  status: string;
  metadata?: string | null;
  convertedUrl?: string | null;
  content?: string | null;
  isEditable: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteDocument, useUpdateDocument } from "@/hooks/useDocuments";
import { useDocumentEditing } from "@/hooks/useDocumentEditing";
import EditableTitle from "../sections/EditableTitle";
import TiptapEditor from "../sections/TiptapEditor";
import { DetailPaneHeader } from "../ui/DetailPaneHeader";

interface DocumentDetailPaneProps {
  document: Document;
  onBack?: () => void;
}

const DocumentDetailPane: React.FC<DocumentDetailPaneProps> = ({
  document,
  onBack,
}) => {
  const {
    state,
    startEditingTitle,
    stopEditingTitle,
    setTitle,
    startEditingContent,
    setContent,
  } = useDocumentEditing(document.name, document.content || "");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    document.updatedAt ? new Date(document.updatedAt) : null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const updateDocumentMutation = useUpdateDocument();
  const deleteDocumentMutation = useDeleteDocument();

  const handleDeleteDocument = () => {
    deleteDocumentMutation.mutate({ documentId: document.id, workflowId: document.workflowId });
    setShowDeleteDialog(false);
    if (onBack) {
      onBack();
    }
  };

  // Save/cancel handlers for title
  const saveTitle = () => {
    stopEditingTitle();
    if (state.title.trim() && state.title !== document.name) {
      updateDocumentMutation.mutate({
        documentId: document.id,
        workflowId: document.workflowId,
        name: state.title.trim(),
      });
    }
  };

  const cancelTitle = () => {
    setTitle(document.name);
    stopEditingTitle();
  };

  // Save handler for content
  const saveContent = (content: string) => {
    updateDocumentMutation.mutate({
      documentId: document.id,
      workflowId: document.workflowId,
      content,
    });
  };

  return (
    <div
      className={cn(
        "w-full mx-auto flex flex-col gap-6 h-full",
        "transition-all duration-150"
      )}
    >
      {/* Header with back button, save status, and edit/delete buttons */}
      <DetailPaneHeader
        onBack={onBack}
        saving={saving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        menuContent={
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{document.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <EditableTitle
          title={state.title}
          editing={state.editingTitle}
          onChange={setTitle}
          onStartEdit={startEditingTitle}
          onCancel={cancelTitle}
          onSave={saveTitle}
        />
      </div>
      
      {/* Content (Tiptap) */}
      <div className="flex flex-col gap-2 h-full flex-1 min-h-0">
        <TiptapEditor
          content={state.content}
          onUpdate={setContent}
          isEditing={state.editingContent}
          onStartEdit={startEditingContent}
          onSave={saveContent}
          onSaveStateChange={(savingState, savedState, lastSavedState, hasUnsavedChangesState) => {
            setSaving(savingState);
            if (lastSavedState) {
              setLastSaved(lastSavedState);
            }
            setHasUnsavedChanges(hasUnsavedChangesState);
          }}
        />
      </div>
    </div>
  );
};

export default DocumentDetailPane;

