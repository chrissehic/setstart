// data-table.tsx
"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  type ColumnFiltersState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  })

  return (
    <div className="w-full">
      <div className="rounded-md border overflow-hidden">
        {/* One scroll container for both directions */}
        <div className="relative max-h-[420px] overflow-auto">
          <Table className="min-w-max text-sm">
            {/* Sticky header row (vertical) */}
            <TableHeader className="sticky top-0 z-20 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    const isFirst = index === 0
                    const isLast = index === headerGroup.headers.length - 1
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "px-2 py-1 whitespace-nowrap bg-background",
                          isFirst && "sticky left-0 z-30 shadow-[inset_-1px_0_0_hsl(var(--border))]",
                          isLast && "sticky right-0 z-30 shadow-[inset_1px_0_0_hsl(var(--border))]",
                        )}
                        style={{
                          ...(isFirst ? { left: 0 } : {}),
                          ...(isLast ? { right: 0 } : {}),
                        }}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>

            {/* Body with sticky first/last columns (horizontal) */}
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="group">
                    {row.getVisibleCells().map((cell, index) => {
                      const isFirst = index === 0
                      const isLast = index === row.getVisibleCells().length - 1
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "p-0 align-middle",
                            isFirst && "sticky left-0 z-10 bg-background shadow-[inset_-1px_0_0_hsl(var(--border))]",
                            isLast && "sticky right-0 z-10 bg-background shadow-[inset_1px_0_0_hsl(var(--border))]",
                          )}
                          style={{
                            ...(isFirst ? { left: 0 } : {}),
                            ...(isLast ? { right: 0 } : {}),
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
              
                          </TableBody>
          </Table>
        </div>
        
        {/* Add Row Button - Outside scrollable area */}
        <div className="border-t border-dashed border-muted-foreground/30">
          <div 
            className="h-auto py-2 flex items-center justify-center cursor-pointer group/add hover:bg-primary/30 transition-colors"
            onClick={() => {
              // This will be handled by the parent component
              const event = new CustomEvent('addCompetitorRow', { detail: { source: 'tableCue' } });
              window.dispatchEvent(event);
            }}
          >
            <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover/add:text-foreground transition-colors">
              <Plus className="size-5 group-hover/add:text-foreground transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
