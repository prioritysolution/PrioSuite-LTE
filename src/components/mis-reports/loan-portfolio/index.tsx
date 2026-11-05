"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useReactToPrint } from "react-to-print";
import { Download, FileSpreadsheet, Layers3, Loader2, Printer } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import DropdownField from "@/common/formFields/DropdownField";
import MisReportFilter, { MIS_REPORT_PRESETS } from "@/common/reportFilters/MisReportFilter";
import LoanPortfolioTable from "@/common/reportTables/LoanPortfolioTable";
import { formatPortfolioValue } from "@/container/mis-reports/loan-portfolio/LoanPortfolioApi";
import type { LoanPortfolioData, LoanPortfolioProps } from "@/container/mis-reports/loan-portfolio/LoanPortfolioType";
import LoanPortfolioPrint from "./LoanPortfolioPrint";
import { exportLoanPortfolioCsv, exportLoanPortfolioExcel } from "./exportLoanPortfolioExcel";

const viewOptions = [
  { label: "Branch and Sahayika", value: "branch" }, { label: "Branch summary", value: "branch_summary" },
  { label: "Sahayika", value: "sahayika" }, { label: "Group", value: "group" },
  { label: "Village", value: "village" }, { label: "Member / loan account", value: "member" },
];
const metrics = [
  ["Active loans", "Active_Loanee_Count", false], ["Disbursed (period)", "Period_Disbursement", true],
  ["Total outstanding", "Total_Outstanding", true], ["Realisable (including arrears)", "Cumulative_Realisable", true],
  ["Collection", "Total_Collection", true], ["Collection % against demand", "Collection_Pct", false],
  ["Default / overdue", "Default_Amount", true], ["Closing outstanding", "Closing_Outstanding", true],
] as const;

const LoanPortfolioComponent = ({ form, loading, exporting, isHead, branchName, branchOptions, branchLoading, sahayikaOptions, sahayikaLoading, report, error, dropdownError, onShow, onBranchChange, onPreset, activePreset, onPageChange, onPerPageChange, prepareExport }: LoanPortfolioProps) => {
  const [printReport, setPrintReport] = useState<LoanPortfolioData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({ contentRef: printRef, documentTitle: "Loan_Portfolio_Analysis" });
  const handleExport = async (kind: "excel" | "csv" | "print") => {
    const complete = await prepareExport();
    if (!complete) return;
    if (kind === "excel") exportLoanPortfolioExcel(complete);
    else if (kind === "csv") exportLoanPortfolioCsv(complete);
    else { flushSync(() => setPrintReport(complete)); print(); }
  };
  const busy = loading || exporting;
  return <>
    <div className="page-content print:hidden">
      <div className="page-header-card">
        <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
        <div className="flex min-w-0 items-start gap-3 pl-2">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white"><Layers3 size={24} /></div>
          <div><p className="text-sm font-medium text-gray-500">MIS Report › Loan Portfolio Analysis</p><h2 className="text-2xl font-bold text-primary">Loan Portfolio Analysis</h2><p className="mt-1 text-sm text-gray-500">{report ? `${report.organisation.name} · ${String(report.summary.Branch_Name ?? "")} · ${report.query.fromDate} to ${report.query.toDate}` : "Monitor loan accounts, disbursement, demand, collection and defaults"}</p></div>
        </div>
        <div className="z-10 flex flex-wrap gap-2 pl-2">
          <Button type="button" variant="outline" disabled={!report || busy} onClick={() => void handleExport("excel")} className="gap-2"><FileSpreadsheet size={16} /> Export Excel</Button>
          <Button type="button" variant="outline" disabled={!report || busy} onClick={() => void handleExport("csv")} className="gap-2"><Download size={16} /> Export CSV</Button>
          <Button type="button" variant="outline" disabled={!report || busy} onClick={() => void handleExport("print")} className="gap-2"><Printer size={16} /> Print / PDF</Button>
        </div>
      </div>
      <Form {...form}><MisReportFilter control={form.control} isHead={isHead} branchName={branchName} branchOptions={branchOptions} branchLoading={branchLoading} loading={busy} onSubmit={form.handleSubmit(onShow)} fromName="fromDate" toName="toDate" branchNameField="reportBranchId" onBranchChange={(value) => onBranchChange(Number(value) || 0)} presets={MIS_REPORT_PRESETS} activePreset={activePreset} onPreset={onPreset}>
        <DropdownField control={form.control} name="sahayikaId" label="CO / Sahayika" options={sahayikaOptions} optionLabelKey="label" optionValueKey="value" disableSorting loading={sahayikaLoading} />
        <DropdownField control={form.control} name="view" label="Group by" options={viewOptions} optionLabelKey="label" optionValueKey="value" disableSorting allowClear={false} />
      </MisReportFilter></Form>
      {(error || dropdownError) && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{[error, dropdownError].filter(Boolean).join(" ")}</div>}
      {report && report.warnings.length > 0 && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"><p className="font-semibold">Data quality warnings</p><ul className="mt-1 list-disc pl-5">{report.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></div>}
      {report && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, field, currency]) => <div key={field} className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-gray-900">{currency ? "₹" : ""}{formatPortfolioValue(report.summary[field], field)}</p></div>)}</div>}
      <div className="page-body-card overflow-hidden">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-semibold text-gray-900">Loan Portfolio Analysis</h3><p className="text-sm text-gray-500">{report ? `Showing ${report.pagination.from ?? 0} – ${report.pagination.to ?? 0} of ${report.pagination.total} records · ${viewOptions.find((option) => option.value === report.view)?.label}` : "Choose filters and select Show"}</p></div>{busy && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin text-primary" />{exporting ? "Preparing complete report..." : "Loading..."}</div>}</div>
        {report ? <LoanPortfolioTable report={report} loading={busy} onPageChange={onPageChange} onPerPageChange={onPerPageChange} /> : <div className="rounded-lg border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">{loading ? "Loading portfolio..." : "No report loaded."}</div>}
      </div>
    </div>
    <LoanPortfolioPrint printRef={printRef} report={printReport} />
  </>;
};
export default LoanPortfolioComponent;
