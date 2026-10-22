"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, Search, Users, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CollectionLoanRow } from "@/container/loan-entry/loan-collection/LoanCollectionType";

interface MemberDetailsSectionProps {
  rows: CollectionLoanRow[];
  selectedAccountIds: Set<number>;
  isLoading?: boolean;
  hasGroup: boolean;
  disabled?: boolean;
  onToggleLoan: (row: CollectionLoanRow, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}

const formatMoney = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value: unknown) => {
  if (!value) return "—";
  try {
    const d = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
    return format(d, "d MMM, yyyy");
  } catch {
    return String(value);
  }
};

const SelectAllCheckbox = ({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label="Select all loans"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer disabled:cursor-not-allowed"
    />
  );
};

export const MemberDetailsSection = ({
  rows,
  selectedAccountIds,
  isLoading,
  hasGroup,
  disabled = false,
  onToggleLoan,
  onToggleAll,
}: MemberDetailsSectionProps) => {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  const visibleRows = useMemo(() => {
    const indexed = rows.map((row, index) => ({ row, index }));
    if (!query) return indexed;
    return indexed.filter(({ row }) =>
      [row.memberName, row.memberNo, row.accountNo].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [rows, query]);

  const selectedCount = visibleRows.filter(({ row }) =>
    selectedAccountIds.has(row.accountId),
  ).length;
  const allSelected =
    visibleRows.length > 0 && selectedCount === visibleRows.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const memberCount = new Set(rows.map((row) => row.memberId)).size;

  const toggle = (row: CollectionLoanRow) => {
    if (disabled) return;
    onToggleLoan(row, !selectedAccountIds.has(row.accountId));
  };

  const toggleAll = (checked: boolean) => {
    if (!isSearching) {
      onToggleAll(checked);
      return;
    }
    visibleRows.forEach(({ row }) => {
      if (selectedAccountIds.has(row.accountId) !== checked) {
        onToggleLoan(row, checked);
      }
    });
  };

  const loanHint = (row: CollectionLoanRow) =>
    [
      row.loanCycle ? `Cycle ${row.loanCycle}` : "",
      `Acct ${row.accountNo || "N/A"}`,
    ]
      .filter(Boolean)
      .join(" • ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg">
              Member Details
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Check one or more loans to add them to Payment Entry
            </p>
          </div>
        </div>
        {hasGroup && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search member name / no..."
                aria-label="Search members"
                autoComplete="off"
                className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:text-right">
              {isSearching && `${visibleRows.length} of `}
              {rows.length} {rows.length === 1 ? "loan" : "loans"} /{" "}
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {!hasGroup ? (
          <div className="flex items-center justify-center h-[160px] rounded-xl border border-dashed border-gray-200 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              Select a group to load member details.
            </p>
          </div>
        ) : isLoading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[220px] rounded-xl border border-gray-100 bg-slate-50/50 gap-3 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
              Loading Members...
            </span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-[160px] rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              No loans with an outstanding balance in this group.
            </p>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="flex items-center justify-center h-[160px] rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              No members match &quot;{search.trim()}&quot;.
            </p>
          </div>
        ) : (
          <div className={cn("relative", isLoading && "opacity-60")}>
            {isLoading && (
              <div className="absolute right-3 top-3 z-10 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}

            {/* Desktop table */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-100">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/5">
                      <TableHead className="w-[110px] text-center font-bold text-primary">
                        <label className="inline-flex items-center justify-center gap-2 cursor-pointer select-none">
                          <SelectAllCheckbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            disabled={disabled}
                            onChange={toggleAll}
                          />
                          <span className="text-xs">Collect</span>
                        </label>
                      </TableHead>
                      <TableHead className="w-12 text-center font-bold text-primary">
                        Sl
                      </TableHead>
                      <TableHead className="min-w-[110px] font-bold text-primary">
                        Member No
                      </TableHead>
                      <TableHead className="min-w-[180px] font-bold text-primary">
                        Member Name
                      </TableHead>
                      <TableHead className="min-w-[120px] font-bold text-primary">
                        Loan Date
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Loan Amount
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Installment
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Balance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map(({ row, index }) => {
                      const isChecked = selectedAccountIds.has(row.accountId);
                      const hint = loanHint(row);
                      return (
                        <TableRow
                          key={row.accountId}
                          className={cn(
                            isChecked && "bg-primary/5",
                            disabled ? "cursor-not-allowed" : "cursor-pointer",
                          )}
                          onClick={() => toggle(row)}
                        >
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              aria-label={`Collect ${row.memberName}`}
                              checked={isChecked}
                              disabled={disabled}
                              readOnly
                              className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer disabled:cursor-not-allowed pointer-events-none"
                            />
                          </TableCell>
                          <TableCell className="text-center text-gray-500 font-semibold">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-gray-800">
                            {row.memberNo || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate">
                                {row.memberName || "—"}
                              </p>
                              {hint && (
                                <p className="text-xs text-gray-400 break-words mt-0.5">
                                  {hint}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-gray-700">
                            {formatDate(row.loanDate)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-800 whitespace-nowrap">
                            {formatMoney(row.loanAmount)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-800 whitespace-nowrap">
                            {formatMoney(row.installmentAmt)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary whitespace-nowrap">
                            {formatMoney(row.balance)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              <label className="flex items-center gap-2 px-1 text-sm font-semibold text-gray-700 select-none cursor-pointer">
                <SelectAllCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={disabled}
                  onChange={toggleAll}
                />
                Select all
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {visibleRows.map(({ row, index }) => {
                  const isChecked = selectedAccountIds.has(row.accountId);
                  const hint = loanHint(row);
                  return (
                    <div
                      key={row.accountId}
                      className={cn(
                        "rounded-xl border p-4 shadow-sm transition-colors",
                        isChecked
                          ? "border-primary/30 bg-primary/5"
                          : "border-gray-100 bg-white",
                        disabled ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                      onClick={() => toggle(row)}
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 font-medium">
                            #{index + 1} · {row.memberNo || "—"}
                            {hint ? ` · ${hint}` : ""}
                          </p>
                          <p className="font-semibold text-primary truncate">
                            {row.memberName || "—"}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 select-none shrink-0">
                          <input
                            type="checkbox"
                            aria-label={`Collect ${row.memberName}`}
                            checked={isChecked}
                            disabled={disabled}
                            readOnly
                            className="h-4 w-4 rounded border-input text-primary focus:ring-ring pointer-events-none"
                          />
                          <span className="text-xs font-semibold text-gray-600">
                            Collect
                          </span>
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Loan Date</p>
                          <p className="font-medium text-gray-800">
                            {formatDate(row.loanDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Loan Amount</p>
                          <p className="font-semibold text-gray-800">
                            {formatMoney(row.loanAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Installment</p>
                          <p className="font-medium text-gray-800">
                            {formatMoney(row.installmentAmt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Balance</p>
                          <p className="font-semibold text-primary">
                            {formatMoney(row.balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetailsSection;
