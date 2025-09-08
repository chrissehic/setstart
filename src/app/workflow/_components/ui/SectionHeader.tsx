import { Button } from "@/components/ui/button";
import { WORKSPACE_ITEMS } from "@/lib/constants";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

interface SectionHeaderProps {
  tabActive: string;
  fullScreen: boolean;
  handleFullScreen: () => void;
}

export const SectionHeader = ({
  tabActive,
  fullScreen,
  handleFullScreen,
}: SectionHeaderProps) => {
  // Find the corresponding title for the active tab
  const activeItem = WORKSPACE_ITEMS.find((item) => item.value === tabActive);
  const displayTitle = activeItem ? activeItem.title : tabActive;

  return (
    <header className="w-full sticky top-0 p-2 flex flex-row justify-between items-center z-30 backdrop-blur-md border-b border-accent">
      <div className="flex-1 justify-start items-start">
        {" "}
        <Button
          variant="secondary"
          size="icon"
          className="p-0"
          onClick={handleFullScreen}
        >
          {fullScreen ? (
            <PanelRightClose className="size-5" />
          ) : (
            <PanelRightOpen className="size-5" />
          )}
        </Button>
      </div>
      <div className="flex-1 text-center justify-center items-center">
        <h4 className="scroll-m-20 text-sm font-medium">{displayTitle}</h4>
      </div>
      <div className="flex-1 flex justify-end items-end"></div>
    </header>
  );
};
