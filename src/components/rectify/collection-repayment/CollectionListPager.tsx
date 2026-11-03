"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const PAGE_SIZE_OPTIONS = [25, 50, 100];

interface CollectionListPagerProps {
  page: number;
  pageSize: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageWindow = (current: number, last: number): (number | "gap")[] => {
  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? (["gap", page] as const) : [page],
  );
};

const CollectionListPager = ({
  page,
  pageSize,
  total,
  loading,
  onPageChange,
  onPageSizeChange,
}: CollectionListPagerProps) => {
  if (total === 0) return null;

  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const atFirst = page <= 1 || loading;
  const atLast = page >= lastPage || loading;
  const iconButton = "h-9 w-9 border-gray-200 text-gray-600 hover:bg-primary/5 hover:text-primary";

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {from}–{to}
          </span>{" "}
          of <span className="font-semibold text-foreground">{total}</span>{" "}
          {total === 1 ? "collection" : "collections"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={loading}
          >
            <SelectTrigger size="sm" className="h-9 w-[76px] border-gray-200" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <nav aria-label="Collection list pages" className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={iconButton}
          disabled={atFirst}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={iconButton}
          disabled={atFirst}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageWindow(page, lastPage).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-1.5 text-sm text-gray-400">
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "default" : "outline"}
              size="sm"
              disabled={loading}
              aria-current={item === page ? "page" : undefined}
              onClick={() => item !== page && onPageChange(item)}
              className={cn(
                "h-9 min-w-9 px-2.5 font-semibold",
                item === page
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border-gray-200 text-gray-600 hover:bg-primary/5 hover:text-primary",
              )}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className={iconButton}
          disabled={atLast}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={iconButton}
          disabled={atLast}
          onClick={() => onPageChange(lastPage)}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
};

export default CollectionListPager;
