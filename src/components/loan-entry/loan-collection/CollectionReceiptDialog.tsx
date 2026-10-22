"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { CollectionResult } from "@/container/loan-entry/loan-collection/LoanCollectionType";

interface CollectionReceiptDialogProps {
  result: CollectionResult | null;
  onClose: () => void;
}

const formatMoney = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CollectionReceiptDialog = ({ result, onClose }: CollectionReceiptDialogProps) => {
  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-3xl sm:max-w-3xl rounded-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" strokeWidth={1.75} />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Collection Saved
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {result?.message}
                {result ? ` · ${result.postedCount} ${result.postedCount === 1 ? "receipt" : "receipts"}` : ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto px-6 py-4">
          {result && result.rows.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="font-bold text-primary">Member</TableHead>
                    <TableHead className="font-bold text-primary">Acct</TableHead>
                    <TableHead className="font-bold text-primary">Voucher No</TableHead>
                    <TableHead className="text-right font-bold text-primary">Amount</TableHead>
                    <TableHead className="text-right font-bold text-primary">
                      New Outstanding
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row) => (
                    <TableRow key={`${row.accountId}-${row.voucherNo}`}>
                      <TableCell>
                        <p className="font-semibold text-primary">{row.memberName || "—"}</p>
                        <p className="text-xs text-gray-400">{row.memberNo || "—"}</p>
                      </TableCell>
                      <TableCell className="text-gray-700">{row.accountId}</TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {row.voucherNo || "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(row.collAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(row.outsAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 font-bold">
                    <TableCell colSpan={3}>
                      Total ({result.totals.count} loans / {result.totals.memberCount} members)
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(result.totals.collAmount)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          ) : (
            result?.voucherNo && (
              <p className="text-center text-sm text-gray-700">
                Receipt No: <span className="font-semibold">{result.voucherNo}</span>
              </p>
            )
          )}
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            onClick={onClose}
            className="h-11 px-8 rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionReceiptDialog;
