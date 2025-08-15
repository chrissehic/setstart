import { useQuery } from "@tanstack/react-query";
import { Person } from "@/types";
import { getWorkflowPeople } from "@/actions/people/getWorkflowPeople";

export function useWorkflowPeople(workflowId: string) {
  return useQuery<Person[]>({
    queryKey: ["workflow-people", workflowId],
    queryFn: () => getWorkflowPeople(workflowId),
    enabled: !!workflowId,
  });
}
