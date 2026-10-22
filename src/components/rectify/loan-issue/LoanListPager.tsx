"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListPagination } from "@/container/rectify/loan-issue/LoanRectifyType";

interface LoanListPagerProps {
  pagination: ListPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const pageWindow = (current: number, last: number): (number | "gap")[] => {
  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? (["gap", page] as const) : [page],
  );
};

const LoanListPager = ({ pagination, loading, onPageChange }: LoanListPagerProps) => {
  const { currentPage, lastPage, total, from, to } = pagination;
  if (total === 0) return null;

  const atFirst = currentPage <= 1 || loading;
  const atLast = currentPage >= lastPage || loading;
  const iconButton = "h-9 w-9 border-gray-200 text-gray-600 hover:bg-primary/5 hover:text-primary";

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {from}–{to}
        </span>{" "}
        of <span className="font-semibold text-foreground">{total}</span> loans
      </p>

      {lastPage > 1 && (
        <nav aria-label="Loan list pages" className="flex flex-wrap items-center gap-1">
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
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageWindow(currentPage, lastPage).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1.5 text-sm text-gray-400">
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === currentPage ? "default" : "outline"}
                size="sm"
                disabled={loading}
                aria-current={item === currentPage ? "page" : undefined}
                onClick={() => item !== currentPage && onPageChange(item)}
                className={cn(
                  "h-9 min-w-9 px-2.5 font-semibold",
                  item === currentPage
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
            onClick={() => onPageChange(currentPage + 1)}
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
      )}
    </div>
  );
};

export default LoanListPager;
