// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Check, X } from "lucide-react";
import { useState } from "react";

export type CompetitorColumn = {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logoImage?: string | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  marketShare?: string | null;
  pricing?: string | null;
  features?: string[] | null;
  notes?: string | null;
  isNew?: boolean;
};

// Reusable inline input cell with blur-based saving
function InlineInputCell({
  initial,
  placeholder,
  onSave,
  className,
  autoFocus,
}: {
  initial?: string | null;
  placeholder?: string;
  onSave?: (next: string) => void;
  className?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [hasChanged, setHasChanged] = useState(false);

  const handleBlur = () => {
    if (hasChanged && onSave) {
      onSave(value);
      setHasChanged(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setHasChanged(newValue !== (initial ?? ""));
  };

  return (
    <Input
      variant="underline"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className ?? "h-7 w-40 text-sm"}
      autoFocus={autoFocus}
    />
  );
}

export const createCompetitorColumns = (
  onSaveNew: () => void,
  onCancelNew: () => void
): ColumnDef<CompetitorColumn>[] => [
  // FIRST (sticky) column is usually the title/name
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const competitor = row.original;

      if (competitor.isNew) {
        // New row: always in edit with ghost check/X
        const [val, setVal] = useState(competitor.name || "");
        return (
          <div className="flex items-center gap-1">
            <Input
              variant="underline"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Competitor name"
              className="h-7 w-44 text-sm"
              autoFocus
            />
          </div>
        );
      }

      return (
        <InlineInputCell
          initial={competitor.name}
          placeholder="Competitor name"
          onSave={(next) => {
            // TODO wire real save
            console.log("Save name:", competitor.id, next);
          }}
          className="h-7 w-44 text-sm"
        />
      );
    },
  },

  // MIDDLE (scrollable) columns
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.description}
          placeholder="Description"
          onSave={(next) => console.log("Save description:", c.id, next)}
          className="h-7 w-56 text-sm"
        />
      );
    },
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.website}
          placeholder="https://…"
          onSave={(next) => console.log("Save website:", c.id, next)}
          className="h-7 w-52 text-sm"
        />
      );
    },
  },
  {
    accessorKey: "strengths",
    header: "Strengths",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.strengths?.join(", ") || ""}
          placeholder="Strengths (comma separated)"
          onSave={(next) => {
            const strengths = next ? next.split(",").map(s => s.trim()).filter(Boolean) : [];
            console.log("Save strengths:", c.id, strengths);
          }}
          className="h-7 w-56 text-sm"
        />
      );
    },
  },
  {
    accessorKey: "weaknesses",
    header: "Weaknesses",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.weaknesses?.join(", ") || ""}
          placeholder="Weaknesses (comma separated)"
          onSave={(next) => {
            const weaknesses = next ? next.split(",").map(s => s.trim()).filter(Boolean) : [];
            console.log("Save weaknesses:", c.id, weaknesses);
          }}
          className="h-7 w-56 text-sm"
        />
      );
    },
  },
  {
    accessorKey: "marketShare",
    header: "Market Share",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.marketShare}
          placeholder="e.g. 12%"
          onSave={(next) => console.log("Save marketShare:", c.id, next)}
          className="h-7 w-28 text-sm"
        />
      );
    },
  },
  {
    accessorKey: "pricing",
    header: "Pricing",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.pricing}
          placeholder="Pricing"
          onSave={(next) => console.log("Save pricing:", c.id, next)}
          className="h-7 w-32 text-sm"
        />
      );
    },
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.features?.join(", ") || ""}
          placeholder="Features (comma separated)"
          onSave={(next) => {
            const features = next ? next.split(",").map(s => s.trim()).filter(Boolean) : [];
            console.log("Save features:", c.id, features);
          }}
          className="h-7 w-56 text-sm"
        />
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <InlineInputCell
          initial={c.notes}
          placeholder="Notes"
          onSave={(next) => console.log("Save notes:", c.id, next)}
          className="h-7 w-56 text-sm"
        />
      );
    },
  },

  // LAST (sticky) column — ellipsis button with conditional enabling
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const c = row.original;

      if (c.isNew) {
        return (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveNew}
              className="h-7 w-7 p-0"
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelNew}
              className="h-7 w-7 p-0"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      }

      // Check if competitor has a title/name to enable actions
      const hasTitle = c.name && c.name.trim().length > 0;

      return (
        <Button
          size="sm"
          variant="ghost"
          disabled={!hasTitle}
          onClick={() => console.log("Actions for competitor:", c.id)}
          className="h-7 w-7 p-0"
          aria-label="More actions"
          title="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];
