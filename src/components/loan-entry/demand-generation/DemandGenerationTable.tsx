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
import { DemandRow } from "@/container/loan-entry/demand-generation/DemandGenerationType";

interface DemandGenerationTableProps {
  data: DemandRow[] | null;
  loading?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export function formatDemandAmount(value: string | number) {
  if (value === "" || value === null || value === undefined) return "—";
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const sumAmount = (
  rows: DemandRow[],
  key: "currentDemand" | "arrearDemand" | "totalDemand" | "outstanding",
) =>
  rows.reduce((total, row) => {
    const amount = Number(row[key]);
    return total + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

export function DemandGenerationTable({
  data,
  loading,
}: DemandGenerationTableProps) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    setPageIndex(0);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[240px] sm:h-[280px] rounded-xl border border-gray-100 bg-slate-50/50">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="h-9 w-9 animate-spin" />
          <span className="text-sm font-bold tracking-wider uppercase text-primary/80">
            Generating Demand...
          </span>
        </div>
      </div>
    );
  }

  if (data === null) return null;

  const hasData = data.length > 0;
  const pageCount = hasData ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = hasData
    ? data.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize)
    : [];
  const canPreviousPage = safePageIndex > 0;
  const canNextPage = safePageIndex < pageCount - 1;
  const totals = {
    currentDemand: sumAmount(data, "currentDemand"),
    arrearDemand: sumAmount(data, "arrearDemand"),
    totalDemand: sumAmount(data, "totalDemand"),
    outstanding: sumAmount(data, "outstanding"),
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        {!hasData ? (
          <div className="px-5 py-12 text-center text-gray-500 font-medium">
            No demand records found.
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-gray-100">
              {pageRows.map((row) => (
                <article
                  key={`${row.sl}-${row.memberNo}-${row.accountLabel}`}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        #{row.sl}
                        {row.memberNo ? ` · ${row.memberNo}` : ""}
                      </p>
                      <h4 className="font-semibold text-primary truncate">
                        {row.memberName || "—"}
                      </h4>
                      {row.guardianName ? (
                        <p className="text-sm text-gray-500 truncate">
                          {row.guardianName}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-semibold uppercase text-gray-400">
                        Total Demand
                      </p>
                      <p className="font-bold text-primary">
                        {formatDemandAmount(row.totalDemand)}
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Loan Account
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {row.accountLabel || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Installment
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {row.installmentNo || "—"}
                        {Number(row.installmentAmount) > 0
                          ? ` · ${formatDemandAmount(row.installmentAmount)}`
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Due Date
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {row.dueDate || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Outstanding
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {formatDemandAmount(row.outstanding)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Current
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {formatDemandAmount(row.currentDemand)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Arrear
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {formatDemandAmount(row.arrearDemand)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
              <div className="bg-slate-50 px-4 py-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-gray-700">Total Demand</span>
                <span className="text-sm font-bold text-primary">
                  {formatDemandAmount(totals.totalDemand)}
                </span>
              </div>
            </div>

            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[1100px]">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider w-14 text-center">
                      Sl
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                      Loan Account
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                      Installment
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                      Due Date
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                      Current Demand
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                      Arrear
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                      Total Demand
                    </th>
                    <th className="px-4 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                      Outstanding
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr
                      key={`${row.sl}-${row.memberNo}-${row.accountLabel}`}
                      className="border-b border-gray-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center text-gray-600 font-semibold">
                        {row.sl}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-primary">
                          {row.memberName || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {[row.memberNo, row.guardianName].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-700">
                        {row.accountLabel || "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-700">
                        <p>{row.installmentNo || "—"}</p>
                        {Number(row.installmentAmount) > 0 ? (
                          <p className="text-xs text-gray-500">
                            {formatDemandAmount(row.installmentAmount)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-700">
                        {row.dueDate || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-700 whitespace-nowrap">
                        {formatDemandAmount(row.currentDemand)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-700 whitespace-nowrap">
                        {formatDemandAmount(row.arrearDemand)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-primary whitespace-nowrap">
                        {formatDemandAmount(row.totalDemand)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-700 whitespace-nowrap">
                        {formatDemandAmount(row.outstanding)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-gray-200">
                    <td
                      colSpan={5}
                      className="px-4 py-3.5 text-sm font-bold text-gray-700"
                    >
                      Total ({data.length})
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-gray-800 whitespace-nowrap">
                      {formatDemandAmount(totals.currentDemand)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-gray-800 whitespace-nowrap">
                      {formatDemandAmount(totals.arrearDemand)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-primary whitespace-nowrap">
                      {formatDemandAmount(totals.totalDemand)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-gray-800 whitespace-nowrap">
                      {formatDemandAmount(totals.outstanding)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
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
