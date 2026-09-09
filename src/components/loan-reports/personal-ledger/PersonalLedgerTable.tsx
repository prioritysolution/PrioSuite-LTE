"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FiLoader } from "react-icons/fi";

// ---- Types ----
export interface PersonalLedgerRow {
  sl: number;
  group_name: string;
  member_name: string;
  due_date: string | null;
  collection_date: string | null;
  collection_amount: string | number | null;
  principal: string | number | null;
  interest: string | number | null;
  balance: string | number | null;
}

interface PersonalLedgerTableProps {
  data: PersonalLedgerRow[] | null;
  loading?: boolean;
  emptyMessage?: string;
}

// ---- Helpers ----
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(value: string | number | null) {
  const num = value !== null && value !== undefined ? Number(value) : 0;
  return isNaN(num) ? "₹0.00" : currencyFormatter.format(num);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const str = String(dateStr).trim();
  let date = parseISO(str.length >= 10 ? str.slice(0, 10) : str);
  if (!isValid(date)) date = new Date(str);
  if (!isValid(date)) return str;
  return format(date, "d MMM, yyyy");
}

// ---- Component ----
export function PersonalLedgerTable({
  data,
  loading,
  emptyMessage = "No records found.",
}: PersonalLedgerTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] sm:h-[320px] rounded-xl border border-gray-100 bg-slate-50/50 gap-3 text-primary">
        <FiLoader className="h-9 w-9 animate-spin" />
        <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
          Fetching Records...
        </span>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex items-center justify-center h-[180px] rounded-xl border border-dashed border-gray-200 bg-slate-50/40">
        <p className="text-sm font-medium text-gray-500">
          Use the filters above and click Search to load ledger entries.
        </p>
      </div>
    );
  }

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <>
      {/* Table view: only from `lg` upward */}
      <div className="hidden lg:block rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm table-fixed">
            <colgroup>
              <col className="w-[56px]" />
              <col className="w-[120px]" />
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead className="bg-primary">
              <tr>
                <th className="px-3 sm:px-4 h-11 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-center">
                  Sl
                </th>
                <th className="px-3 sm:px-4 h-11 text-[12px] font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
                  Collection Date
                </th>
                <th className="px-3 sm:px-4 h-11 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  Collection Amount
                </th>
                <th className="px-3 sm:px-4 h-11 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                  Principal
                </th>
                <th className="px-3 sm:px-4 h-11 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                  Interest
                </th>
                <th className="px-3 sm:px-4 h-11 text-[12px] font-bold text-primary-foreground uppercase tracking-wider text-right">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {!hasData ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={row.sl}
                    className={
                      index % 2 === 0
                        ? "bg-white hover:bg-slate-50/80"
                        : "bg-slate-50/60 hover:bg-slate-50"
                    }
                  >
                    <td className="px-3 sm:px-4 py-3 text-center text-gray-500 font-semibold border-b border-gray-100">
                      {row.sl}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap font-medium text-gray-800 border-b border-gray-100 tabular-nums">
                      {formatDate(row.collection_date)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-gray-900 font-semibold border-b border-gray-100 tabular-nums">
                      {formatCurrency(row.collection_amount)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-medium text-gray-800 border-b border-gray-100 tabular-nums">
                      {formatCurrency(row.principal)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap text-gray-800 font-medium border-b border-gray-100 tabular-nums">
                      {formatCurrency(row.interest)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-right whitespace-nowrap font-semibold text-primary border-b border-gray-100 tabular-nums">
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card view: phones, sm, and md */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3 lg:hidden">
        {!hasData ? (
          <div className="col-span-full flex items-center justify-center py-12 rounded-xl border border-gray-100 bg-slate-50/50 text-sm text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          data.map((row) => (
            <div
              key={row.sl}
              className="rounded-xl border border-gray-100 bg-white p-3.5 sm:p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Collection Date
                  </p>
                  <p className="mt-0.5 font-semibold text-gray-800 tabular-nums">
                    {formatDate(row.collection_date)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-primary/10 text-primary border-0"
                >
                  #{row.sl}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-y-2.5 gap-x-3 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Col. Amount
                  </p>
                  <p className="mt-0.5 font-semibold text-gray-800 tabular-nums">
                    {formatCurrency(row.collection_amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Balance
                  </p>
                  <p className="mt-0.5 font-semibold text-primary tabular-nums">
                    {formatCurrency(row.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Principal
                  </p>
                  <p className="mt-0.5 font-medium text-gray-800 tabular-nums">
                    {formatCurrency(row.principal)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                    Interest
                  </p>
                  <p className="mt-0.5 font-semibold text-gray-800 tabular-nums">
                    {formatCurrency(row.interest)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default PersonalLedgerTable;
