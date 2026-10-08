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
}

const sumAmount = (rows: DemandRow[], key: "loanAmount" | "outstanding" | "demand") =>
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

  const colSpan = 7;

  return (
    <div
      ref={printRef}
      className="hidden print:block w-[297mm] mx-auto p-6 text-black bg-white text-xs print-area"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          table { display: table !important; width: 100% !important; border-collapse: collapse !important; }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; }
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
              <span className="font-bold">Sahayika:</span> {sahayikaName || "—"}
            </td>
            <td colSpan={4} className="border border-black p-3 text-left">
              <span className="font-bold">Group:</span> {groupName || "—"}
            </td>
          </tr>
          <tr>
            <td colSpan={colSpan} className="border-0 h-4" />
          </tr>
          <tr className="bg-slate-100 font-bold">
            <th className="border border-black p-2 w-[40px]">Sl.</th>
            <th className="border border-black p-2">Member No</th>
            <th className="border border-black p-2 text-left">Member Name</th>
            <th className="border border-black p-2 text-left">Father / Husband</th>
            <th className="border border-black p-2 text-right">Loan Amount</th>
            <th className="border border-black p-2 text-right">Outstanding</th>
            <th className="border border-black p-2 text-right">Demand</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.sl}-${row.memberNo}`}>
              <td className="border border-black p-2">{row.sl}</td>
              <td className="border border-black p-2">{row.memberNo || "-"}</td>
              <td className="border border-black p-2 text-left">{row.memberName || "-"}</td>
              <td className="border border-black p-2 text-left">{row.guardianName || "-"}</td>
              <td className="border border-black p-2 text-right">
                {formatDemandAmount(row.loanAmount)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatDemandAmount(row.outstanding)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatDemandAmount(row.demand)}
              </td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={4} className="border border-black p-2 text-left">
              Total ({rows.length})
            </td>
            <td className="border border-black p-2 text-right">
              {formatDemandAmount(sumAmount(rows, "loanAmount"))}
            </td>
            <td className="border border-black p-2 text-right">
              {formatDemandAmount(sumAmount(rows, "outstanding"))}
            </td>
            <td className="border border-black p-2 text-right">
              {formatDemandAmount(sumAmount(rows, "demand"))}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex justify-between text-[11px] text-slate-600">
        <span>Printed by: {userName || "-"}</span>
        <span>{printedAt}</span>
      </div>
    </div>
  );
};

export default DemandGenerationPrint;
