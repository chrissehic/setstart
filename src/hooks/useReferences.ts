"use client";

import { useQuery } from "@tanstack/react-query";
import { getReferences } from "@/actions/references/getReferences";
import { Reference } from "@/types/workflow";

export function useReferences(workflowId: string) {
  return useQuery({
    queryKey: ["references", workflowId],
    queryFn: async () => {
      const result = await getReferences(workflowId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.references as Reference[];
    },
  });
}
