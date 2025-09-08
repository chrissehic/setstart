import { TaskStatus } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function for fetch with timeout
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// Utility function to check if error is a timeout
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('timeout') ||
    error.message.includes('Headers Timeout') ||
    error.message.includes('UND_ERR_HEADERS_TIMEOUT')
  );
}

const categoryConfigs = {
  Operations: {
    color: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/25",
  },
  Strategy: {
    color: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/25",
  },
  "Product Development": {
    color: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/25",
  },
  Marketing: {
    color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/25",
  },
  Sales: {
    color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/25",
  },
  Partnerships: {
    color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/25",
  },
  "Customer Support": {
    color: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/25",
  },
  Finance: {
    color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/25",
  },
  Legal: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/25",
  },
  "Fundraising & Investment": {
    color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/25",
  },
  "Web Development": {
    color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25",
  },
  "Team Development": {
    color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 dark:border-fuchsia-500/25",
  },
  "Research & Innovation": {
    color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/25",
  },
  "Quality Assurance": {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25",
  },
} as const;


type Category = keyof typeof categoryConfigs;

export const getCategoryConfig = (category: string) => {
  return (
    categoryConfigs[category as Category] || {
      color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/25",
    }
  );
};

// Transform categories into the format expected by the combobox
export const categories = Object.keys(categoryConfigs).map((key) => ({
  value: key,
  label: key,
}))


export const getStatusConfig = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.NOT_STARTED:
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
        dot: "bg-slate-400",
        label: "Not Started",
      }
    case TaskStatus.IN_PROGRESS:
      return {
        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25",
        dot: "bg-amber-400",
        label: "In Progress",
      }
    case TaskStatus.COMPLETED:
      return {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25",
        dot: "bg-emerald-400",
        label: "Completed",
      }
    default:
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
        dot: "bg-slate-400",
        label: status,
      }
  }
}

export const formatDate = (date: Date) =>
  new Date(date).toISOString().split('T')[0];

// Helper function to get the first available image from a product
export const getProductDisplayImage = (product: { image?: string | null; variants?: Array<{ image?: string | null }> }) => {
  // First try to get the main product image
  if (product.image) {
    return product.image;
  }
  
  // If no main image, try to get the first variant image
  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (variant.image) {
        return variant.image;
      }
    }
  }
  
  // No images available
  return null;
}

