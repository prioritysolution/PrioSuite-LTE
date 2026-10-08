"use client";

import React, { useEffect, useState } from "react";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";
import { DailySheetData } from "@/container/mis-reports/daily-sheet/DailySheetType";
import {
  formatApiDate,
  formatSheetAmount,
} from "@/container/mis-reports/daily-sheet/DailySheetApi";

type SheetLine = {
  label: string;
  cash: number | null;
  transfer: number | null;
  total: number | null;
};

const amount = (value: number | null) =>
  value === null ? "" : formatSheetAmount(value);

const DailySheetPrint = ({
  printRef,
  report,
}: {
  printRef: React.RefObject<HTMLDivElement | null>;
  report: DailySheetData | null;
}) => {
  const [orgName, setOrgName] = useState("");
  const [printedAt, setPrintedAt] = useState("");

  useEffect(() => {
    setOrgName(getCookieData("priobank-lite-org_name") || "");
    setPrintedAt(format(new Date(), "dd MMM yyyy, hh:mm a"));
  }, [report]);

  if (!report) return null;
  const { summary, receipts, payments } = report;

  const receiptLines: SheetLine[] = [
    {
      label: "To Opening Cash",
      cash: null,
      transfer: null,
      total: summary.openingCash,
    },
    ...receipts.map((row) => ({
      label: row.ledgerName,
      cash: row.cash,
      transfer: row.transfer,
      total: row.total,
    })),
  ];
  const paymentLines: SheetLine[] = [
    ...payments.map((row) => ({
      label: row.ledgerName,
      cash: row.cash,
      transfer: row.transfer,
      total: row.total,
    })),
    {
      label: "By Closing Cash",
      cash: null,
      transfer: null,
      total: summary.closingCash,
    },
  ];
  const rowCount = Math.max(receiptLines.length, paymentLines.length);

  return (
    <div ref={printRef} className="daily-sheet-print hidden print:block bg-white text-black">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; }
          @page { size: A4 landscape; margin: 6mm 6mm 10mm 6mm; }
          .daily-sheet-print { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .daily-sheet-print table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .daily-sheet-print thead { display: table-header-group; }
          .daily-sheet-print tr { break-inside: avoid; page-break-inside: avoid; }
          .daily-sheet-sign {
            position: fixed;
            bottom: 2mm;
            left: 6mm;
            right: 6mm;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: space-between;
            background: #fff;
            font-size: 11px;
            line-height: 1;
          }
        }
      `,
        }}
      />
      <table>
        <thead>
          <tr>
            <th colSpan={8} className="border-0 py-0.5 text-center text-base font-bold uppercase">
              {orgName || "Organisation"}
            </th>
          </tr>
          <tr>
            <th colSpan={8} className="border-0 py-0.5 text-center text-sm font-bold underline">
              Daily Sheet
            </th>
          </tr>
          <tr>
            <th colSpan={8} className="border-0 pb-2 text-center text-[11px] font-normal">
              {summary.branchName} · {formatApiDate(summary.fromDate)}
              {summary.fromDate !== summary.toDate
                ? ` to ${formatApiDate(summary.toDate)}`
                : ""}
              {" · "}Printed {printedAt}
            </th>
          </tr>
          <tr>
            <th colSpan={4} className="border border-black p-1 text-left">
              Receipts
            </th>
            <th colSpan={4} className="border border-black p-1 text-left">
              Payments
            </th>
          </tr>
          <tr>
            <th className="border border-black p-1 text-left">Particulars</th>
            <th className="w-[72px] border border-black p-1 text-right">Cash</th>
            <th className="w-[72px] border border-black p-1 text-right">Transfer</th>
            <th className="w-[88px] border border-black p-1 text-right">Total</th>
            <th className="border border-black p-1 text-left">Particulars</th>
            <th className="w-[72px] border border-black p-1 text-right">Cash</th>
            <th className="w-[72px] border border-black p-1 text-right">Transfer</th>
            <th className="w-[88px] border border-black p-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, index) => {
            const receipt = receiptLines[index];
            const payment = paymentLines[index];
            return (
              <tr key={index}>
                <td className="border border-black p-1">{receipt?.label || ""}</td>
                <td className="border border-black p-1 text-right">{amount(receipt?.cash ?? null)}</td>
                <td className="border border-black p-1 text-right">{amount(receipt?.transfer ?? null)}</td>
                <td className="border border-black p-1 text-right">{amount(receipt?.total ?? null)}</td>
                <td className="border border-black p-1">{payment?.label || ""}</td>
                <td className="border border-black p-1 text-right">{amount(payment?.cash ?? null)}</td>
                <td className="border border-black p-1 text-right">{amount(payment?.transfer ?? null)}</td>
                <td className="border border-black p-1 text-right">{amount(payment?.total ?? null)}</td>
              </tr>
            );
          })}
          <tr className="font-bold">
            <td className="border border-black p-1">Total</td>
            <td className="border border-black p-1 text-right">{formatSheetAmount(summary.recCash)}</td>
            <td className="border border-black p-1 text-right">{formatSheetAmount(summary.recTrf)}</td>
            <td className="border border-black p-1 text-right">{formatSheetAmount(summary.grandRecTotal)}</td>
            <td className="border border-black p-1">Total</td>
            <td className="border border-black p-1 text-right">{formatSheetAmount(summary.payCash)}</td>
            <td className="border border-black p-1 text-right">{formatSheetAmount(summary.payTrf)}</td>
            <td className="border border-black p-1 text-right">{formatSheetAmount(summary.grandPayTotal)}</td>
          </tr>
        </tbody>
      </table>
      <div className="daily-sheet-sign">
        <span>Prepared by</span>
        <span>Checked by</span>
        <span>Branch Manager</span>
      </div>
    </div>
  );
};

export default DailySheetPrint;
