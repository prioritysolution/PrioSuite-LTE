"use client";

import * as React from "react";
import { format } from "date-fns";
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
import { MemberRegisterRow } from "@/container/customer-reports/member-register/MemberRegisterType";

interface MemberRegisterTableProps {
  data: MemberRegisterRow[] | null;
  loading?: boolean;
  emptyMessage?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return format(d, "d MMM, yyyy");
}

export function MemberRegisterTable({
  data,
  loading,
  emptyMessage = "No records found.",
}: MemberRegisterTableProps) {
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
          <table className="w-full text-left border-collapse text-sm min-w-[1100px]">
            <thead className="bg-primary">
              <tr>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider w-16 text-center">
                  Sl
                </th>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Member No
                </th>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Member Name
                </th>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Guardian Name
                </th>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Area
                </th>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                  Admission Date
                </th>
                <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Under CO
                </th>
              </tr>
            </thead>
            <tbody>
              {!hasData ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-gray-500 font-medium"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={`${row.memberNo}-${safePageIndex}-${index}`}
                    className="border-b border-gray-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-center text-gray-600 font-semibold">
                      {row.sl}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-primary tracking-wide whitespace-nowrap">
                      {row.memberNo || "—"}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-primary tracking-wide">
                      {row.memberName || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      {row.guardianName || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      {row.groupName || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      {row.area || "—"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-700">
                      {formatDate(row.admissionDate)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
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

export default MemberRegisterTable;
