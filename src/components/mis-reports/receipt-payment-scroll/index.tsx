"use client";

import { AlertCircle, Download, FileSpreadsheet, Loader2, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import DropdownField from "@/common/formFields/DropdownField";
import MisReportFilter, { MIS_REPORT_PRESETS } from "@/common/reportFilters/MisReportFilter";
import {
  ReceiptPaymentDailyTable,
  ReceiptPaymentScrollTable,
} from "@/common/reportTables/ReceiptPaymentScrollTable";
import ReceiptPaymentScrollPrint from "./ReceiptPaymentScrollPrint";
import {
  exportReceiptPaymentScrollCsv,
  exportReceiptPaymentScrollExcel,
} from "./exportReceiptPaymentScrollExcel";
import type { ReceiptPaymentScrollProps } from "@/container/mis-reports/receipt-payment-scroll/ReceiptPaymentScrollType";

const typeOptions = [
  { label: "Receipt & Payment", value: "all" },
  { label: "Receipt Only", value: "receipt" },
  { label: "Payment Only", value: "payment" },
];

const formatAmount = (value: number | undefined | null) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (value: string) => {
  const [year, month, day] = (value || "").split("-");
  return year && month && day ? `${day}-${month}-${year}` : value || "-";
};

const ReceiptPaymentScrollComponent = ({
  form,
  loading,
  isHead,
  branchName,
  branchOptions,
  branchLoading,
  sahayikaOptions,
  sahayikaLoading,
  report,
  error,
  onShow,
  onPreset,
  activePreset,
  view,
  onViewChange,
  onPageChange,
  onPerPageChange,
}: ReceiptPaymentScrollProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt_Payment_Scroll_${report?.summary.branchName || "Branch"}_${report?.summary.monthName || "Month"}_${report?.summary.year || "2026"}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 4mm 5mm 5mm 5mm;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
          color: #000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .month-sheet-page {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
          page-break-after: always !important;
          break-after: page !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        .month-sheet-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
      }
    `,
  });

  const summary = report?.summary;
  const pagination = report?.pagination;

  return (
    <>
      <div className="page-content print:hidden">
        {/* Page Top Header Bar */}
        <div className="page-header-card">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
          <div className="flex min-w-0 items-start gap-3 pl-2 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <FileSpreadsheet size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                MIS Report <span className="text-gray-300">›</span> Receipt Payment Scroll
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-primary">Receipt Payment Scroll</h2>
              <p className="mt-1 text-sm text-gray-500">
                {summary
                  ? `${summary.branchName} · ${formatDate(summary.fromDate)} – ${formatDate(summary.toDate)} · ${summary.voucherCount} vouchers`
                  : "Track receipts, payments and running cash balance"}
              </p>
            </div>
          </div>
          <div className="z-10 flex w-full flex-col gap-2.5 pl-2 sm:flex-row xl:w-auto xl:pl-0">
            <Button
              type="button"
              variant="outline"
              disabled={!report}
              onClick={() => report && exportReceiptPaymentScrollExcel(report)}
              className="h-11 gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <FileSpreadsheet size={16} /> Export Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!report}
              onClick={() => report && exportReceiptPaymentScrollCsv(report)}
              className="h-11 gap-2"
            >
              <Download size={16} /> Export CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!report}
              onClick={() => handlePrint()}
              className="h-11 gap-2"
            >
              <Printer size={16} /> Print / PDF
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Form {...form}>
          <MisReportFilter
            control={form.control}
            isHead={isHead}
            branchName={branchName}
            branchOptions={branchOptions}
            branchLoading={branchLoading}
            loading={loading}
            onSubmit={form.handleSubmit(onShow)}
            fromName="fromDate"
            toName="toDate"
            branchNameField="reportBranchId"
            onBranchChange={() => form.setValue("sahayikaId", "")}
            presets={MIS_REPORT_PRESETS}
            activePreset={activePreset}
            onPreset={onPreset}
          >
            <DropdownField
              control={form.control}
              name="sahayikaId"
              label="Sahayika / C.O."
              options={sahayikaOptions}
              optionLabelKey="label"
              optionValueKey="value"
              disableSorting
              disabled={sahayikaLoading}
            />
            <DropdownField
              control={form.control}
              name="scrollType"
              label="Scroll Type"
              options={typeOptions}
              optionLabelKey="label"
              optionValueKey="value"
              disableSorting
            />
          </MisReportFilter>
        </Form>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {error}
          </div>
        )}

        {/* Unbalanced Vouchers Banner */}
        {summary && summary.unbalancedVoucherCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>
              <strong>Unbalanced Vouchers:</strong> {summary.unbalancedVoucherCount} voucher(s) with difference totaling ₹{formatAmount(summary.unbalancedAmount)}.
            </span>
          </div>
        )}

        {/* Summary Metric Cards */}
        {summary && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:border-gray-200 transition-colors">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Opening Cash</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                ₹{formatAmount(summary.openingCash)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:border-gray-200 transition-colors">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Total Receipts</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-blue-700">
                ₹{formatAmount(summary.totalReceipts)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:border-gray-200 transition-colors">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Total Payments</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-amber-700">
                ₹{formatAmount(summary.totalPayments)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:border-gray-200 transition-colors">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Closing Cash in Hand</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-emerald-700 font-extrabold">
                ₹{formatAmount(summary.closingCash)}
              </p>
            </div>
          </div>
        )}

        {/* Standard DataTable Section */}
        <div className="page-body-card overflow-hidden">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {view === "transactions" ? "Transaction Ledger" : "Daily Branch Scroll"}
              </h3>
              <p className="text-sm text-gray-500">
                {pagination && report?.view === view
                  ? `Showing ${pagination.from ?? 0} – ${pagination.to ?? 0} of ${pagination.total} records`
                  : "Choose filters and select Show"}
              </p>
            </div>

            {/* View Selector Pills */}
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              <div className="flex items-center rounded-lg bg-gray-100 p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => onViewChange("transactions")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    view === "transactions"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Transactions
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange("daily")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    view === "daily"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Daily Scroll
                </button>
              </div>
            </div>
          </div>

          {/* Table display */}
          {report && report.view === view ? (
            view === "transactions" ? (
              <ReceiptPaymentScrollTable rows={report.rows} pagination={report.pagination} loading={loading} onPageChange={onPageChange} onPerPageChange={onPerPageChange} />
            ) : (
              <ReceiptPaymentDailyTable rows={report.dailyRows} pagination={report.pagination} loading={loading} onPageChange={onPageChange} onPerPageChange={onPerPageChange} />
            )
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
              {loading ? "Loading scroll..." : "No report loaded."}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print / PDF Render Target (Uses the given template structure) */}
      <ReceiptPaymentScrollPrint printRef={printRef} report={report} />
    </>
  );
};

export default ReceiptPaymentScrollComponent;
