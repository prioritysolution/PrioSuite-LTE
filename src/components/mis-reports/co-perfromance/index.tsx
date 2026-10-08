"use client";

import React from "react";
import { Download, Loader2, Printer, Trophy } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import {
  CoPerformanceProps,
  LayoutView,
} from "@/container/mis-reports/co-perfromance/CoPerformanceType";
import {
  formatAmount,
  formatApiDate,
  formatMoney,
  formatPct,
} from "@/container/mis-reports/co-perfromance/CoPerformanceApi";
import CoPerformanceTable, { gradeClass } from "./CoPerformanceTable";
import CoPerformanceCards from "./CoPerformanceCards";
import CoPerformanceChart from "./CoPerformanceChart";
import CoPerformancePrint from "./CoPerformancePrint";

const layouts: { id: LayoutView; label: string }[] = [
  { id: "table", label: "Table" },
  { id: "cards", label: "Cards" },
  { id: "trend", label: "Trend" },
];

const Card = ({
  label,
  value,
  hint,
  extra,
}: {
  label: string;
  value: string;
  hint: string;
  extra?: React.ReactNode;
}) => (
  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</p>
    <div className="mt-1 flex items-center gap-2">
      <p className="text-lg font-bold tabular-nums text-gray-900">{value}</p>
      {extra}
    </div>
    <p className="mt-1 text-xs text-gray-500">{hint}</p>
  </div>
);

