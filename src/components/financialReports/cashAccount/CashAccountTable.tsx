"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { CashAccountReportData } from "@/container/financialReports/cashAccount/cashAccountType";
import { cn } from "@/lib/utils";

interface CashAccountTableProps {
  data: CashAccountReportData | null;
  loading?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  if (value === undefined || value === null) return "₹0.00";
  return currencyFormatter.format(value);
}

export function CashAccountTable({ data, loading }: CashAccountTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[280px] sm:h-[320px] rounded-xl border border-gray-100 bg-slate-50/50">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="animate-spin" size={36} />
          <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
            Loading Report...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[220px] sm:h-[260px] rounded-xl border border-dashed border-gray-200 bg-slate-50/40">
        <p className="text-sm text-gray-500 font-medium text-center px-4">
          Please select filters and search to view the report.
        </p>
      </div>
    );
  }

  const receipts = data.Receipts || [];
  const payments = data.Payments || [];
  const maxRows = Math.max(receipts.length, payments.length);

  const subTotalReceipts = receipts.reduce(
    (acc, curr) => acc + (curr.Receipt_Amount || 0),
    0,
  );
  const subTotalPayments = payments.reduce(
    (acc, curr) => acc + (curr.Payment_Amount || 0),
    0,
  );

  const openingBalance = data.Opening_Cash_Balance || 0;
  const closingBalance = data.Closing_Cash_Balance || 0;

  const grandTotalReceipts = subTotalReceipts + openingBalance;
  const grandTotalPayments = subTotalPayments + closingBalance;

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th
                colSpan={3}
                className="text-center py-3 px-4 border-r border-primary-foreground/15 text-[13px] font-bold uppercase tracking-wider"
              >
                Receipt
              </th>
              <th
                colSpan={3}
                className="text-center py-3 px-4 text-[13px] font-bold uppercase tracking-wider"
              >
                Payment
              </th>
            </tr>
            <tr className="bg-primary/5 text-primary border-b border-gray-100">
              <th className="py-2.5 px-3 text-left border-r border-gray-100 w-12 font-semibold text-[12px] uppercase tracking-wide">
                Sl
              </th>
              <th className="py-2.5 px-3 text-left border-r border-gray-100 font-semibold text-[12px] uppercase tracking-wide">
                Ledger Name
              </th>
              <th className="py-2.5 px-3 text-right border-r border-gray-100 w-36 font-semibold text-[12px] uppercase tracking-wide">
                Amount
              </th>
              <th className="py-2.5 px-3 text-left border-r border-gray-100 w-12 font-semibold text-[12px] uppercase tracking-wide">
                Sl
              </th>
              <th className="py-2.5 px-3 text-left border-r border-gray-100 font-semibold text-[12px] uppercase tracking-wide">
                Ledger Name
              </th>
              <th className="py-2.5 px-3 text-right w-36 font-semibold text-[12px] uppercase tracking-wide">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {maxRows === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-gray-500 font-medium bg-slate-50/50"
                >
                  No receipts or payments found for this period.
                </td>
              </tr>
            ) : (
              Array.from({ length: maxRows }).map((_, index) => {
                const receipt = receipts[index];
                const payment = payments[index];

                return (
                  <tr
                    key={index}
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors border-b border-gray-100",
                      index % 2 === 1 ? "bg-slate-50/40" : "bg-white",
                    )}
                  >
                    <td className="py-3 px-3 border-r border-gray-100 font-semibold text-gray-500 text-xs">
                      {receipt ? index + 1 : ""}
                    </td>
                    <td className="py-3 px-3 border-r border-gray-100 text-gray-700 font-medium">
                      {receipt ? receipt.Receipt_Ledger_Name : ""}
                    </td>
                    <td className="py-3 px-3 border-r border-gray-100 text-right font-mono font-medium text-gray-900">
                      {receipt ? formatCurrency(receipt.Receipt_Amount) : ""}
                    </td>

                    <td className="py-3 px-3 border-r border-gray-100 font-semibold text-gray-500 text-xs">
                      {payment ? index + 1 : ""}
                    </td>
                    <td className="py-3 px-3 border-r border-gray-100 text-gray-700 font-medium">
                      {payment ? payment.Payment_Ledger_Name : ""}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-gray-900">
                      {payment ? formatCurrency(payment.Payment_Amount) : ""}
                    </td>
                  </tr>
                );
              })
            )}

            <tr className="bg-slate-50 font-bold border-t border-gray-200">
              <td
                colSpan={2}
                className="py-2.5 px-3 text-right border-r border-gray-100 text-gray-600 font-semibold"
              >
                Sub Total
              </td>
              <td className="py-2.5 px-3 text-right border-r border-gray-100 font-mono text-gray-900 font-bold">
                {formatCurrency(subTotalReceipts)}
              </td>
              <td
                colSpan={2}
                className="py-2.5 px-3 text-right border-r border-gray-100 text-gray-600 font-semibold"
              >
                Sub Total
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-gray-900 font-bold">
                {formatCurrency(subTotalPayments)}
              </td>
            </tr>

            <tr className="bg-white font-medium border-b border-gray-100">
              <td
                colSpan={2}
                className="py-2.5 px-3 text-right border-r border-gray-100 text-gray-500"
              >
                Opening Balance
              </td>
              <td className="py-2.5 px-3 text-right border-r border-gray-100 font-mono text-gray-800">
                {formatCurrency(openingBalance)}
              </td>
              <td
                colSpan={2}
                className="py-2.5 px-3 text-right border-r border-gray-100 text-gray-500"
              >
                Closing Balance
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-gray-800">
                {formatCurrency(closingBalance)}
              </td>
            </tr>

            <tr className="bg-primary/5 font-extrabold text-primary">
              <td
                colSpan={2}
                className="py-3 px-3 text-right border-r border-gray-100 font-bold uppercase tracking-wider text-xs"
              >
                Grand Total
              </td>
              <td className="py-3 px-3 text-right border-r border-gray-100 font-mono text-base sm:text-lg font-extrabold">
                {formatCurrency(grandTotalReceipts)}
              </td>
              <td
                colSpan={2}
                className="py-3 px-3 text-right border-r border-gray-100 font-bold uppercase tracking-wider text-xs"
              >
                Grand Total
              </td>
              <td className="py-3 px-3 text-right font-mono text-base sm:text-lg font-extrabold">
                {formatCurrency(grandTotalPayments)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CashAccountTable;
