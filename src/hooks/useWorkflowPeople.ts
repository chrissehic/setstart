import { useQuery } from "@tanstack/react-query";
import { Person } from "@/types";

export function useWorkflowPeople(workflowId: string) {
  return useQuery<Person[]>({
    queryKey: ["workflow-people", workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}/people`);
      if (!response.ok) {
        throw new Error("Failed to fetch workflow people");
      }
      return response.json();
    },
    enabled: !!workflowId,
  });
}
