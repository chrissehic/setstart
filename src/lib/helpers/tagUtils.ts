import { Tag } from "@/generated/prisma";

/**
 * Processes an array of tags by:
 * 1. Removing duplicates (based on id)
 * 2. Sorting alphabetically by name
 */
export function processTags(tags: Tag[] = []): Tag[] {
  // Create a map to deduplicate by id
  const uniqueTags = new Map<string, Tag>();
  
  tags.forEach(tag => {
    if (tag?.id) {
      uniqueTags.set(tag.id, tag);
    }
  });

  // Convert back to array and sort by name
  return Array.from(uniqueTags.values()).sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );
}

/**
 * Type guard to check if an object is a valid Tag
 */
export function isValidTag(tag: unknown): tag is Tag {
  return (
    typeof tag === 'object' &&
    tag !== null &&
    'id' in tag &&
    'name' in tag &&
    typeof (tag as Tag).id === 'string' &&
    typeof (tag as Tag).name === 'string'
  );
}
