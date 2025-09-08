import { useState } from "react";

interface CompetitorMetadata {
  name: string;
  description: string;
  faviconUrl?: string;
  logoUrl?: string;
  domain: string;
  url: string;
  title?: string;
  author?: string;
  publishedDate?: string;
  language: string;
  category?: string;
}

interface UseCompetitorMetadataExtractionReturn {
  metadata: CompetitorMetadata | null;
  isLoading: boolean;
  error: string | null;
  extractMetadata: (url: string) => Promise<CompetitorMetadata | null>;
  reset: () => void;
}

export function useCompetitorMetadataExtraction(): UseCompetitorMetadataExtractionReturn {
  const [metadata, setMetadata] = useState<CompetitorMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = async (url: string): Promise<CompetitorMetadata | null> => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return null;
    }

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const response = await fetch("/api/extract-competitor-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract competitor metadata");
      }

      if (data.success && data.metadata) {
        setMetadata(data.metadata);
        return data.metadata;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to extract competitor metadata";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setMetadata(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    metadata,
    isLoading,
    error,
    extractMetadata,
    reset,
  };
}
