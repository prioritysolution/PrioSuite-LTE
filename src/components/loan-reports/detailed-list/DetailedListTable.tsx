"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DetailedListRow {
  sl: number;
  groupName: string;
  memberName: string;
  loanDate: string;
  loanAmount: number;
  realizableAmount: number;
  openingBalance: number;
  issueAmount: number;
  repayPrincipal: number;
  repayInterest: number;
  receivableInterest: number;
  outstandingBalance: number;
}

interface DetailedListTableProps {
  data: DetailedListRow[] | null;
  loading?: boolean;
  emptyMessage?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value || 0);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const str = String(dateStr).trim();
  let date = parseISO(str.length >= 10 ? str.slice(0, 10) : str);
  if (!isValid(date)) date = new Date(str);
  if (!isValid(date)) return str;
  return format(date, "d MMM, yyyy");
}

const COL_COUNT = 12;

export function DetailedListTable({
  data,
  loading,
  emptyMessage = "No records found.",
}: DetailedListTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    setPageIndex(0);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[280px] sm:h-[320px] rounded-xl border border-gray-100 bg-slate-50/50">
        <div className="flex flex-col items-center gap-3 text-primary">
          <FiLoader className="h-9 w-9 animate-spin" />
          <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
            Fetching Records...
          </span>
        </div>
      </div>
    );
  }

  if (data === null) {
    return null;
  }

  const hasData = Array.isArray(data) && data.length > 0;
  const pageCount = hasData ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = hasData
    ? data.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize)
    : [];

  const canPreviousPage = safePageIndex > 0;
  const canNextPage = safePageIndex < pageCount - 1;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[1280px]">
            <thead className="bg-primary">
              <tr>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider w-14 text-center">
                  Sl
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Member Name
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                  Loan Date
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Opening Balance
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                  Issue
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Repay. Principal
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Repay. Interest
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Receivable Interest
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Loan Amount
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Realizable
                </th>
                <th className="px-3 sm:px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Outs. Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {!hasData ? (
                <tr>
                  <td
                    colSpan={COL_COUNT}
                    className="px-5 py-12 text-center text-gray-500 font-medium"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={`${row.sl}-${safePageIndex}-${index}`}
                    className="border-b border-gray-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-3 text-center text-gray-600 font-semibold">
                      {row.sl}
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-semibold text-primary tracking-wide">
                      {row.groupName}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700 font-medium">
                      {row.memberName}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-gray-700 tabular-nums">
                      {formatDate(row.loanDate)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-medium text-gray-800 tabular-nums">
                      {formatCurrency(row.openingBalance)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-semibold text-gray-800 tabular-nums">
                      {formatCurrency(row.issueAmount)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-medium text-gray-700 tabular-nums">
                      {formatCurrency(row.repayPrincipal)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-medium text-gray-700 tabular-nums">
                      {formatCurrency(row.repayInterest)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-medium text-gray-700 tabular-nums">
                      {formatCurrency(row.receivableInterest)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-semibold text-gray-800 tabular-nums">
                      {formatCurrency(row.loanAmount)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-medium text-gray-700 tabular-nums">
                      {formatCurrency(row.realizableAmount)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-semibold text-primary tabular-nums">
                      {formatCurrency(row.outstandingBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-1">
          <div className="flex items-center space-x-2">
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

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-slate-600">
              Page {safePageIndex + 1} of {pageCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex border-gray-200 text-slate-600 hover:bg-slate-100"
                onClick={() => setPageIndex(0)}
                disabled={!canPreviousPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 border-gray-200 text-slate-600 hover:bg-slate-100"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={!canPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 border-gray-200 text-slate-600 hover:bg-slate-100"
                onClick={() =>
                  setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                }
                disabled={!canNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
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

export default DetailedListTable;
