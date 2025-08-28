import { useQuery } from "@tanstack/react-query";
import { getWorkflow } from "@/actions/workflows/getWorkflow";

export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => getWorkflow(workflowId),
    staleTime: 1000 * 60 * 2, // Reduced to 2 minutes for more responsive updates
    refetchOnWindowFocus: true, // Enable refetch on window focus to catch updates
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting to network
  });
}
