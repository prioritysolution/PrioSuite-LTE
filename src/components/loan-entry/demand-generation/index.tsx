"use client";

import React from "react";
import { format, isValid } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  Printer,
  Save,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  ALL_SAHAYIKA,
  DemandGenerationProps,
  DemandLevel,
} from "@/container/loan-entry/demand-generation/DemandGenerationType";
import { formatApiDate } from "@/container/loan-entry/demand-generation/DemandGenerationApi";
import DemandGenerationFilterForm from "./DemandGenerationFilterForm";
import DemandGenerationTable, {
  DemandColumn,
  formatDemandAmount,
} from "./DemandGenerationTable";
import DemandGenerationPrint from "./DemandGenerationPrint";
import {
  coColumns,
  emiColumns,
  groupColumns,
  memberColumns,
} from "./DemandReportColumns";

interface ReportView<T> {
  title: string;
  hint: string;
  columns: DemandColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

const asView = <T,>(view: ReportView<T>) =>
  view as unknown as ReportView<unknown>;

const LEVEL_TITLE: Record<DemandLevel, string> = {
  co: "Sahayika-wise Demand",
  group: "Group-wise Demand",
  member: "Member-wise Demand",
  emi: "EMI Detail",
};

const plural = (count: number, word: string) =>
  `${count.toLocaleString("en-IN")} ${word}${count === 1 ? "" : "s"}`;

const DemandGenerationUI = ({
  form,
  coOptions,
  coLoading,
  generating,
  result,
  preview,
  previewReady,
  previewing,
  onSave,
  scope,
  drill,
  level,
  report,
  reportLoading,
  reportError,
  onSelectCo,
  onSelectGroup,
  onSelectAccount,
  onNavigate,
  onGenerate,
  onReset,
  onSelectionChange,
  regenerateOpen,
  onConfirmRegenerate,
  onCancelRegenerate,
  onViewExisting,
}: DemandGenerationProps) => {
  const { user } = useGlobalContext();
  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const demandDate = scope ? formatApiDate(scope.demandDate) : "";
  const selectedCoId = form.watch("co_id");
  const sahayikaName =
    drill.co?.name ||
    (scope?.coId === null || selectedCoId === ALL_SAHAYIKA || selectedCoId === ""
      ? "All Sahayika"
      : coOptions.find((item) => String(item.value) === String(selectedCoId))
          ?.label || "");
  const formDemandDate = form.watch("demand_date");
  const previewDate =
    formDemandDate && isValid(new Date(formDemandDate))
      ? format(new Date(formDemandDate), "dd-MM-yyyy")
      : "";

  const view: ReportView<unknown> | null = React.useMemo(() => {
    if (!report || report.level !== level) return null;
    switch (report.level) {
      case "co":
        return asView({
          title: LEVEL_TITLE.co,
          hint: "Click a Sahayika to see its groups",
          columns: coColumns(report.rows, report.summary),
          rows: report.rows,
          getRowKey: (row) => `co-${row.coId}`,
          onRowClick: onSelectCo,
        });
      case "group":
        return asView({
          title: LEVEL_TITLE.group,
          hint: "Click a group to see its members. Highlighted groups are generated from their collection day",
          columns: groupColumns(report.rows, report.summary, demandDate),
          rows: report.rows,
          getRowKey: (row) => `grp-${row.groupId}`,
          onRowClick: onSelectGroup,
          rowClassName: (row) =>
            row.collDayDate && row.collDayDate !== demandDate
              ? "bg-amber-50/50"
              : "",
        });
      case "member":
        return asView({
          title: LEVEL_TITLE.member,
          hint: "Click a loan to see its EMI detail",
          columns: memberColumns(report.rows, report.summary),
          rows: report.rows,
          getRowKey: (row, index) => `acc-${row.accountId}-${index}`,
          onRowClick: onSelectAccount,
        });
      case "emi":
        return asView({
          title: LEVEL_TITLE.emi,
          hint: "Unpaid EMIs of this loan as on the demand date",
          columns: emiColumns(report.rows),
          rows: report.rows,
          getRowKey: (row, index) => `emi-${row.emiNo}-${index}`,
        });
    }
  }, [demandDate, level, onSelectAccount, onSelectCo, onSelectGroup, report]);

  const crumbs: { level: DemandLevel; label: string }[] = [
    { level: "member", label: sahayikaName || "All Sahayika" },
    ...(drill.account
      ? [
          {
            level: "emi" as const,
            label: [drill.account.memberName, drill.account.label && `A/c ${drill.account.label}`]
              .filter(Boolean)
              .join(" · "),
          },
        ]
      : []),
  ];
  const parentLevel = crumbs.length > 1 ? crumbs[crumbs.length - 2].level : null;

  const printMeta = [
    { label: "Demand Date", value: demandDate },
    { label: "Sahayika", value: sahayikaName },
    ...(drill.group ? [{ label: "Group", value: drill.group.name }] : []),
    ...(drill.account
      ? [{ label: "Loan A/c", value: crumbs[crumbs.length - 1].label }]
      : []),
  ];

  const canPrint = !!view && view.rows.length > 0 && !reportLoading;

  return (
    <>
      <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500 print:hidden">
        <div className="page-header-card">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
          <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ClipboardList size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Demand Generation
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Generate demand for every group of a Sahayika
              </p>
            </div>
          </div>
        </div>

        <div className="page-body-card">
          <div className="form-sections">
            <section className="form-section">
              <div className="form-section-title">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">
                  Select Sahayika
                </h3>
              </div>

              <DemandGenerationFilterForm
                form={form}
                coOptions={coOptions}
                coLoading={coLoading}
                generating={generating || previewing}
                onGenerate={onGenerate}
                onReset={onReset}
                onSelectionChange={onSelectionChange}
              />

              {previewReady && !result && (
                <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-4 py-4 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Eye className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary">
                          Demand Preview
                          <span className="ml-2 font-medium text-gray-500">
                            {[previewDate, sahayikaName].filter(Boolean).join(" · ")}
                          </span>
                        </p>
                        {preview ? (
                          <p className="text-sm text-gray-700">
                            {plural(preview.groupCount, "group")}
                            {preview.collDayGroupCount > 0
                              ? ` (${preview.collDayGroupCount} on ${preview.collDayGroupCount === 1 ? "its" : "their"} collection day)`
                              : ""}
                            , {plural(preview.accountCount, "loan")},{" "}
                            {plural(preview.installmentCount, "EMI")}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">
                            Demand will be generated for every group of the
                            selection above.
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">
                          Nothing is saved until you click Save.
                        </p>
                      </div>
                    </div>
                    {preview && (
                      <dl className="grid grid-cols-3 gap-4 text-sm shrink-0">
                        <div>
                          <dt className="text-[11px] font-semibold uppercase text-primary/70">Current</dt>
                          <dd className="font-bold text-primary">{formatDemandAmount(preview.currentDemand)}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] font-semibold uppercase text-primary/70">Arrear</dt>
                          <dd className="font-bold text-primary">{formatDemandAmount(preview.arrearDemand)}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] font-semibold uppercase text-primary/70">Total</dt>
                          <dd className="font-bold text-primary">{formatDemandAmount(preview.totalDemand)}</dd>
                        </div>
                      </dl>
                    )}
                  </div>

                  <div className="form-actions">
                    <Button
                      type="button"
                      onClick={onSave}
                      disabled={generating || previewing}
                      className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[150px]"
                    >
                      <Save className="h-4 w-4" />
                      {generating ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              )}

              {result && (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-emerald-800">
                        {result.message || "Demand Generated Successfully"}
                      </p>
                      <p className="text-sm text-emerald-700">
                        {plural(result.groupCount, "group")}
                        {result.collDayGroupCount > 0
                          ? ` (${result.collDayGroupCount} on ${result.collDayGroupCount === 1 ? "its" : "their"} collection day)`
                          : ""}
                        , {plural(result.accountCount, "loan")},{" "}
                        {plural(result.installmentCount, "EMI")}
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-3 gap-4 text-sm shrink-0">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase text-emerald-700/70">Current</dt>
                      <dd className="font-bold text-emerald-900">{formatDemandAmount(result.currentDemand)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase text-emerald-700/70">Arrear</dt>
                      <dd className="font-bold text-emerald-900">{formatDemandAmount(result.arrearDemand)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase text-emerald-700/70">Total</dt>
                      <dd className="font-bold text-emerald-900">{formatDemandAmount(result.totalDemand)}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </section>

            {(generating || scope) && (
              <section className="form-section">
                <div className="border-b border-gray-100 pb-3 mb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {parentLevel ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onNavigate(parentLevel)}
                        className="h-8 w-8 p-0 shrink-0 border-gray-200"
                        aria-label="Back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ClipboardList size={14} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-primary text-base">
                        {LEVEL_TITLE[level]}
                        {demandDate ? (
                          <span className="ml-2 text-sm font-medium text-gray-500">
                            {demandDate}
                          </span>
                        ) : null}
                      </h3>
                      {scope && (
                        <nav className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-500">
                          {crumbs.map((crumb, index) => {
                            const last = index === crumbs.length - 1;
                            return (
                              <React.Fragment key={crumb.level}>
                                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                                {last ? (
                                  <span className="font-semibold text-gray-700">{crumb.label}</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onNavigate(crumb.level)}
                                    className="hover:text-primary hover:underline"
                                  >
                                    {crumb.label}
                                  </button>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </nav>
                      )}
                      {view && view.rows.length > 0 && !reportLoading ? (
                        <p className="text-xs text-gray-400 mt-0.5">{view.hint}</p>
                      ) : null}
                    </div>
                  </div>

                  {canPrint && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePrint()}
                      className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                    >
                      <Printer size={18} />
                      Print
                    </Button>
                  )}
                </div>

                <DemandGenerationTable
                  columns={view?.columns ?? []}
                  rows={view ? view.rows : reportError ? [] : null}
                  loading={generating || reportLoading}
                  loadingText={generating ? "Generating Demand..." : "Loading Demand..."}
                  emptyText={
                    reportError ||
                    "No demand found. Generate demand for this date first."
                  }
                  getRowKey={view?.getRowKey ?? ((_row, index) => String(index))}
                  onRowClick={view?.onRowClick}
                  rowClassName={view?.rowClassName}
                />
              </section>
            )}
          </div>
        </div>
      </div>

      {canPrint && view && (
        <DemandGenerationPrint
          printRef={printRef}
          title={`Demand Generation – ${view.title}`}
          branchName={user?.branch_name || ""}
          meta={printMeta}
          columns={view.columns}
          rows={view.rows}
          getRowKey={view.getRowKey}
        />
      )}

      <Dialog
        open={regenerateOpen}
        onOpenChange={(open) => {
          if (!open) onCancelRegenerate();
        }}
      >
        <DialogContent className="sm:max-w-[480px] border border-gray-100 shadow-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              Demand already generated
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Demand already generated for this date. Regenerate it to include
              collections posted since, or view the existing demand.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelRegenerate}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onViewExisting}
              disabled={generating}
            >
              View Existing
            </Button>
            <Button
              type="button"
              onClick={onConfirmRegenerate}
              disabled={generating}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DemandGenerationUI;