const downloadCsv = (report: NonNullable<CoPerformanceProps["report"]>) => {
  const { summary } = report;
  const header = ["Rank", "Name", "Disbursed", "Outstanding", "Net Demand", "Collection", "Coll %", "PAR %", "Grade"];
  const body =
    report.view === "month"
      ? report.monthRows.map((row) => [row.monthName, "", row.disbAmount, "", row.demandAmount, row.collAmount, row.collVsDuePct ?? "", "", ""])
      : report.rows.map((row) => [
          row.perfRank ?? "",
          row.keyName,
          row.disbAmount,
          row.outstanding,
          row.netDemand,
          row.collAmount,
          row.collPct ?? "",
          row.parPct ?? "",
          row.grade ?? "",
        ]);
  const lines = [
    header,
    ...body,
    ["", "Total", summary.disbAmount, summary.outstanding, summary.netDemand, summary.collAmount, summary.collPct ?? "", summary.parPct ?? "", summary.grade ?? ""],
  ];
  const csv = lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `co-performance-${summary.fromDate}-to-${summary.toDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const CoPerformanceComponent = (props: CoPerformanceProps) => {
  const {
    form,
    loading,
    isHead,
    branchName,
    branchOptions,
    sahayikaOptions,
    branchLoading,
    sahayikaLoading,
    sahayikaDisabled,
    report,
    layout,
    crumbs,
    onShow,
    onPreset,
    onLayout,
    onDrill,
    onCrumb,
    onBranchChange,
  } = props;
  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `@page { size: A4 landscape; margin: 8mm 8mm 12mm 8mm; }`,
  });
  const summary = report?.summary;
  const empty = /no data/i.test(report?.message || "") && !(report?.rows.length);
  const filterText = crumbs.map((crumb) => crumb.label).join(" / ");
  const collWidth = Math.max(0, Math.min(summary?.collPct ?? 0, 100));

  return (
    <>
      <div className="page-content print:hidden">
        <div className="page-header-card">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
          <div className="flex min-w-0 items-start gap-3 pl-2 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <Trophy size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                MIS Report <span className="text-gray-300">›</span> CO Performance
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-primary">CO Performance</h2>
              <p className="mt-1 text-sm text-gray-500">
                {summary
                  ? `${summary.branchName} · ${formatApiDate(summary.fromDate)} – ${formatApiDate(summary.toDate)} · ${summary.sahayikaCount} Sahayika`
                  : "Compare Sahayika outreach, collection and portfolio risk"}
              </p>
            </div>
          </div>
          <div className="z-10 flex w-full flex-col gap-2.5 pl-2 sm:flex-row xl:w-auto xl:pl-0">
            <Button type="button" variant="outline" disabled={!report} onClick={() => report && downloadCsv(report)} className="h-11 gap-2">
              <Download size={16} /> Export
            </Button>
            <Button type="button" variant="outline" disabled={!report} onClick={() => handlePrint()} className="h-11 gap-2">
              <Printer size={16} /> Print
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onShow)} className="page-body-card space-y-4">
            <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-5">
              <DatePicker control={form.control} name="fromDate" label="From" dateFormat="dd-MM-yyyy" />
              <DatePicker control={form.control} name="toDate" label="To" dateFormat="dd-MM-yyyy" />
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
                  onChange={onBranchChange}
                />
              ) : (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Branch</p>
                  <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium">
                    {branchName}
                  </div>
                </div>
              )}
              <DropdownField
                control={form.control}
                name="coId"
                label="Sahayika"
                options={sahayikaOptions}
                optionLabelKey="label"
                optionValueKey="value"
                disableSorting
                loading={sahayikaLoading}
                disabled={sahayikaDisabled}
              />
              <Button type="submit" disabled={loading} className="h-10 bg-primary font-semibold text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Show"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => onPreset("month")}>This Month</Button>
              <Button type="button" variant="outline" onClick={() => onPreset("lastMonth")}>Last Month</Button>
              <Button type="button" variant="outline" onClick={() => onPreset("quarter")}>This Quarter</Button>
              <Button type="button" variant="outline" onClick={() => onPreset("fy")}>This Financial Year</Button>
            </div>
          </form>
        </Form>

        {summary && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Card
                label="Active Loans"
                value={String(summary.activeLoanCount)}
                hint={`${summary.activeMemberCount} members · ${summary.activeGroupCount} groups`}
              />
              <Card
                label="Disbursed"
                value={formatMoney(summary.disbAmount)}
                hint={`${summary.disbCount} loans · avg ${summary.avgLoanSize === null ? "–" : formatAmount(summary.avgLoanSize)}`}
              />
              <Card
                label="Outstanding"
                value={formatMoney(summary.outstanding)}
                hint={`Overdue ${formatAmount(summary.overdueAmount)}`}
              />
              <Card
                label="Coll. %"
                value={formatPct(summary.collPct)}
                hint="Collected against net demand"
                extra={
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${gradeClass(summary.grade)}`}>
                    {summary.grade || "–"}
                  </span>
                }
              />
              <Card
                label="PAR %"
                value={formatPct(summary.parPct)}
                hint={`> 90 days ${formatAmount(summary.parAbove90)}`}
              />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-primary" style={{ width: `${collWidth}%` }} />
            </div>
            <p className="text-xs text-gray-500">
              New groups {summary.newGroupCount} · New members {summary.newMemberCount} · Closed loans {summary.closedLoanCount}
            </p>
          </>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              {layouts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={loading}
                  onClick={() => onLayout(item.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    layout === item.id ? "bg-primary text-white" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1 text-sm">
              {crumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.level}-${crumb.label}`}>
                  {index > 0 && <span className="text-gray-300">›</span>}
                  <button type="button" className="font-semibold text-primary" onClick={() => onCrumb(crumb.level)}>
                    {crumb.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {loading && !report ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading report...
            </div>
          ) : !report ? (
            <p className="py-16 text-center text-sm text-gray-500">Choose a period and select Show.</p>
          ) : empty ? (
            <p className="py-16 text-center text-sm text-gray-500">No loan activity for the selected period.</p>
          ) : layout === "trend" || report.view === "month" ? (
            <CoPerformanceChart rows={report.monthRows} />
          ) : layout === "cards" ? (
            <CoPerformanceCards rows={report.rows} canDrill={report.view === "sahayika"} onDrill={onDrill} />
          ) : (
            <CoPerformanceTable
              summary={summary!}
              rows={report.rows}
              grouped={report.view === "sahayika" && summary?.branchId === 0}
              nameHeader={report.view === "group" ? "Group" : "Sahayika"}
              canDrill={report.view === "sahayika"}
              onDrill={onDrill}
            />
          )}
        </div>
      </div>
      <CoPerformancePrint printRef={printRef} report={report} filterText={filterText} />
    </>
  );
};

export default CoPerformanceComponent;
