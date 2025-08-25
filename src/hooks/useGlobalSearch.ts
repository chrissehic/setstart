import { useState, useCallback, useMemo } from "react";

export interface SearchResult {
  id: string;
  type: "workflow" | "task" | "objective" | "product" | "person" | "document";
  title: string;
  description?: string;
  url: string;
  relevance: number;
  tags?: string[];
}

export interface SearchOptions {
  includeArchived?: boolean;
  searchInContent?: boolean;
  limitResults?: number;
}

export function useGlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Perform search
  const performSearch = useCallback(async (
    query: string, 
    options: SearchOptions = {}
  ) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // TODO: Implement actual search API call
      // This is a placeholder for the search implementation
      console.log("Searching for:", query, "with options:", options);
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock results for now
      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "workflow",
          title: "Sample Workflow",
          description: "A sample workflow for demonstration",
          url: "/workflow/1",
          relevance: 0.9,
          tags: ["sample", "demo"]
        }
      ];
      
      setSearchResults(mockResults);
      
      // Add to search history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
      }
      
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchHistory]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  // Quick search (for keyboard shortcuts)
  const quickSearch = useCallback((query: string) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  // Search suggestions based on history and common terms
  const searchSuggestions = useMemo(() => {
    const suggestions = [
      ...searchHistory,
      "tasks",
      "objectives", 
      "products",
      "people",
      "documents"
    ];
    
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, searchHistory]);

  // Filter results by type
  const filterResultsByType = useCallback((type: SearchResult["type"]) => {
    return searchResults.filter(result => result.type === type);
  }, [searchResults]);

  // Get search statistics
  const searchStats = useMemo(() => {
    const stats = {
      total: searchResults.length,
      workflows: filterResultsByType("workflow").length,
      tasks: filterResultsByType("task").length,
      objectives: filterResultsByType("objective").length,
      products: filterResultsByType("product").length,
      people: filterResultsByType("person").length,
      documents: filterResultsByType("document").length,
    };
    
    return stats;
  }, [searchResults, filterResultsByType]);

  return {
    // State
    searchQuery,
    isSearching,
    searchResults,
    searchHistory,
    searchSuggestions,
    searchStats,
    
    // Actions
    setSearchQuery,
    performSearch,
    clearSearch,
    quickSearch,
    filterResultsByType,
  };
}
