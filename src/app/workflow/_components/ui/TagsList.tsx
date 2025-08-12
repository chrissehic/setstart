import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/generated/prisma";

export interface TagsListProps {
  /**
   * Array of tags to display
   * @default []
   */
  tags?: Tag[];
  
  /**
   * Additional class name for the container
   */
  className?: string;
}

/**
 * Displays a list of tags as badges
 */
const TagsList = memo(function TagsList({ 
  tags = [], 
  className = "" 
}: TagsListProps) {

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex py-2 flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          className="text-sm font-normal capitalize border-input"
          variant={"secondary"}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
});

export default TagsList;
