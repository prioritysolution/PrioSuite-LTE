"use client";

import React from "react";
import { formatStatementAmount, formatStatementAmountWithZero } from "@/container/mis-reports/monthly-statement-of-accounts/MonthlyStatementApi";
import type {
  MonthlyStatementRow,
  MonthlyStatementSide,
  MonthlyStatementSummary,
} from "@/container/mis-reports/monthly-statement-of-accounts/MonthlyStatementType";

interface StatementSideProps {
  title: string;
  side: MonthlyStatementSide;
  rows: MonthlyStatementRow[];
  summary: MonthlyStatementSummary;
}

const StatementSide = ({ title, side, rows, summary }: StatementSideProps) => {
  const sideRows = rows.filter((r) => r.side === side);
  const totalPrev = side === "receipts" ? summary.totalReceiptsPrevious : summary.totalPaymentsPrevious;
  const totalCurr = side === "receipts" ? summary.totalReceiptsCurrent : summary.totalPaymentsCurrent;
  const totalCum = side === "receipts" ? summary.totalReceiptsCumulative : summary.totalPaymentsCumulative;

  return (
    <div className="flex-1 min-w-[500px] rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
      <div className="bg-primary px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wider text-white">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-gray-200">
              <th className="py-2.5 px-3 text-left">Particulars</th>
              <th className="py-2.5 px-3 text-right w-28">Up to Prev. (₹)</th>
              <th className="py-2.5 px-3 text-right w-32">This Period (₹)</th>
              <th className="py-2.5 px-3 text-right w-28">Cumulative (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sideRows.map((row) => {
              if (row.isHeader) {
                return (
                  <tr key={row.id} className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={4} className="py-2 px-3 text-left underline decoration-slate-300">
                      {row.label}
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className={`py-1.5 px-3 text-slate-800 ${row.isSubItem ? "pl-6 text-slate-600" : "font-medium"}`}>
                    {row.label}
                  </td>
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-600">
                    {formatStatementAmount(row.previousMonth)}
                  </td>
                  <td className="py-1.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                    {formatStatementAmount(row.currentMonth)}
                  </td>
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-600">
                    {formatStatementAmount(row.cumulative)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <td className="py-2.5 px-3 text-left uppercase">TOTAL</td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {formatStatementAmountWithZero(totalPrev)}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums text-primary font-extrabold text-sm">
                ₹{formatStatementAmountWithZero(totalCurr)}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums">
                {formatStatementAmountWithZero(totalCum)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const AccountStatementTable = ({ rows, summary }: { rows: MonthlyStatementRow[]; summary: MonthlyStatementSummary }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <StatementSide title="RECEIPTS" side="receipts" rows={rows} summary={summary} />
      <StatementSide title="PAYMENTS" side="payments" rows={rows} summary={summary} />
    </div>
  );
};

export default AccountStatementTable;
