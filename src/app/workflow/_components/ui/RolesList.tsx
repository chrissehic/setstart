import { Fragment, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { AddRoleModal } from "../modals/AddRoleModal";
import { getInitials } from "@/lib/helpers/getInitials";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkflowData } from "@/types/workflow";
import { cn } from "@/lib/utils";

export interface RolesListProps {
  data: WorkflowData;
  readOnly?: boolean;
}

const RolesList = memo(function RolesList({
  data,
  readOnly = false,
}: RolesListProps) {
  return (
    <Fragment>
      {data.people?.map((roleInWorkflow) => (
        <AddRoleModal
          key={roleInWorkflow.personId}
          workflowId={data.id}
          person={{
            ...roleInWorkflow.person,
            role: roleInWorkflow.role,
          }}
          readOnly={readOnly}
        >
          <Badge
            className="relative group/badge text-base min-h-[50px] font-normal gap-2 rounded-2xl py-1 pr-4 hover:bg-accent/80"
            variant={"secondary"}
          >
            <Avatar
              className={cn(
                "bg-sidebar-border rounded-lg transition-all duration-150",
                readOnly ? "" : "group-hover/badge:bg-accent-foreground"
              )}
            >
              <AvatarImage
                className="rounded-lg"
                src={roleInWorkflow.person.avatarImage || undefined}
              />
              <AvatarFallback
                className={cn(
                  " transition-all duration-150",
                  readOnly ? "" : "group-hover/badge:text-accent"
                )}
              >
                {getInitials(roleInWorkflow.person.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center gap-0">
              <span className="text-xs font-medium">{roleInWorkflow.role}</span>
              <span className="leading-tight font-normal text-md text-accent-foreground">
                {roleInWorkflow.person.name}
              </span>
            </div>
          </Badge>
        </AddRoleModal>
      ))}
      {!readOnly && (
        <AddRoleModal workflowId={data.id}>
          <Badge
            className="relative group/badge text-base min-h-[50px] font-normal gap-2 rounded-2xl py-1 pr-4 hover:bg-accent/80 cursor-pointer"
            variant={"secondary"}
          >
            <div className="h-10 w-10 rounded-lg bg-sidebar-border flex items-center justify-center group-hover/badge:bg-accent-foreground transition-all duration-150">
              <Plus className="size-6 group-hover/badge:text-accent transition-all duration-150" />
            </div>
            <div className="flex flex-col justify-center gap-0">
              <span className="text-sm font-normal">Add Role</span>
            </div>
          </Badge>
        </AddRoleModal>
      )}
    </Fragment>
  );
});

export default RolesList;
