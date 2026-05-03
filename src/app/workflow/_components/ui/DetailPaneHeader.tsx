import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SaveStatusProps {
  saving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

function SaveStatus({ saving, lastSaved, hasUnsavedChanges }: SaveStatusProps) {
  // Determine which state to show
  let statusContent: React.ReactNode = null;
  let statusKey = "";
  
  if (saving) {
    statusKey = "saving";
    statusContent = (
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="animate-spin inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full"></span>
        <span>Saving...</span>
      </span>
    );
  } else if (hasUnsavedChanges) {
    statusKey = "unsaved";
    statusContent = (
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
        <span>Unsaved changes</span>
      </span>
    );
  } else if (lastSaved) {
    statusKey = `saved-${lastSaved.getTime()}`;
    // Show last saved with primary checkmark (even if just opened, no changes made)
    statusContent = (
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Check className="w-3 h-3 text-primary" />
        <span>
          Last saved {lastSaved.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{" "}
          {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </span>
    );
  }

  if (!statusContent) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 justify-center">
      <div 
        key={statusKey}
        className="transition-opacity duration-300 ease-in-out"
      >
        {statusContent}
      </div>
    </div>
  );
}

interface DetailPaneHeaderProps {
  onBack?: () => void;
  saving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  menuContent?: React.ReactNode;
}

export function DetailPaneHeader({
  onBack,
  saving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
  menuContent,
}: DetailPaneHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-card backdrop-blur-sm py-3 w-full">
      <div className="flex items-center w-full">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Save status indicator - centered */}
        <div className="flex-1 flex justify-center">
          <SaveStatus
            saving={saving}
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
        
        {menuContent && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menuContent}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

