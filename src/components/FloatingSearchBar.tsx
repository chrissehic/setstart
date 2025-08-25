"use client";

import { cn } from "@/lib/utils";
import { Search, X, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import AIInput from "./AIInput";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type?: string;
  url?: string;
}

// Interface matching AIInput props (excluding floating-specific ones)
interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showButton?: boolean;
  buttonIcon?: React.ReactNode;
  loadingIcon?: React.ReactNode;
  isLoading?: boolean;
  onSubmit?: () => void;
  containerClassName?: string;
  submitOnEnter?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  statusMessage?: React.ReactNode;
  showStatusMessage?: boolean;
}

interface FloatingSearchBarProps extends AIInputProps {
  // Floating-specific props
  position?: "bottom" | "top";
  className?: string;
  
  // Search results
  showResults?: boolean;
  results?: SearchResult[];
  onResultClick?: (result: SearchResult) => void;
}

export default function FloatingSearchBar({
  // AIInput props (pass through most of them)
  value,
  onChange,
  placeholder = "Search anything...",
  onSubmit,
  showButton = false,
  buttonIcon,
  loadingIcon,
  isLoading = false,
  rows = 1,
  className,
  containerClassName,
  submitOnEnter = true,
  disabled = false,
  autoFocus = false,
  maxLength = 500,
  statusMessage,
  showStatusMessage = false,
  
  // Floating-specific props
  position = "bottom",
  className: floatingClassName,
  showResults = false,
  results = [],
  onResultClick,
}: FloatingSearchBarProps) {
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search submission
  const handleSearch = () => {
    if (onSubmit && value.trim()) {
      onSubmit();
      setShowResultsDropdown(true);
    }
  };

  // Handle clear
  const handleClear = () => {
    onChange("");
    setShowResultsDropdown(false);
  };

  // Handle input change
  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Show results dropdown when typing
    if (newValue.trim()) {
      setShowResultsDropdown(true);
    } else {
      setShowResultsDropdown(false);
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setShowResultsDropdown(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.querySelector('[data-floating-search]') as HTMLTextAreaElement;
        if (input) {
          input.focus();
        }
      }
      
      // Escape to clear and blur
      if (e.key === "Escape") {
        handleClear();
        const input = document.querySelector('[data-floating-search]') as HTMLTextAreaElement;
        if (input) {
          input.blur();
        }
      }
      
      // Arrow down/up to navigate results
      if (showResultsDropdown && results.length > 0) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          // TODO: Implement result navigation
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResultsDropdown, results.length]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResultsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Position-specific styling
  const getPositionStyles = () => {
    const baseStyles = "fixed left-1/2 transform -translate-x-1/2 z-50 pointer-events-none";
    
    if (position === "top") {
      return cn(baseStyles, "top-4");
    }
    
    return cn(baseStyles, "bottom-6");
  };

  return (
    <div className={cn(getPositionStyles(), "max-w-lg mx-auto", floatingClassName)}>
      <div className="pointer-events-auto" ref={searchRef}>
        <AIInput
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onSubmit={handleSearch}
          showButton={showButton}
          buttonIcon={buttonIcon}
          loadingIcon={loadingIcon}
          isLoading={isLoading}
          rows={rows}
          className={className}
          containerClassName={cn(
            "shadow-lg border-0",
            containerClassName
          )}
          submitOnEnter={submitOnEnter}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          statusMessage={statusMessage}
          showStatusMessage={showStatusMessage}
          data-floating-search="true"
        />
        
        {/* Clear button */}
        {value.trim() && (
          <button
            onClick={handleClear}
            className={cn(
              "absolute right-4 top-1/2 transform -translate-y-1/2",
              "p-1 rounded-full hover:bg-muted/50 transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
        
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="size-4 text-muted-foreground" />
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && showResultsDropdown && (value.trim() || results.length > 0) && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id || index}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground truncate mt-1">
                            {result.description}
                          </div>
                        )}
                        {result.type && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {result.type}
                          </div>
                        )}
                      </div>
                      <ChevronUp className="size-4 text-muted-foreground rotate-90" />
                    </div>
                  </button>
                ))}
              </div>
            ) : value.trim() && !isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found for &ldquo;{value}&rdquo;
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
