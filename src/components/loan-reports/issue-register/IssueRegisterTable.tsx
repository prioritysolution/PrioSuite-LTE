"use client";

import * as React from "react";
import { FiLoader } from "react-icons/fi";
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
import { IssueRegisterRow } from "@/container/loan-reports/issue-register/IssueRegisterType";

interface IssueRegisterTableProps {
  data: IssueRegisterRow[] | null;
  loading?: boolean;
  emptyMessage?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];
const COL_COUNT = 13;

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value: string | number) {
  if (value === "" || value === null || value === undefined) return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function IssueRegisterTable({
  data,
  loading,
  emptyMessage = "No records found.",
}: IssueRegisterTableProps) {
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
          <table className="w-full text-left border-collapse text-sm min-w-[1400px]">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider w-14 text-center">
                  Sl
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                  Issue Date
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                  Member No
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Member Name
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Guardian
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Area
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Scheme
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Loan Amount
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Installment Amt
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Realisable
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Guarantor
                </th>
                <th className="px-4 h-12 text-[12px] font-bold text-primary-foreground uppercase tracking-wider">
                  Under CO
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
                    key={`${row.memberNo}-${row.groupName}-${row.issueDate}-${safePageIndex}-${index}`}
                    className="border-b border-gray-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-gray-600 font-semibold">
                      {row.sl}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {formatDate(row.issueDate)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary tracking-wide">
                      {row.groupName || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary tracking-wide whitespace-nowrap">
                      {row.memberNo || "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {row.memberName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.guardianName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.area || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.schemeName || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800 font-semibold whitespace-nowrap">
                      {formatAmount(row.loanAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-semibold whitespace-nowrap">
                      {formatAmount(row.installmentAmt)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-semibold whitespace-nowrap">
                      {formatAmount(row.realisableAmt)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.guarantorName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.underCo || "—"}
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

export default IssueRegisterTable;
