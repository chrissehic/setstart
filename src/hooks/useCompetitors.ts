"use client";

import { useState, useEffect } from "react";
import { type Competitor } from "@/types/workflow";

interface UseCompetitorsReturn {
  competitors: Competitor[];
  isLoading: boolean;
  error: string | null;
  addCompetitor: (competitor: Omit<Competitor, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateCompetitor: (id: string, updates: Partial<Competitor>) => Promise<void>;
  deleteCompetitor: (id: string) => Promise<void>;
  refreshCompetitors: () => Promise<void>;
}

export function useCompetitors(workflowId: string): UseCompetitorsReturn {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/competitors?workflowId=${workflowId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch competitors");
      }
      
      const data = await response.json();
      
      // Parse JSON strings back to arrays
      const parsedCompetitors = data.map((competitor: any) => ({
        ...competitor,
        strengths: competitor.strengths ? JSON.parse(competitor.strengths) : null,
        weaknesses: competitor.weaknesses ? JSON.parse(competitor.weaknesses) : null,
        features: competitor.features ? JSON.parse(competitor.features) : null,
      }));
      
      setCompetitors(parsedCompetitors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const addCompetitor = async (competitor: Omit<Competitor, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...competitor,
          workflowId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add competitor");
      }

      await fetchCompetitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add competitor");
      throw err;
    }
  };

  const updateCompetitor = async (id: string, updates: Partial<Competitor>) => {
    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update competitor");
      }

      await fetchCompetitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update competitor");
      throw err;
    }
  };

  const deleteCompetitor = async (id: string) => {
    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete competitor");
      }

      await fetchCompetitors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete competitor");
      throw err;
    }
  };

  const refreshCompetitors = async () => {
    await fetchCompetitors();
  };

  useEffect(() => {
    if (workflowId) {
      fetchCompetitors();
    }
  }, [workflowId]);

  return {
    competitors,
    isLoading,
    error,
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,
    refreshCompetitors,
  };
}
