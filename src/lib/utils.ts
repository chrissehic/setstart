import { TaskStatus } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCategoryConfig = (category: string) => {
  const configs = {
    Operations: {
      color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    },
    Strategy: {
      color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    },
    "Product Development": {
      color: "bg-teal-500/15 text-teal-300 border-teal-500/25",
    },
    Marketing: {
      color: "bg-pink-500/15 text-pink-300 border-pink-500/25",
    },
    Sales: {
      color: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    },
    Partnerships: {
      color: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    },
    "Customer Support": {
      color: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    },
    Finance: {
      color: "bg-green-500/15 text-green-300 border-green-500/25",
    },
    Legal: {
      color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
    },
    "Fundraising & Investment": {
      color: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    },
    "Web Development": {
      color: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    },
    "Team Development": {
      color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25",
    },
    "Research & Innovation": {
      color: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    },
    "Quality Assurance": {
      color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    },
  };

  return (
    configs[category as keyof typeof configs] || {
      color: "bg-slate-500/15 text-slate-300 border-slate-500/25",
    }
  );
};


export const getStatusConfig = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.NOT_STARTED:
      return {
        color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        dot: "bg-slate-400",
        label: "Not Started",
      }
    case TaskStatus.IN_PROGRESS:
      return {
        color: "bg-blue-500/15 text-blue-300 border-blue-500/25",
        dot: "bg-amber-400",
        label: "In Progress",
      }
    case TaskStatus.COMPLETE:
      return {
        color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        dot: "bg-emerald-400",
        label: "Completed",
      }
    default:
      return {
        color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        dot: "bg-slate-400",
        label: status,
      }
  }
}

export const formatDate = (date: Date) =>
  new Date(date).toISOString().split('T')[0];

