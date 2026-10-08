"use client";

import React, { useEffect, useState } from "react";
import getCookieData from "@/lib/getCookieData";
import { DemandRow } from "@/container/loan-entry/demand-generation/DemandGenerationType";
import { formatDemandAmount } from "./DemandGenerationTable";

interface DemandGenerationPrintProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  rows: DemandRow[];
  sahayikaName: string;
  groupName: string;
  branchName: string;
  demandDate: string;
}

const sumAmount = (
  rows: DemandRow[],
  key: "currentDemand" | "arrearDemand" | "totalDemand" | "outstanding",
) =>
  rows.reduce((total, row) => {
    const amount = Number(row[key]);
    return total + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

const DemandGenerationPrint = ({
  printRef,
  rows,
  sahayikaName,
  groupName,
  branchName,
  demandDate,
}: DemandGenerationPrintProps) => {
  const [userName, setUserName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [printedAt, setPrintedAt] = useState("");

  useEffect(() => {
    setUserName(getCookieData("priobank-lite-User_Name") || "");
    setOrgName(getCookieData("priobank-lite-org_name") || "");
    const now = new Date();
    setPrintedAt(
      now.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, []);

  const colSpan = 9;

  return (
    <div
      ref={printRef}
      className="hidden print:block w-full m-0 p-0 text-black bg-white text-xs print-area"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; }
          @page { size: A4 landscape; margin: 5mm 5mm 12mm 5mm; }
          table { display: table !important; width: 100% !important; border-collapse: collapse !important; }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; }
          .demand-print-footer {
            position: fixed;
            bottom: 3mm;
            left: 5mm;
            right: 5mm;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #475569;
          }
        }
      `,
        }}
      />

      <table className="w-full border-collapse text-center text-xs">
        <thead>
          <tr>
            <td colSpan={colSpan} className="font-bold text-xl uppercase py-0.5 border-0">
              {orgName}
            </td>
          </tr>
          <tr>
            <td colSpan={colSpan} className="font-semibold text-sm uppercase text-slate-700 py-0.5 border-0">
              {branchName}
            </td>
          </tr>
          <tr>
            <td colSpan={colSpan} className="font-bold underline uppercase pt-2 pb-3 border-0">
              Demand Generation
            </td>
          </tr>
          <tr className="text-[13px]">
            <td colSpan={3} className="border border-black p-3 text-left">
              <span className="font-bold">Demand Date:</span> {demandDate || "—"}
            </td>
            <td colSpan={3} className="border border-black p-3 text-left">
              <span className="font-bold">Sahayika:</span> {sahayikaName || "—"}
            </td>
            <td colSpan={3} className="border border-black p-3 text-left">
              <span className="font-bold">Group:</span> {groupName || "—"}
            </td>
          </tr>
          <tr>
            <td colSpan={colSpan} className="border-0 h-4" />
          </tr>
          <tr className="bg-slate-100 font-bold">
            <th className="border border-black p-2 w-[40px]">Sl.</th>
            <th className="border border-black p-2 text-left">Member</th>
            <th className="border border-black p-2">Loan Account</th>
            <th className="border border-black p-2">Installment</th>
            <th className="border border-black p-2">Due Date</th>
            <th className="border border-black p-2 text-right">Current</th>
            <th className="border border-black p-2 text-right">Arrear</th>
            <th className="border border-black p-2 text-right">Total Demand</th>
            <th className="border border-black p-2 text-right">Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.sl}-${row.memberNo}-${row.accountLabel}`}>
              <td className="border border-black p-2">{row.sl}</td>
              <td className="border border-black p-2 text-left">
                {row.memberName || "-"}
                {row.memberNo ? ` (${row.memberNo})` : ""}
              </td>
              <td className="border border-black p-2">{row.accountLabel || "-"}</td>
              <td className="border border-black p-2">{row.installmentNo || "-"}</td>
              <td className="border border-black p-2">{row.dueDate || "-"}</td>
              <td className="border border-black p-2 text-right">
                {formatDemandAmount(row.currentDemand)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatDemandAmount(row.arrearDemand)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatDemandAmount(row.totalDemand)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatDemandAmount(row.outstanding)}
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={5} className="border border-black p-2 text-left">
              Total ({rows.length})
            </td>
            <td className="border border-black p-2 text-right">
              {formatDemandAmount(sumAmount(rows, "currentDemand"))}
            </td>
            <td className="border border-black p-2 text-right">
              {formatDemandAmount(sumAmount(rows, "arrearDemand"))}
            </td>
            <td className="border border-black p-2 text-right">
              {formatDemandAmount(sumAmount(rows, "totalDemand"))}
            </td>
            <td className="border border-black p-2 text-right">
              {formatDemandAmount(sumAmount(rows, "outstanding"))}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="demand-print-footer flex justify-between text-[11px] text-slate-600">
        <span>Printed by: {userName || "-"}</span>
        <span>{printedAt}</span>
      </div>
    </div>
  );
};

export default DemandGenerationPrint;
