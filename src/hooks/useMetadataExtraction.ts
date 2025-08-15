import { useState } from "react";

interface Metadata {
  title: string;
  description: string;
  contentType: "video" | "image" | "article" | "social" | "professional" | "other";
  estimatedDuration: number;
  tags: string[];
  platform: string;
  platformName: string;
  author?: string;
  publishedDate?: string;
  thumbnailUrl?: string;
  language: string;
  category: string;
  url: string;
  domain: string;
}

interface UseMetadataExtractionReturn {
  metadata: Metadata | null;
  isLoading: boolean;
  error: string | null;
  extractMetadata: (url: string) => Promise<void>;
  reset: () => void;
}

export function useMetadataExtraction(): UseMetadataExtractionReturn {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const response = await fetch("/api/extract-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract metadata");
      }

      if (data.success && data.metadata) {
        setMetadata(data.metadata);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract metadata");
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
