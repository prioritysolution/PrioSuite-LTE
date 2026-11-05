"use client";

import { Download, FileSpreadsheet, FileText, Loader2, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import MisReportFilter, { MIS_REPORT_PRESETS } from "@/common/reportFilters/MisReportFilter";
import AccountStatementTable from "@/common/reportTables/AccountStatementTable";
import type { MonthlyStatementProps } from "@/container/mis-reports/monthly-statement-of-accounts/MonthlyStatementType";
import {
  formatStatementAmountWithZero,
  formatStatementDate,
} from "@/container/mis-reports/monthly-statement-of-accounts/MonthlyStatementApi";
import MonthlyStatementPrint from "./MonthlyStatementPrint";
import {
  exportMonthlyStatementToCsv,
  exportMonthlyStatementToExcel,
} from "./exportMonthlyStatementExcel";

const MonthlyStatementComponent = (props: MonthlyStatementProps) => {
  const {
    form,
    loading,
    isHead,
    branchName,
    branchOptions,
    branchLoading,
    branchError,
    report,
    error,
    onShow,
    onPreset,
    activePreset,
  } = props;

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: "@page { size: A4 portrait; margin: 6mm; }",
  });

  const summary = report?.summary;

  return (
    <>
      <div className="page-content print:hidden">
        {/* Header Card */}
        <div className="page-header-card">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
          <div className="flex min-w-0 items-start gap-3 pl-2 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <FileSpreadsheet size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                MIS Report <span className="text-gray-300">›</span> Monthly Statement of Accounts
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                Monthly Statement of Accounts
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {summary
                  ? `${summary.branchName} · ${formatStatementDate(summary.fromDate)} – ${formatStatementDate(summary.toDate)}`
                  : "Receipts and payments ledger with previous, current and cumulative amounts"}
              </p>
            </div>
          </div>
          <div className="z-10 flex w-full flex-col gap-2.5 pl-2 sm:flex-row xl:w-auto xl:pl-0">
            <Button
              type="button"
              variant="outline"
              disabled={!report || loading}
              onClick={() => report && exportMonthlyStatementToExcel(report)}
              className="h-11 gap-2"
            >
              <Download size={16} /> Export Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!report || loading}
              onClick={() => report && exportMonthlyStatementToCsv(report)}
              className="h-11 gap-2"
            >
              <FileText size={16} /> Export CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!report || loading}
              onClick={() => handlePrint()}
              className="h-11 gap-2"
            >
              <Printer size={16} /> Print / PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
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
            presets={MIS_REPORT_PRESETS}
            activePreset={activePreset}
            onPreset={onPreset}
          />
        </Form>

        {(error || branchError) && (
          <div
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {[error, branchError].filter(Boolean).join(" ")}
          </div>
        )}

        {report && report.warnings.length > 0 && (
          <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Configuration review required</p>
            <ul className="mt-1 list-disc pl-5">{report.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
          </div>
        )}

        {/* Summary Metric Cards */}
        {summary && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Receipts (This Period)
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-emerald-700">
                ₹{formatStatementAmountWithZero(summary.totalReceiptsCurrent)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Payments (This Period)
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-blue-700">
                ₹{formatStatementAmountWithZero(summary.totalPaymentsCurrent)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Closing Cash in Hand
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
                ₹{formatStatementAmountWithZero(summary.closingCash)}
              </p>
              <p className="mt-1 text-xs text-gray-500">Bank: ₹{formatStatementAmountWithZero(summary.closingBank)}</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Status
              </p>
              <div className={`mt-1 text-base font-bold ${summary.reconciled ? "text-emerald-700" : "text-amber-700"}`}>
                <span>{summary.status || (summary.reconciled ? "Reconciled" : "Unreconciled")}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">Difference: ₹{formatStatementAmountWithZero(summary.reconciliationDifference)}</p>
            </div>
          </div>
        )}

        {/* Body Card with Screen Table */}
        <div className="page-body-card overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Statement</h3>
              <p className="text-sm text-gray-500">
                {report
                  ? `${summary?.branchName} · Receipts & Payments Balance Sheet`
                  : "Choose a period and select Show"}
              </p>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>

          {report?.rows.length ? (
            <>
              <p className="mb-1 text-sm font-semibold text-gray-800">{report.organizationName}</p>
              {report.organizationAddress && <p className="mb-1 text-xs text-gray-600">{report.organizationAddress}</p>}
              <p className="mb-2 text-xs text-gray-600">Financial year: {formatStatementDate(report.financialYear.from || "")} – {formatStatementDate(report.financialYear.to || "")}</p>
              <p className="mb-3 text-xs text-gray-600">
                Previous: {report.columns.previous.from ? `${formatStatementDate(report.columns.previous.from)} – ${formatStatementDate(report.columns.previous.to || "")}` : "No previous period"} · Period: {formatStatementDate(report.columns.period.from || "")} – {formatStatementDate(report.columns.period.to || "")} · Cumulative: {formatStatementDate(report.columns.cumulative.from || "")} – {formatStatementDate(report.columns.cumulative.to || "")}
              </p>
              <AccountStatementTable rows={report.rows} summary={report.summary} />
              <p className="mt-3 text-xs text-gray-600">Vouchers: {report.summary.voucherCount} · Unbalanced: {report.summary.unbalancedVoucherCount} (₹{formatStatementAmountWithZero(report.summary.unbalancedAmount)}) · Invalid lines: {report.summary.invalidLineCount}</p>
              <details className="mt-4 rounded-lg border border-gray-200 p-3 text-sm">
                <summary className="cursor-pointer font-semibold text-gray-800">Ledger breakdown ({report.ledgerBreakdown.length})</summary>
                {report.ledgerBreakdown.length ? <div className="mt-3 space-y-2">{report.ledgerBreakdown.map((ledger, index) => <div key={index} className="rounded bg-slate-50 p-3"><dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(ledger).map(([key, value]) => <div key={key}><dt className="inline text-gray-500">{key.replaceAll("_", " ")}: </dt><dd className="inline text-gray-900">{value == null ? "–" : typeof value === "number" && /amount/i.test(key) ? formatStatementAmountWithZero(value) : String(value)}</dd></div>)}</dl></div>)}</div> : <p className="mt-2 text-gray-500">No ledger activity for this period.</p>}
              </details>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
              {loading ? "Loading statement..." : "Select a period and choose Show."}
            </div>
          )}
        </div>
      </div>

      {/* Physical Sheet Print / PDF Component */}
      <MonthlyStatementPrint printRef={printRef} report={report} />
    </>
  );
};

export default MonthlyStatementComponent;
