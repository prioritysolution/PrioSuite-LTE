"use client";

import * as React from "react";
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DemandColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => React.ReactNode;
  footer?: React.ReactNode;
}

interface DemandGenerationTableProps<T> {
  columns: DemandColumn<T>[];
  rows: T[] | null;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  getRowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function formatDemandAmount(value: string | number) {
  if (value === "" || value === null || value === undefined) return "—";
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function DemandGenerationTable<T>({
  columns,
  rows,
  loading,
  loadingText = "Loading...",
  emptyText = "No demand records found.",
  getRowKey,
  onRowClick,
  rowClassName,
}: DemandGenerationTableProps<T>) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    setPageIndex(0);
  }, [rows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[240px] sm:h-[280px] rounded-xl border border-gray-100 bg-slate-50/50">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="h-9 w-9 animate-spin" />
          <span className="text-sm font-bold tracking-wider uppercase text-primary/80">
            {loadingText}
          </span>
        </div>
      </div>
    );
  }

  if (rows === null) return null;

  const hasData = rows.length > 0;
  const pageCount = hasData ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const offset = safePageIndex * pageSize;
  const pageRows = hasData ? rows.slice(offset, offset + pageSize) : [];
  const canPreviousPage = safePageIndex > 0;
  const canNextPage = safePageIndex < pageCount - 1;
  const hasFooter = columns.some((column) => column.footer !== undefined);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        {!hasData ? (
          <div className="px-5 py-12 text-center text-gray-500 font-medium">
            {emptyText}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[1100px]">
              <thead className="bg-primary">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap",
                        alignClass[column.align ?? "left"],
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr
                    key={getRowKey(row, offset + index)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-gray-100 last:border-0 hover:bg-slate-50/80 transition-colors",
                      onRowClick && "cursor-pointer",
                      rowClassName?.(row),
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3.5 text-gray-700 whitespace-nowrap",
                          alignClass[column.align ?? "left"],
                        )}
                      >
                        {column.render(row, offset + index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {hasFooter && (
                <tfoot>
                  <tr className="bg-slate-50 border-t border-gray-200">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-3.5 font-bold text-gray-800 whitespace-nowrap",
                          alignClass[column.align ?? "left"],
                        )}
                      >
                        {column.footer}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {hasData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-600">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px] border-gray-200 bg-white font-medium text-gray-700">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="text-sm font-medium text-slate-600">
              Page {safePageIndex + 1} of {pageCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex border-gray-200 text-slate-600 hover:bg-slate-100"
                onClick={() => setPageIndex(0)}
                disabled={!canPreviousPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-8 p-0 border-gray-200 text-slate-600 hover:bg-slate-100"
                onClick={() => setPageIndex((page) => Math.max(0, page - 1))}
                disabled={!canPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-8 p-0 border-gray-200 text-slate-600 hover:bg-slate-100"
                onClick={() =>
                  setPageIndex((page) => Math.min(pageCount - 1, page + 1))
                }
                disabled={!canNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex border-gray-200 text-slate-600 hover:bg-slate-100"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={!canNextPage}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemandGenerationTable;
