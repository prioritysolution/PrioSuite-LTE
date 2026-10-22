"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import { VoucherLine } from "@/container/rectify/collection-repayment/CollectionRectifyType";

interface VoucherLinesTableProps {
  lines: VoucherLine[];
  emptyText?: string;
}

const VoucherLinesTable = ({
  lines,
  emptyText = "This collection has no voucher lines.",
}: VoucherLinesTableProps) => {
  if (lines.length === 0) {
    return (
      <p className="rounded-lg border border-gray-100 bg-slate-50/60 px-4 py-3 text-sm text-gray-500">
        {emptyText}
      </p>
    );
  }

  const totalDr = lines.reduce((sum, line) => sum + line.drAmount, 0);
  const totalCr = lines.reduce((sum, line) => sum + line.crAmount, 0);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 hover:bg-primary/5">
              <TableHead className="w-14 font-bold text-primary">Dr/Cr</TableHead>
              <TableHead className="min-w-[180px] font-bold text-primary">
                Ledger
              </TableHead>
              <TableHead className="min-w-[220px] font-bold text-primary">
                Remarks
              </TableHead>
              <TableHead className="min-w-[110px] text-right font-bold text-primary">
                Debit
              </TableHead>
              <TableHead className="min-w-[110px] text-right font-bold text-primary">
                Credit
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={`${line.voucherNo}-${index}`}>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded px-1.5 py-0.5 text-[11px] font-bold",
                      line.transType === "D"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-sky-50 text-sky-700",
                    )}
                  >
                    {line.transType === "D" ? "Dr" : "Cr"}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-gray-800">
                  {line.glAccountName || "—"}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {line.remarks || "—"}
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-800 whitespace-nowrap">
                  {line.drAmount ? formatMoney(line.drAmount) : ""}
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-800 whitespace-nowrap">
                  {line.crAmount ? formatMoney(line.crAmount) : ""}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableCell colSpan={3} className="text-right font-bold text-gray-600">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                {formatMoney(totalDr)}
              </TableCell>
              <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                {formatMoney(totalCr)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default VoucherLinesTable;
