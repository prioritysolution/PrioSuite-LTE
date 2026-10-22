"use client";

import React from "react";
import { Control } from "react-hook-form";
import { Banknote, Eraser, Loader2, Save, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputField from "@/common/formFields/InputField";
import { cn } from "@/lib/utils";
import type {
  CollectionTotals,
  LoanCollectionForm,
  PaymentEntryField,
  PaymentEntryRow,
} from "@/container/loan-entry/loan-collection/LoanCollectionType";

interface PaymentEntrySectionProps {
  control: Control<LoanCollectionForm>;
  entries: PaymentEntryRow[];
  rowErrors: Record<number, string>;
  totals: CollectionTotals;
  saving: boolean;
  isSplitting: boolean;
  saveDisabled: boolean;
  onEntryChange: (
    accountId: number,
    field: PaymentEntryField,
    value: string,
  ) => void;
  onRemoveEntry: (accountId: number) => void;
  onClear: () => void;
}

const formatMoney = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SplitValue = ({ entry, value }: { entry: PaymentEntryRow; value: number }) =>
  entry.splitPending ? (
    <Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" />
  ) : (
    <span>{formatMoney(value)}</span>
  );

const PaymentEntrySection = ({
  control,
  entries,
  rowErrors,
  totals,
  saving,
  isSplitting,
  saveDisabled,
  onEntryChange,
  onRemoveEntry,
  onClear,
}: PaymentEntrySectionProps) => {
  const amountInput = (entry: PaymentEntryRow, field: PaymentEntryField) => (
    <Input
      inputMode="decimal"
      value={entry[field]}
      disabled={saving}
      aria-label={`${field === "amount" ? "Amount" : "Penal"} for ${entry.memberName}`}
      aria-invalid={!!rowErrors[entry.accountId]}
      onChange={(event) =>
        onEntryChange(entry.accountId, field, event.target.value)
      }
      className="h-9 text-right tabular-nums"
    />
  );

  const totalsLabel = `Total (${totals.count} ${totals.count === 1 ? "loan" : "loans"} / ${totals.memberCount} ${totals.memberCount === 1 ? "member" : "members"})`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Banknote size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg">
              Payment Entry
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Cash collection · one row per checked loan
            </p>
          </div>
        </div>
        {isSplitting && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating...
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 lg:p-6 space-y-5">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-[120px] rounded-xl border border-dashed border-gray-200 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              Check members in the grid above to add their loans here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-100">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/5">
                      <TableHead className="min-w-[180px] font-bold text-primary">
                        Member
                      </TableHead>
                      <TableHead className="min-w-[80px] font-bold text-primary">
                        Acct
                      </TableHead>
                      <TableHead className="min-w-[110px] text-right font-bold text-primary">
                        Balance
                      </TableHead>
                      <TableHead className="w-[140px] text-right font-bold text-primary">
                        Amount <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="min-w-[110px] text-right font-bold text-primary">
                        Principal
                      </TableHead>
                      <TableHead className="min-w-[110px] text-right font-bold text-primary">
                        Interest
                      </TableHead>
                      <TableHead className="w-[120px] text-right font-bold text-primary">
                        Penal
                      </TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const error = rowErrors[entry.accountId];
                      return (
                        <React.Fragment key={entry.accountId}>
                          <TableRow
                            className={cn(
                              error && "bg-red-50/70 hover:bg-red-50",
                              error && "border-b-0",
                            )}
                          >
                            <TableCell>
                              <p className="font-semibold text-primary truncate">
                                {entry.memberName || "—"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {entry.memberNo || "—"}
                              </p>
                            </TableCell>
                            <TableCell className="text-gray-700 whitespace-nowrap">
                              {entry.accountNo || "N/A"}
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-800 tabular-nums">
                              {formatMoney(entry.balance)}
                            </TableCell>
                            <TableCell>{amountInput(entry, "amount")}</TableCell>
                            <TableCell className="text-right text-gray-700 tabular-nums">
                              <SplitValue entry={entry} value={entry.principal} />
                            </TableCell>
                            <TableCell className="text-right text-gray-700 tabular-nums">
                              <SplitValue entry={entry} value={entry.interest} />
                            </TableCell>
                            <TableCell>{amountInput(entry, "penal")}</TableCell>
                            <TableCell className="text-center">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => onRemoveEntry(entry.accountId)}
                                aria-label={`Remove ${entry.memberName}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none"
                              >
                                <X size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                          {error && (
                            <TableRow className="bg-red-50/70 hover:bg-red-50">
                              <TableCell
                                colSpan={8}
                                className="pt-0 pb-2 text-xs font-medium text-red-600"
                              >
                                {error}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-gray-50 hover:bg-gray-50 font-bold">
                      <TableCell colSpan={3} className="text-gray-700">
                        {totalsLabel}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(totals.collAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(totals.prnAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(totals.inttAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(totals.penalAmount)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {entries.map((entry) => {
                const error = rowErrors[entry.accountId];
                return (
                  <div
                    key={entry.accountId}
                    className={cn(
                      "rounded-xl border p-4 shadow-sm",
                      error ? "border-red-200 bg-red-50/60" : "border-gray-100 bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">
                          {entry.memberNo || "—"} · Acct {entry.accountNo || "N/A"}
                        </p>
                        <p className="font-semibold text-primary truncate">
                          {entry.memberName || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Balance {formatMoney(entry.balance)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => onRemoveEntry(entry.accountId)}
                        aria-label={`Remove ${entry.memberName}`}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">
                          Amount <span className="text-red-500">*</span>
                        </p>
                        {amountInput(entry, "amount")}
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Penal</p>
                        {amountInput(entry, "penal")}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Principal</p>
                        <div className="font-medium text-gray-800">
                          <SplitValue entry={entry} value={entry.principal} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Interest</p>
                        <div className="font-medium text-gray-800">
                          <SplitValue entry={entry} value={entry.interest} />
                        </div>
                      </div>
                    </div>
                    {error && (
                      <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
                    )}
                  </div>
                );
              })}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm md:col-span-2">
                <p className="font-bold text-gray-700">{totalsLabel}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 tabular-nums">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-right font-semibold">{formatMoney(totals.collAmount)}</span>
                  <span className="text-gray-500">Principal</span>
                  <span className="text-right font-semibold">{formatMoney(totals.prnAmount)}</span>
                  <span className="text-gray-500">Interest</span>
                  <span className="text-right font-semibold">{formatMoney(totals.inttAmount)}</span>
                  <span className="text-gray-500">Penal</span>
                  <span className="text-right font-semibold">{formatMoney(totals.penalAmount)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-xs">
            <InputField
              control={control}
              name="refVoucherNo"
              label="Ref Voucher No"
              placeholder="Enter ref voucher no"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={saving || entries.length === 0}
              className="h-12 px-8 font-bold text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 w-full sm:w-auto"
            >
              <Eraser size={18} />
              Clear
            </Button>
            <Button
              type="submit"
              disabled={saveDisabled}
              className="bg-primary hover:bg-primary/90 h-12 px-10 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Save Collection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentEntrySection;
