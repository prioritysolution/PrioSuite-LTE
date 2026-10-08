"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DailySheetDetailRow } from "@/container/mis-reports/daily-sheet/DailySheetType";
import {
  formatApiDate,
  formatSheetAmount,
} from "@/container/mis-reports/daily-sheet/DailySheetApi";

const DailySheetDetailsDialog = ({
  open,
  title,
  loading,
  rows,
  showBranchColumn,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  loading: boolean;
  rows: DailySheetDetailRow[];
  showBranchColumn: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const receiptTotal = rows.reduce((sum, row) => sum + row.receiptAmount, 0);
  const paymentTotal = rows.reduce((sum, row) => sum + row.paymentAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg font-bold text-primary">
            {title}
          </DialogTitle>
          <DialogDescription>
            Voucher lines for the selected ledger and period.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading vouchers...
            </div>
          ) : rows.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No vouchers found for this selection.
            </p>
          ) : (
            <table className="w-full min-w-[860px] text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200 text-xs tracking-wide text-gray-500 uppercase">
                  <th className="px-2 py-2 text-left font-semibold">Date</th>
                  <th className="px-2 py-2 text-left font-semibold">Voucher No</th>
                  <th className="px-2 py-2 text-left font-semibold">Type</th>
                  <th className="px-2 py-2 text-left font-semibold">Particulars</th>
                  <th className="px-2 py-2 text-left font-semibold">Mode</th>
                  <th className="px-2 py-2 text-right font-semibold">Receipt</th>
                  <th className="px-2 py-2 text-right font-semibold">Payment</th>
                  <th className="px-2 py-2 text-left font-semibold">Remarks</th>
                  {showBranchColumn && (
                    <th className="px-2 py-2 text-left font-semibold">Branch</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.voucherId}-${row.ledgerName}-${row.receiptAmount}-${row.paymentAmount}`}
                    className="border-b border-gray-100"
                  >
                    <td className="px-2 py-2 whitespace-nowrap">
                      {formatApiDate(row.vouDate)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">{row.voucherNo || "-"}</td>
                    <td className="px-2 py-2">{row.vouTypeName || "-"}</td>
                    <td className="px-2 py-2">{row.particulars || "-"}</td>
                    <td className="px-2 py-2">{row.mode || "-"}</td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {formatSheetAmount(row.receiptAmount)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {formatSheetAmount(row.paymentAmount)}
                    </td>
                    <td className="px-2 py-2">{row.remarks || "-"}</td>
                    {showBranchColumn && (
                      <td className="px-2 py-2">{row.branchName || "-"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={5} className="px-2 py-2">
                    Total
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {formatSheetAmount(receiptTotal)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {formatSheetAmount(paymentTotal)}
                  </td>
                  <td colSpan={showBranchColumn ? 2 : 1} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailySheetDetailsDialog;
