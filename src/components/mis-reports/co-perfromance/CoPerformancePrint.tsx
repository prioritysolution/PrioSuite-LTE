"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import getCookieData from "@/lib/getCookieData";
import {
  formatAmount,
  formatApiDate,
  formatPct,
} from "@/container/mis-reports/co-perfromance/CoPerformanceApi";
import { CoPerformanceData } from "@/container/mis-reports/co-perfromance/CoPerformanceType";

const CoPerformancePrint = ({
  printRef,
  report,
  filterText,
}: {
  printRef: React.RefObject<HTMLDivElement | null>;
  report: CoPerformanceData | null;
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
  const name = report.view === "group" ? "Group" : "Sahayika";

  return (
    <div ref={printRef} className="hidden bg-white text-black print:block">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; }
          @page { size: A4 landscape; margin: 8mm 8mm 12mm 8mm; }
          .cop-print { width: 100%; margin: 0; padding: 0; }
          .cop-print table { width: 100%; border-collapse: collapse; font-size: 10px; }
          .cop-print thead { display: table-header-group; }
          .cop-print tfoot { display: table-footer-group; }
          .cop-print tr { break-inside: avoid; page-break-inside: avoid; }
          .cop-spacer td { border: none !important; height: 8mm; padding: 0 !important; font-size: 0; }
          .cop-sign {
            position: fixed; bottom: 3mm; left: 8mm; right: 8mm; margin: 0; padding: 0;
            display: flex; justify-content: space-between; background: #fff; font-size: 11px;
          }
        }
      `,
        }}
      />
      <div className="cop-print">
        <div className="mb-2 text-center">
          <div className="text-base font-bold uppercase">{orgName || "Organisation"}</div>
          <div className="text-sm font-bold underline">CO Performance</div>
          <div className="text-[11px]">
            {filterText || summary.branchName} · {formatApiDate(summary.fromDate)} to{" "}
            {formatApiDate(summary.toDate)} · Printed {printedAt}
          </div>
          <div className="text-[10px]">Grade: A ≥ 95% · B ≥ 85% · C ≥ 70% · D &lt; 70%</div>
        </div>
        <table>
          <thead>
            <tr>
              <th className="border border-black p-1 text-left">#</th>
              <th className="border border-black p-1 text-left">{name}</th>
              <th className="border border-black p-1 text-right">Disbursed</th>
              <th className="border border-black p-1 text-right">Outstanding</th>
              <th className="border border-black p-1 text-right">Net Demand</th>
              <th className="border border-black p-1 text-right">Collection</th>
              <th className="border border-black p-1 text-right">Coll. %</th>
              <th className="border border-black p-1 text-right">PAR %</th>
              <th className="border border-black p-1 text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {(report.view === "month" ? [] : report.rows).map((row) => (
              <tr key={`${row.branchId}-${row.keyId}`}>
                <td className="border border-black p-1">{row.perfRank ?? "-"}</td>
                <td className="border border-black p-1">{row.keyName}</td>
                <td className="border border-black p-1 text-right">{formatAmount(row.disbAmount)}</td>
                <td className="border border-black p-1 text-right">{formatAmount(row.outstanding)}</td>
                <td className="border border-black p-1 text-right">{formatAmount(row.netDemand)}</td>
                <td className="border border-black p-1 text-right">{formatAmount(row.collAmount)}</td>
                <td className="border border-black p-1 text-right">{formatPct(row.collPct)}</td>
                <td className="border border-black p-1 text-right">{formatPct(row.parPct)}</td>
                <td className="border border-black p-1 text-center">{row.grade || "–"}</td>
              </tr>
            ))}
            {report.view === "month" &&
              report.monthRows.map((row) => (
                <tr key={row.monthKey}>
                  <td className="border border-black p-1" />
                  <td className="border border-black p-1">{row.monthName}</td>
                  <td className="border border-black p-1 text-right">{formatAmount(row.disbAmount)}</td>
                  <td className="border border-black p-1" />
                  <td className="border border-black p-1 text-right">{formatAmount(row.demandAmount)}</td>
                  <td className="border border-black p-1 text-right">{formatAmount(row.collAmount)}</td>
                  <td className="border border-black p-1 text-right">{formatPct(row.collVsDuePct)}</td>
                  <td className="border border-black p-1" />
                  <td className="border border-black p-1" />
                </tr>
              ))}
            <tr className="font-bold">
              <td className="border border-black p-1" />
              <td className="border border-black p-1">Total</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.disbAmount)}</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.outstanding)}</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.netDemand)}</td>
              <td className="border border-black p-1 text-right">{formatAmount(summary.collAmount)}</td>
              <td className="border border-black p-1 text-right">{formatPct(summary.collPct)}</td>
              <td className="border border-black p-1 text-right">{formatPct(summary.parPct)}</td>
              <td className="border border-black p-1 text-center">{summary.grade || "–"}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="cop-spacer">
              <td colSpan={9}>&nbsp;</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="cop-sign">
        <span>Prepared by</span>
        <span>Checked by</span>
        <span>Branch Manager</span>
      </div>
    </div>
  );
};

export default CoPerformancePrint;
