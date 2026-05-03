import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers/getInitials";
import { Person } from "@/types";
import { cn } from "@/lib/utils";

interface AssignedPeopleBadgeProps {
  people: Person[];
  variant?: "badge" | "compact";
  maxDisplay?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const AssignedPeopleBadge: React.FC<AssignedPeopleBadgeProps> = ({
  people,
  variant = "badge",
  maxDisplay,
  className,
  onClick,
}) => {
  if (people.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No one assigned yet.</p>
    );
  }

  // Determine max display based on variant if not explicitly provided
  const effectiveMaxDisplay =
    maxDisplay ?? (variant === "compact" ? 3 : undefined);

  // For compact variant, show first 2 if more than max, otherwise show all up to max
  const displayPeople = effectiveMaxDisplay
    ? people.slice(
        0,
        people.length > effectiveMaxDisplay
          ? effectiveMaxDisplay - 1
          : people.length
      )
    : people;

  const remainingCount =
    effectiveMaxDisplay && people.length > effectiveMaxDisplay
      ? people.length - (effectiveMaxDisplay - 1)
      : 0;

  // Avatar group component
  const AvatarGroup = () => (
    <div
      className={cn(
        "flex flex-row text-[10px] leading-0.5",
        variant === "compact" ? "-space-x-1.5" : "-space-x-1"
      )}
    >
      {displayPeople.map((person) => (
        <Avatar key={person.id} className={cn("w-6 h-6 rounded-full")}>
          {person.avatarImage && (
            <AvatarImage src={person.avatarImage} alt={person.name} />
          )}
          <AvatarFallback
            className={cn(
              "border-input border rounded-full",
              "bg-accent text-accent-foreground"
            )}
          >
            {getInitials(person.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <Avatar
          key={"more"}
          className={cn(
            "w-6 h-6 rounded-full",
            variant === "compact" && "relative"
          )}
        >
          <AvatarFallback
            className={cn(
              "border-input border rounded-full bg-accent text-accent-foreground"
            )}
          >
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  if (variant === "compact") {
    return (
      <div className={className} onClick={onClick}>
        <AvatarGroup />
      </div>
    );
  }

  return (
    <Badge className="flex font-normal py-0.5 pl-0.5 pr-3 gap-0.5 bg-accent items-center space-x-1 rounded-full">
      <AvatarGroup />
      <span className="text-xs">
        {people.length > 1
          ? people.length > 3
            ? people
                .slice(0, 2)
                .map((person) =>
                  typeof person?.name === "string"
                    ? person.name.split(" ")[0]
                    : null
                )
                .filter(Boolean)
                .join(", ") + ` + ${people.length - 2}`
            : people
                .map((person) =>
                  typeof person?.name === "string"
                    ? person.name.split(" ")[0]
                    : null
                )
                .filter(Boolean)
                .join(", ")
          : people
              .map((person) => person.name)
              .filter(Boolean)
              .join(", ")}
      </span>
    </Badge>
  );
};

export default AssignedPeopleBadge;
