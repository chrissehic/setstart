export const getInitials = (name: string): string => {
  if (!name.trim()) return ""; // Handle empty or whitespace-only input

  const parts = name.trim().split(/\s+/); // Split by one or more spaces

  if (parts.length === 1) {
    // If only one name is provided, use its first letter
    return parts[0][0].toUpperCase();
  }

  // Use the first and last parts for initials
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
};