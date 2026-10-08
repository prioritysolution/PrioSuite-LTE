"use client";

import React from "react";
import { Download, Loader2, Printer, Scale } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { DemandVsCollectionProps, ReportView } from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionType";
import {
  formatAmount,
  formatApiDate,
  formatMoney,
  formatPct,
} from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionApi";
import DemandVsCollectionTable from "./DemandVsCollectionTable";
import DemandVsCollectionChart from "./DemandVsCollectionChart";
import DemandVsCollectionPrint from "./DemandVsCollectionPrint";

const views: { id: ReportView; label: string; headOnly?: boolean }[] = [
  { id: "branch", label: "Branch", headOnly: true },
  { id: "sahayika", label: "Sahayika" },
  { id: "group", label: "Group" },
  { id: "member", label: "Member" },
  { id: "date", label: "Date" },
];

const pctBar = (value: number | null) => {
  if (value === null) return "bg-gray-300";
  if (value >= 95) return "bg-emerald-500";
  if (value >= 80) return "bg-amber-500";
  return "bg-red-500";
};

const Card = ({
  label,
  value,
  hint,
  valueClass,
  bar,
}: {
  label: string;
  value: string;
  hint: string;
  valueClass?: string;
  bar?: number | null;
}) => (
  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</p>
    <p className={`mt-1 text-lg font-bold tabular-nums ${valueClass || "text-gray-900"}`}>{value}</p>
    <p className="mt-1 text-xs text-gray-500">{hint}</p>
    {bar !== undefined && (
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full ${pctBar(bar)}`}
          style={{ width: `${Math.max(0, Math.min(bar ?? 0, 100))}%` }}
        />
      </div>
    )}
  </div>
);

const downloadCsv = (report: NonNullable<DemandVsCollectionProps["report"]>, view: ReportView) => {
  const { summary } = report;
  const header = ["Name", "Arrear", "Current", "Net", "Collection", "Overdue", "Coll %"];
  const body =
    view === "member"
      ? report.memberRows.map((row) => [
          `${row.memberName} ${row.memberNo}`,
          row.arrearDemand,
          row.currentDemand,
          row.netDemand,
          row.collAmount,
          row.overdueAmount,
          row.collPct ?? "",
        ])
      : view === "date"
        ? report.dateRows.map((row) => [
            row.transDate,
            row.demandAmount,
            "",
            row.cumDemand,
            row.collAmount,
            row.cumCollection,
            "",
          ])
        : report.rows.map((row) => [
            row.keyName,
            row.arrearDemand,
            row.currentDemand,
            row.netDemand,
            row.collAmount,
            row.overdueAmount,
            row.collPct ?? "",
          ]);
  const lines = [
    header,
    ...body,
    ["Total", summary.arrearDemand, summary.currentDemand, summary.netDemand, summary.collAmount, summary.overdueAmount, summary.collPct ?? ""],
  ];
  const csv = lines
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `demand-vs-collection-${summary.fromDate}-to-${summary.toDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const DemandVsCollectionComponent = ({
  form,
  loading,
  isHead,
  branchName,
  branchOptions,
  sahayikaOptions,
  groupOptions,
  branchLoading,
  sahayikaLoading,
  groupLoading,
  sahayikaDisabled,
  groupDisabled,
  report,
  view,
  crumbs,
  onShow,
  onPreset,
  onViewChange,
  onDrill,
  onCrumb,
  onBranchChange,
  onSahayikaChange,
}: DemandVsCollectionProps) => {
  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `@page { size: A4 landscape; margin: 8mm 8mm 12mm 8mm; }`,
  });
  const summary = report?.summary;
  const empty = /no data/i.test(report?.message || "");
  const filterText = crumbs.map((crumb) => crumb.label).join(" / ");

  return (
    <>
      <div className="page-content print:hidden">
        <div className="page-header-card">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
          <div className="flex min-w-0 items-start gap-3 pl-2 sm:gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <Scale size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">
                MIS Report <span className="text-gray-300">›</span> Demand vs Collection
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-primary">Demand vs Collection</h2>
              <p className="mt-1 text-sm text-gray-500">
                {summary
                  ? `${summary.branchName} · ${formatApiDate(summary.fromDate)} – ${formatApiDate(summary.toDate)} · ${summary.accountCount} accounts`
                  : "Compare installment demand with collection and overdue"}
              </p>
            </div>
          </div>
          <div className="z-10 flex w-full flex-col gap-2.5 pl-2 sm:flex-row xl:w-auto xl:pl-0">
            <Button type="button" variant="outline" disabled={!report} onClick={() => report && downloadCsv(report, view)} className="h-11 gap-2">
              <Download size={16} /> Export
            </Button>
            <Button type="button" variant="outline" disabled={!report} onClick={() => handlePrint()} className="h-11 gap-2">
              <Printer size={16} /> Print
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onShow)} className="page-body-card space-y-4">
            <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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
                onChange={onSahayikaChange}
              />
              <DropdownField
                control={form.control}
                name="groupId"
                label="Group"
                options={groupOptions}
                optionLabelKey="label"
                optionValueKey="value"
                disableSorting
                loading={groupLoading}
                disabled={groupDisabled}
              />
              <Button type="submit" disabled={loading} className="h-10 bg-primary font-semibold text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Show"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => onPreset("month")}>This Month</Button>
              <Button type="button" variant="outline" onClick={() => onPreset("lastMonth")}>Last Month</Button>
              <Button type="button" variant="outline" onClick={() => onPreset("fy")}>This Financial Year</Button>
            </div>
          </form>
        </Form>

        {summary && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Card
              label="Net Demand"
              value={formatMoney(summary.netDemand)}
              hint={`Arrear ${formatAmount(summary.arrearDemand)} · Current ${formatAmount(summary.currentDemand)}${
                summary.openingAdvance > 0 ? ` · Advance adj. ${formatAmount(summary.openingAdvance)}` : ""
              }`}
            />
            <Card
              label="Collection"
              value={formatMoney(summary.collAmount)}
              hint={`Arrear ${formatAmount(summary.collArrear)} · Current ${formatAmount(summary.collCurrent)} · Advance ${formatAmount(summary.collAdvance)}`}
            />
            <Card
              label="Overdue"
              value={formatMoney(summary.overdueAmount)}
              valueClass="text-red-600"
              hint={`${summary.overdueAccountCount} accounts`}
            />
            <Card
              label="Coll. %"
              value={formatPct(summary.collPct)}
              hint={summary.collPct === null ? "No net demand" : "Collected against net demand"}
              bar={summary.collPct}
            />
            <Card
              label="Outstanding"
              value={formatMoney(summary.outstanding)}
              hint={`${summary.accountCount} accounts`}
            />
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
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
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              {views
                .filter((item) => !item.headOnly || isHead)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={loading}
                    onClick={() => onViewChange(item.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                      view === item.id ? "bg-primary text-white" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </button>
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
            <p className="py-16 text-center text-sm text-gray-500">
              No demand or collection for the selected period.
            </p>
          ) : view === "date" ? (
            <DemandVsCollectionChart rows={report.dateRows} />
          ) : (
            <DemandVsCollectionTable
              view={view}
              summary={summary!}
              rows={report.rows}
              memberRows={report.memberRows}
              onDrill={onDrill}
            />
          )}
        </div>
      </div>
      <DemandVsCollectionPrint printRef={printRef} report={report} view={view} filterText={filterText} />
    </>
  );
};

export default DemandVsCollectionComponent;
