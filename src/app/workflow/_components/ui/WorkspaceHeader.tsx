import { WORKSPACE_ITEMS } from "@/lib/constants";

interface WorkspaceHeaderProps {
  tabActive: string;
}

export const WorkspaceHeader = ({ tabActive }: WorkspaceHeaderProps) => {
  // Find the corresponding title for the active tab
  const activeItem = WORKSPACE_ITEMS.find(item => item.value === tabActive);
  const displayTitle = activeItem ? activeItem.title : tabActive;

  return (
    <header className="w-full sticky top-0 p-4 flex flex-row justify-between items-center z-30 backdrop-blur-md border-b border-accent">
      <div className="flex-1"></div>
      <div className="flex-1 text-center justify-center items-center">
        <h4 className="scroll-m-20 text-sm font-medium">{displayTitle}</h4>
      </div>
      <div className="flex-1"></div>
    </header>
  );
};
