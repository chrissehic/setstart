import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers/getInitials";
import { Person } from "@/types";

interface AssignedPeopleBadgeProps {
  people: Person[];
}

const AssignedPeopleBadge: React.FC<AssignedPeopleBadgeProps> = ({
  people,
}) => {
  if (people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No one assigned yet.
      </p>
    );
  }

  return (
    <Badge className="flex py-0.5 pl-0.5 pr-3 gap-0.5 bg-accent items-center space-x-1 rounded-full">
      <div className="flex -space-x-1 flex-row">
        {people.map((person) => (
          <Avatar key={person.id} className="w-6 h-6 rounded-full">
            <AvatarImage
              src={person?.avatarImage}
              alt={person.name}
            />
            <AvatarFallback className="bg-input text-accent-foreground border-input border rounded-full">
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-xs">
        {people.length > 1
          ? people
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