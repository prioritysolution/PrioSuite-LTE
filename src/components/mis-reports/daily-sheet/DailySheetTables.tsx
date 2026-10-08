"use client";

import React from "react";
import {
  DailySheetLedgerRow,
  DailySheetSideRow,
  DailySheetSummary,
} from "@/container/mis-reports/daily-sheet/DailySheetType";
import {
  formatSheetAmount,
  formatSheetMoney,
} from "@/container/mis-reports/daily-sheet/DailySheetApi";

type SheetLine =
  | { key: string; kind: "category"; label: string }
  | { key: string; kind: "opening" }
  | { key: string; kind: "closing" }
  | { key: string; kind: "ledger"; row: DailySheetSideRow }
  | { key: string; kind: "empty" };

const withCategories = (rows: DailySheetSideRow[], prefix: string): SheetLine[] => {
  const lines: SheetLine[] = [];
  let lastCategory = "";
  rows.forEach((row, index) => {
    const category = row.cateDesc || "Other";
    if (category !== lastCategory) {
      lines.push({
        key: `${prefix}-cat-${category}-${index}`,
        kind: "category",
        label: category,
      });
      lastCategory = category;
    }
    lines.push({ key: `${prefix}-${row.accountId}-${index}`, kind: "ledger", row });
  });
  return lines;
};

const padLines = (lines: SheetLine[], count: number, prefix: string) => {
  const padded = [...lines];
  while (padded.length < count) {
    padded.push({ key: `${prefix}-empty-${padded.length}`, kind: "empty" });
  }
  return padded;
};

const amountCell = (value: number) => (
  <td className="px-3 py-2 text-right tabular-nums">{formatSheetAmount(value)}</td>
);

