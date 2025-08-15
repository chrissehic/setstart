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
   * Maximum number of tags to display
   * @default undefined (show all tags)
   */
  maxTags?: number;
  
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
  maxTags,
  className = "" 
}: TagsListProps) {

  if (tags.length === 0) {
    return null;
  }

  // Limit tags if maxTags is specified
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hasMoreTags = maxTags && tags.length > maxTags;

  return (
    <div className={`flex py-2 flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag) => (
        <Badge
          key={tag.id}
          className="text-sm font-normal capitalize border-input"
          variant={"secondary"}
        >
          {tag.name}
        </Badge>
      ))}
      {hasMoreTags && (
        <Badge
          className="text-xs font-normal border-input bg-muted text-muted-foreground"
          variant={"secondary"}
        >
          +{tags.length - maxTags} more
        </Badge>
      )}
    </div>
  );
});

export default TagsList;
