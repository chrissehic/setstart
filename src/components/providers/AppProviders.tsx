"use client";
import React, { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Increase stale time to reduce unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Add retry logic with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        // Retry up to 3 times for network errors
        if (failureCount < 3 && (error as any)?.message?.includes('fetch failed')) {
          return true;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Increase timeout for slow operations
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      // Add retry logic for mutations
      retry: (failureCount, error) => {
        // Retry up to 2 times for network errors
        if (failureCount < 2 && (error as any)?.message?.includes('fetch failed')) {
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Global error handler component
function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Handle timeout errors specifically
      if (event.reason?.message?.includes('fetch failed') || 
          event.reason?.message?.includes('Headers Timeout') ||
          event.reason?.code === 'UND_ERR_HEADERS_TIMEOUT') {
        console.warn('Handling timeout error:', event.reason);
        // You can show a toast or handle the error here
        return;
      }
      
      // Log other unhandled rejections
      console.error('Unhandled promise rejection:', event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      // Handle timeout errors specifically
      if (event.message?.includes('fetch failed') || 
          event.message?.includes('Headers Timeout') ||
          event.error?.code === 'UND_ERR_HEADERS_TIMEOUT') {
        console.warn('Handling timeout error:', event.error);
        return;
      }
      
      // Log other errors
      console.error('Global error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <GlobalErrorHandler />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </NuqsAdapter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
