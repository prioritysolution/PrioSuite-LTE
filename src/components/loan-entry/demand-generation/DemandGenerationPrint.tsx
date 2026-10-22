"use client";

import React, { useEffect, useState } from "react";
import getCookieData from "@/lib/getCookieData";
import { DemandColumn } from "./DemandGenerationTable";

interface DemandGenerationPrintProps<T> {
  printRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  branchName: string;
  meta: { label: string; value: string }[];
  columns: DemandColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const DemandGenerationPrint = <T,>({
  printRef,
  title,
  branchName,
  meta,
  columns,
  rows,
  getRowKey,
}: DemandGenerationPrintProps<T>) => {
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

  const colSpan = columns.length;
  const hasFooter = columns.some((column) => column.footer !== undefined);

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
              {title}
            </td>
          </tr>
          <tr>
            <td colSpan={colSpan} className="border border-black p-3 text-left text-[13px]">
              {meta.map((item, index) => (
                <span key={item.label} className={index ? "ml-8" : undefined}>
                  <span className="font-bold">{item.label}:</span> {item.value || "—"}
                </span>
              ))}
            </td>
          </tr>
          <tr>
            <td colSpan={colSpan} className="border-0 h-4" />
          </tr>
          <tr className="bg-slate-100 font-bold">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`border border-black p-2 ${alignClass[column.align ?? "left"]}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`border border-black p-2 ${alignClass[column.align ?? "left"]}`}
                >
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
          {hasFooter && (
            <tr className="font-bold">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`border border-black p-2 ${alignClass[column.align ?? "left"]}`}
                >
                  {column.footer}
                </td>
              ))}
            </tr>
          )}
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
