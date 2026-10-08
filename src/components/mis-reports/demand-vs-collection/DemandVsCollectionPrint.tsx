"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import getCookieData from "@/lib/getCookieData";
import {
  formatAmount,
  formatApiDate,
  formatPct,
} from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionApi";
import {
  DemandVsCollectionData,
  ReportView,
} from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionType";

const DemandVsCollectionPrint = ({
  printRef,
  report,
  view,
  filterText,
}: {
  printRef: React.RefObject<HTMLDivElement | null>;
  report: DemandVsCollectionData | null;
  view: ReportView;
  filterText: string;
}) => {
  const [orgName, setOrgName] = useState("");
  const [printedAt, setPrintedAt] = useState("");

  useEffect(() => {
    setOrgName(getCookieData("priobank-lite-org_name") || "");
    setPrintedAt(format(new Date(), "dd MMM yyyy, hh:mm a"));
  }, [report]);

  if (!report) return null;
  const { summary } = report;
  const name =
    view === "branch" ? "Branch" : view === "group" ? "Group" : view === "member" ? "Member" : "Sahayika";

  return (
    <div ref={printRef} className="hidden bg-white text-black print:block">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; }
          @page { size: A4 landscape; margin: 8mm 8mm 12mm 8mm; }
          .dvc-print { width: 100%; margin: 0; padding: 0; }
          .dvc-print table { width: 100%; border-collapse: collapse; font-size: 10px; }
          .dvc-print thead { display: table-header-group; }
          .dvc-print tfoot { display: table-footer-group; }
          .dvc-print tr { break-inside: avoid; page-break-inside: avoid; }
          .dvc-spacer td {
            border: none !important;
            height: 8mm;
            padding: 0 !important;
            line-height: 0;
            font-size: 0;
          }
          .dvc-sign {
            position: fixed;
            bottom: 3mm;
            left: 8mm;
            right: 8mm;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: space-between;
            background: #fff;
            font-size: 11px;
            line-height: 1.2;
          }
        }
      `,
        }}
      />
      <div className="dvc-print">
        <div className="mb-2 text-center">
          <div className="text-base font-bold uppercase">{orgName || "Organisation"}</div>
          <div className="text-sm font-bold underline">Demand vs Collection</div>
          <div className="text-[11px]">
            {filterText || summary.branchName} · {formatApiDate(summary.fromDate)} to{" "}
            {formatApiDate(summary.toDate)} · Printed {printedAt}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th className="border border-black p-1 text-left">{name}</th>
              <th className="border border-black p-1 text-right">Arrear</th>
              <th className="border border-black p-1 text-right">Current</th>
              <th className="border border-black p-1 text-right">Net</th>
              <th className="border border-black p-1 text-right">Collection</th>
              <th className="border border-black p-1 text-right">Overdue</th>
              <th className="border border-black p-1 text-right">Coll. %</th>
            </tr>
          </thead>
          <tbody>
            {view === "member"
              ? report.memberRows.map((row) => (
                  <tr key={row.accountId}>
                    <td className="border border-black p-1">
                      {row.memberName} {row.memberNo ? `(${row.memberNo})` : ""}
                    </td>
                    <td className="border border-black p-1 text-right">{formatAmount(row.arrearDemand)}</td>
                    <td className="border border-black p-1 text-right">{formatAmount(row.currentDemand)}</td>
                    <td className="border border-black p-1 text-right">{formatAmount(row.netDemand)}</td>
                    <td className="border border-black p-1 text-right">{formatAmount(row.collAmount)}</td>
                    <td className="border border-black p-1 text-right">{formatAmount(row.overdueAmount)}</td>
                    <td className="border border-black p-1 text-right">{formatPct(row.collPct)}</td>
                  </tr>
                ))
              : view === "date"
                ? report.dateRows.map((row) => (
                    <tr key={row.transDate}>
                      <td className="border border-black p-1">{formatApiDate(row.transDate)}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.demandAmount)}</td>
                      <td className="border border-black p-1" />
                      <td className="border border-black p-1 text-right">{formatAmount(row.cumDemand)}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.collAmount)}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.cumCollection)}</td>
                      <td className="border border-black p-1" />
                    </tr>
                  ))
                : report.rows.map((row) => (
                    <tr key={`${row.keyId}-${row.keyName}`}>
                      <td className="border border-black p-1">{row.keyName}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.arrearDemand)}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.currentDemand)}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.netDemand)}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.collAmount)}</td>
                      <td className="border border-black p-1 text-right">{formatAmount(row.overdueAmount)}</td>
                      <td className="border border-black p-1 text-right">{formatPct(row.collPct)}</td>
                    </tr>
                  ))}
            <tr className="font-bold">
              <td className="border border-black p-1">Total</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.arrearDemand)}</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.currentDemand)}</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.netDemand)}</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.collAmount)}</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.overdueAmount)}</td>
              <td className="border border-black p-1 text-right">{formatPct(summary.collPct)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="dvc-spacer">
              <td colSpan={7}>&nbsp;</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="dvc-sign">
        <span>Prepared by</span>
        <span>Checked by</span>
        <span>Branch Manager</span>
      </div>
    </div>
  );
};

export default DemandVsCollectionPrint;
