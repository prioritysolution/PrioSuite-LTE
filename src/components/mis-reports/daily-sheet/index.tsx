"use client";

import React from "react";
import { Download, Loader2, Printer, ScrollText } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { DailySheetProps } from "@/container/mis-reports/daily-sheet/DailySheetType";
import {
  formatApiDate,
  formatSheetAmount,
  formatSheetMoney,
} from "@/container/mis-reports/daily-sheet/DailySheetApi";
import { DailySheetColumns, DailySheetGrid } from "./DailySheetTables";
import DailySheetDetailsDialog from "./DailySheetDetailsDialog";
import DailySheetPrint from "./DailySheetPrint";

const downloadSheet = (report: NonNullable<DailySheetProps["report"]>) => {
  const { summary, receipts, payments } = report;
  const lines = [
    ["Side", "Particulars", "Cash", "Transfer", "Total"],
    ["Receipt", "To Opening Cash", "", "", String(summary.openingCash)],
    ...receipts.map((row) => [
      "Receipt",
      row.ledgerName,
      String(row.cash),
      String(row.transfer),
      String(row.total),
    ]),
    [
      "Receipt",
      "Total",
      String(summary.recCash),
      String(summary.recTrf),
      String(summary.grandRecTotal),
    ],
    ...payments.map((row) => [
      "Payment",
      row.ledgerName,
      String(row.cash),
      String(row.transfer),
      String(row.total),
    ]),
    ["Payment", "By Closing Cash", "", "", String(summary.closingCash)],
    [
      "Payment",
      "Total",
      String(summary.payCash),
      String(summary.payTrf),
      String(summary.grandPayTotal),
    ],
  ];
  const csv = lines
    .map((line) =>
      line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `daily-sheet-${summary.fromDate}-to-${summary.toDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const SummaryCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
      {label}
    </p>
    <p className="mt-1 text-lg font-bold text-gray-900 tabular-nums">{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

const DailySheetComponent = ({
  form,
  loading,
  isHead,
  branchName,
  branchOptions,
  branchLoading,
  report,
  view,
  drillAllowed,
  onShow,
  onViewChange,
  onOpenLedger,
  onOpenAll,
  detailsOpen,
  detailsTitle,
  detailsLoading,
  detailsRows,
  showBranchColumn,
  onDetailsOpenChange,
}: DailySheetProps) => {
  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page { size: A4 landscape; margin: 6mm 6mm 10mm 6mm; }
      @media print {
        html, body { margin: 0 !important; padding: 0 !important; }
      }
    `,
  });
  const summary = report?.summary;
  const noTransactions = /no transaction/i.test(report?.message || "");

  return (
    <>
      <div className="page-content print:hidden">
        <div className="page-header-card">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
          <div className="flex min-w-0 items-start gap-3 pl-2 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <ScrollText size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                MIS Report <span className="text-gray-300">›</span> Daily Sheet
              </p>
              <h2 className="truncate text-2xl font-bold tracking-tight text-primary">
                Daily Sheet
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {summary
                  ? `${summary.branchName} · ${formatApiDate(summary.fromDate)}${
                      summary.fromDate !== summary.toDate
                        ? ` – ${formatApiDate(summary.toDate)}`
                        : ""
                    } · ${summary.voucherCount} voucher${
                      summary.voucherCount === 1 ? "" : "s"
                    }`
                  : "Opening cash, receipts, payments and closing cash"}
              </p>
            </div>
          </div>
          <div className="z-10 flex w-full flex-col gap-2.5 pl-2 sm:flex-row xl:w-auto xl:pl-0">
            <Button
              type="button"
              variant="outline"
              disabled={!report}
              onClick={() => report && downloadSheet(report)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold"
            >
              <Download size={16} />
              Export
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!report}
              onClick={() => handlePrint()}
              className="flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold"
            >
              <Printer size={16} />
              Print
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onShow)} className="page-body-card">
            <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
              {isHead ? (
                <DropdownField
                  control={form.control}
                  name="reportBranchId"
                  label="Branch"
                  options={branchOptions}
                  optionLabelKey="label"
                  optionValueKey="value"
                  disableSorting
                  loading={branchLoading}
                  searchPlaceholder="Select branch..."
                />
              ) : (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Branch</p>
                  <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-800">
                    {branchName}
                  </div>
                </div>
              )}
              <DatePicker
                control={form.control}
                name="fromDate"
                label="From"
                dateFormat="dd-MM-yyyy"
                showCurrentDate
              />
              <DatePicker
                control={form.control}
                name="toDate"
                label="To"
                dateFormat="dd-MM-yyyy"
                showCurrentDate
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-10 bg-primary font-semibold text-white hover:bg-primary/90"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Show"}
              </Button>
            </div>
          </form>
        </Form>

        {summary && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Opening Cash"
              value={formatSheetMoney(summary.openingCash)}
            />
            <SummaryCard
              label="Receipts"
              value={formatSheetMoney(summary.recTotal)}
              hint={`Cash ${formatSheetAmount(summary.recCash)} · Transfer ${formatSheetAmount(summary.recTrf)}`}
            />
            <SummaryCard
              label="Payments"
              value={formatSheetMoney(summary.payTotal)}
              hint={`Cash ${formatSheetAmount(summary.payCash)} · Transfer ${formatSheetAmount(summary.payTrf)}`}
            />
            <SummaryCard
              label="Closing Cash"
              value={formatSheetMoney(summary.closingCash)}
            />
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              {summary && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    summary.isTallied
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {summary.isTallied ? "Tallied" : "Not tallied"}
                </span>
              )}
              {!drillAllowed && (
                <span className="text-xs font-medium text-amber-700">
                  Select up to 31 days to view vouchers
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-gray-200 p-0.5">
                <button
                  type="button"
                  onClick={() => onViewChange("sheet")}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    view === "sheet" ? "bg-primary text-white" : "text-gray-600"
                  }`}
                >
                  Sheet
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange("grid")}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    view === "grid" ? "bg-primary text-white" : "text-gray-600"
                  }`}
                >
                  Grid
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={!report || !drillAllowed || loading}
                onClick={onOpenAll}
                className="h-9"
              >
                View all vouchers
              </Button>
            </div>
          </div>

          {summary && summary.unbalancedVoucherCount > 0 && (
            <div className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <span>
                {summary.unbalancedVoucherCount} voucher(s) have debit ≠ credit (
                {formatSheetMoney(summary.unbalancedAmount)}).
              </span>
              <button
                type="button"
                disabled={!drillAllowed}
                onClick={() => onOpenLedger(0, "Unbalanced Voucher Difference")}
                className="font-semibold underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              >
                View
              </button>
            </div>
          )}

          {loading && !report ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading daily sheet...
            </div>
          ) : !report ? (
            <p className="py-16 text-center text-sm text-gray-500">
              Choose a date and select Show.
            </p>
          ) : noTransactions ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No transactions in this period
            </p>
          ) : view === "grid" ? (
            <DailySheetGrid
              summary={summary!}
              ledgers={report.ledgers}
              drillAllowed={drillAllowed}
              onOpenLedger={onOpenLedger}
            />
          ) : (
            <DailySheetColumns
              summary={summary!}
              receipts={report.receipts}
              payments={report.payments}
              drillAllowed={drillAllowed}
              onOpenLedger={onOpenLedger}
            />
          )}
        </div>
      </div>

      <DailySheetPrint printRef={printRef} report={report} />
      <DailySheetDetailsDialog
        open={detailsOpen}
        title={detailsTitle}
        loading={detailsLoading}
        rows={detailsRows}
        showBranchColumn={showBranchColumn}
        onOpenChange={onDetailsOpenChange}
      />
    </>
  );
};

export default DailySheetComponent;