const SideTable = ({
  title,
  lines,
  summary,
  side,
  drillAllowed,
  onOpenLedger,
}: {
  title: string;
  lines: SheetLine[];
  summary: DailySheetSummary;
  side: "receipt" | "payment";
  drillAllowed: boolean;
  onOpenLedger: (accountId: number, ledgerName: string) => void;
}) => (
  <div className="flex min-w-0 flex-col">
    <div className="bg-primary/10 px-4 py-3 text-sm font-bold tracking-wide text-primary uppercase">
      {title}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs tracking-wide text-gray-500 uppercase">
            <th className="px-3 py-2 text-left font-semibold">Particulars</th>
            <th className="px-3 py-2 text-right font-semibold">Cash</th>
            <th className="px-3 py-2 text-right font-semibold">Transfer</th>
            <th className="px-3 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            if (line.kind === "category") {
              return (
                <tr key={line.key} className="bg-gray-50">
                  <td
                    colSpan={4}
                    className="px-3 py-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase"
                  >
                    {line.label}
                  </td>
                </tr>
              );
            }
            if (line.kind === "empty") {
              return (
                <tr key={line.key}>
                  <td colSpan={4} className="h-10" />
                </tr>
              );
            }
            if (line.kind === "opening") {
              return (
                <tr key={line.key} className="border-b border-gray-100 font-semibold">
                  <td className="px-3 py-2">To Opening Cash</td>
                  <td />
                  <td />
                  {amountCell(summary.openingCash)}
                </tr>
              );
            }
            if (line.kind === "closing") {
              return (
                <tr key={line.key} className="border-b border-gray-100 font-semibold">
                  <td className="px-3 py-2">By Closing Cash</td>
                  <td />
                  <td />
                  {amountCell(summary.closingCash)}
                </tr>
              );
            }
            const row = line.row;
            const unbalanced = row.accountId === 0;
            return (
              <tr
                key={line.key}
                className={`border-b border-gray-100 ${
                  unbalanced ? "bg-amber-50 text-amber-950" : ""
                } ${drillAllowed ? "cursor-pointer hover:bg-primary/5" : ""}`}
                onClick={() => {
                  if (drillAllowed) onOpenLedger(row.accountId, row.ledgerName);
                }}
              >
                <td className="px-3 py-2">
                  <span className="font-medium">{row.ledgerName}</span>
                  {row.count > 0 && (
                    <span className="ml-2 inline-flex rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                      {row.count}
                    </span>
                  )}
                </td>
                {amountCell(row.cash)}
                {amountCell(row.transfer)}
                {amountCell(row.total)}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-bold">
            <td className="px-3 py-2">Total</td>
            {amountCell(side === "receipt" ? summary.recCash : summary.payCash)}
            {amountCell(side === "receipt" ? summary.recTrf : summary.payTrf)}
            {amountCell(
              side === "receipt" ? summary.grandRecTotal : summary.grandPayTotal,
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

export const DailySheetColumns = ({
  summary,
  receipts,
  payments,
  drillAllowed,
  onOpenLedger,
}: {
  summary: DailySheetSummary;
  receipts: DailySheetSideRow[];
  payments: DailySheetSideRow[];
  drillAllowed: boolean;
  onOpenLedger: (accountId: number, ledgerName: string) => void;
}) => {
  const receiptLines = [
    { key: "opening", kind: "opening" } as SheetLine,
    ...withCategories(receipts, "rec"),
  ];
  const paymentLines = [
    ...withCategories(payments, "pay"),
    { key: "closing", kind: "closing" } as SheetLine,
  ];
  const rowCount = Math.max(receiptLines.length, paymentLines.length);

  return (
    <div className="grid border-t border-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-gray-100">
      <SideTable
        title="Receipts"
        lines={padLines(receiptLines, rowCount, "rec")}
        summary={summary}
        side="receipt"
        drillAllowed={drillAllowed}
        onOpenLedger={onOpenLedger}
      />
      <SideTable
        title="Payments"
        lines={padLines(paymentLines, rowCount, "pay")}
        summary={summary}
        side="payment"
        drillAllowed={drillAllowed}
        onOpenLedger={onOpenLedger}
      />
    </div>
  );
};

export const DailySheetGrid = ({
  summary,
  ledgers,
  drillAllowed,
  onOpenLedger,
}: {
  summary: DailySheetSummary;
  ledgers: DailySheetLedgerRow[];
  drillAllowed: boolean;
  onOpenLedger: (accountId: number, ledgerName: string) => void;
}) => {
  const totals = ledgers.reduce(
    (acc, row) => ({
      recCount: acc.recCount + row.recCount,
      recCash: acc.recCash + row.recCash,
      recTrf: acc.recTrf + row.recTrf,
      recTotal: acc.recTotal + row.recTotal,
      payCount: acc.payCount + row.payCount,
      payCash: acc.payCash + row.payCash,
      payTrf: acc.payTrf + row.payTrf,
      payTotal: acc.payTotal + row.payTotal,
    }),
    {
      recCount: 0,
      recCash: 0,
      recTrf: 0,
      recTotal: 0,
      payCount: 0,
      payCash: 0,
      payTrf: 0,
      payTotal: 0,
    },
  );

  return (
    <div className="border-t border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="font-semibold text-gray-700">
          Opening Cash {formatSheetMoney(summary.openingCash)}
        </span>
        <span className="font-semibold text-gray-700">
          Closing Cash {formatSheetMoney(summary.closingCash)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-3 py-2 text-left font-semibold">Ledger</th>
              <th className="px-3 py-2 text-right font-semibold">Rec Count</th>
              <th className="px-3 py-2 text-right font-semibold">Rec Cash</th>
              <th className="px-3 py-2 text-right font-semibold">Rec Transfer</th>
              <th className="px-3 py-2 text-right font-semibold">Rec Total</th>
              <th className="px-3 py-2 text-right font-semibold">Pay Count</th>
              <th className="px-3 py-2 text-right font-semibold">Pay Cash</th>
              <th className="px-3 py-2 text-right font-semibold">Pay Transfer</th>
              <th className="px-3 py-2 text-right font-semibold">Pay Total</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map((row) => (
              <tr
                key={row.accountId}
                className={`border-b border-gray-100 ${
                  row.accountId === 0 ? "bg-amber-50 text-amber-950" : ""
                } ${drillAllowed ? "cursor-pointer hover:bg-primary/5" : ""}`}
                onClick={() => {
                  if (drillAllowed) onOpenLedger(row.accountId, row.ledgerName);
                }}
              >
                <td className="px-3 py-2 font-medium">{row.ledgerName}</td>
                <td className="px-3 py-2 text-right">{row.recCount || "-"}</td>
                <td className="px-3 py-2 text-right">{formatSheetAmount(row.recCash)}</td>
                <td className="px-3 py-2 text-right">{formatSheetAmount(row.recTrf)}</td>
                <td className="px-3 py-2 text-right">{formatSheetAmount(row.recTotal)}</td>
                <td className="px-3 py-2 text-right">{row.payCount || "-"}</td>
                <td className="px-3 py-2 text-right">{formatSheetAmount(row.payCash)}</td>
                <td className="px-3 py-2 text-right">{formatSheetAmount(row.payTrf)}</td>
                <td className="px-3 py-2 text-right">{formatSheetAmount(row.payTotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right">{totals.recCount || "-"}</td>
              <td className="px-3 py-2 text-right">{formatSheetAmount(totals.recCash)}</td>
              <td className="px-3 py-2 text-right">{formatSheetAmount(totals.recTrf)}</td>
              <td className="px-3 py-2 text-right">{formatSheetAmount(totals.recTotal)}</td>
              <td className="px-3 py-2 text-right">{totals.payCount || "-"}</td>
              <td className="px-3 py-2 text-right">{formatSheetAmount(totals.payCash)}</td>
              <td className="px-3 py-2 text-right">{formatSheetAmount(totals.payTrf)}</td>
              <td className="px-3 py-2 text-right">{formatSheetAmount(totals.payTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
