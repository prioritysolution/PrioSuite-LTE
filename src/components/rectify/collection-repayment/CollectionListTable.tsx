"use client";

import { Loader2, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  formatDisplayDate,
  formatMoney,
} from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import { RectifyCollection } from "@/container/rectify/collection-repayment/CollectionRectifyType";

interface CollectionListTableProps {
  collections: RectifyCollection[];
  loading: boolean;
  startIndex?: number;
  onEdit: (collId: number) => void;
  onDelete: (collection: RectifyCollection) => void;
}

const deleteButtonClass =
  "h-9 px-3 font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700";

const deleteBlockedHint = (row: RectifyCollection) =>
  row.canChangeDate
    ? "Delete collection"
    : "Bulk / demand receipts cannot be deleted here";

const DeleteButton = ({
  row,
  onDelete,
  className = "",
}: {
  row: RectifyCollection;
  onDelete: (collection: RectifyCollection) => void;
  className?: string;
}) => (
  <Button
    type="button"
    size="sm"
    variant="outline"
    disabled={!row.canChangeDate}
    title={deleteBlockedHint(row)}
    onClick={() => onDelete(row)}
    className={`${deleteButtonClass} ${className}`}
  >
    <Trash2 className="h-4 w-4" />
    Delete
  </Button>
);

const BulkBadge = () => (
  <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 border border-amber-200">
    Bulk
  </span>
);

const RectifiedBadge = ({ count }: { count: number }) => (
  <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 border border-sky-200">
    Rectified {count > 1 ? `×${count}` : ""}
  </span>
);

const splitText = (row: RectifyCollection) =>
  [
    `P ${formatMoney(row.prnAmount)}`,
    `I ${formatMoney(row.inttAmount)}`,
    row.penalAmount > 0 ? `Penal ${formatMoney(row.penalAmount)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

const groupText = (row: RectifyCollection) =>
  [row.groupName, row.groupNo ? `(${row.groupNo})` : ""].filter(Boolean).join(" ") ||
  "—";

const CollectionListTable = ({
  collections,
  loading,
  startIndex = 1,
  onEdit,
  onDelete,
}: CollectionListTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl border border-gray-100 bg-slate-50/40">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-semibold">Loading collections</span>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-xl border border-gray-100 bg-slate-50/40">
        <p className="text-sm font-medium text-gray-500">
          No collections found for this search.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-100">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5">
                <TableHead className="w-12 text-center font-bold text-primary">
                  Sl
                </TableHead>
                <TableHead className="min-w-[100px] font-bold text-primary">
                  Date
                </TableHead>
                <TableHead className="min-w-[140px] font-bold text-primary">
                  Voucher
                </TableHead>
                <TableHead className="min-w-[130px] font-bold text-primary">
                  Group
                </TableHead>
                <TableHead className="min-w-[180px] font-bold text-primary">
                  Member
                </TableHead>
                <TableHead className="min-w-[110px] font-bold text-primary">
                  Loan Account
                </TableHead>
                <TableHead className="min-w-[160px] text-right font-bold text-primary">
                  Amount
                </TableHead>
                <TableHead className="w-44 text-center font-bold text-primary">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((row, index) => (
                <TableRow key={row.collId}>
                  <TableCell className="text-center text-gray-500 font-semibold">
                    {startIndex + index}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-700">
                    {formatDisplayDate(row.collDate) || "—"}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-gray-800 whitespace-nowrap">
                      {row.voucherNo || "—"}
                      {row.isBulkVoucher && <BulkBadge />}
                    </p>
                    {row.rectifyCount > 0 && (
                      <div className="mt-1">
                        <RectifiedBadge count={row.rectifyCount} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">{groupText(row)}</TableCell>
                  <TableCell>
                    <p className="font-semibold text-primary">
                      {row.memberName || "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[row.memberNo, row.guardianName].filter(Boolean).join(" · ") ||
                        "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-800">
                      {row.accountLabel || "—"}
                    </p>
                    {row.loanCycle && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Cycle {row.loanCycle}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="font-bold text-primary whitespace-nowrap">
                      {formatMoney(row.collAmount)}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">
                      {splitText(row)}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(row.collId)}
                        className="h-9 px-3 font-semibold text-primary border-primary/20 hover:bg-primary/5"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Button>
                      <DeleteButton row={row} onDelete={onDelete} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
        {collections.map((row) => (
          <article
            key={row.collId}
            className="rounded-xl border border-gray-100 bg-white p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {formatDisplayDate(row.collDate) || "—"}
                </p>
                <p className="font-semibold text-gray-800">
                  {row.voucherNo || "—"}
                  {row.isBulkVoucher && <BulkBadge />}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(row.collId)}
                  className="h-9 px-3 font-semibold text-primary border-primary/20 hover:bg-primary/5"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Button>
                <DeleteButton row={row} onDelete={onDelete} />
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-primary truncate">
                {row.memberName || "—"}
              </h4>
              <p className="text-sm text-gray-500 truncate">{groupText(row)}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-400 text-xs font-semibold uppercase">
                  Account
                </dt>
                <dd className="font-medium text-gray-700">
                  {row.accountLabel || "—"}
                  {row.loanCycle ? ` · Cycle ${row.loanCycle}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs font-semibold uppercase">
                  Amount
                </dt>
                <dd className="font-bold text-primary">
                  {formatMoney(row.collAmount)}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-gray-400">{splitText(row)}</p>
            {row.rectifyCount > 0 && <RectifiedBadge count={row.rectifyCount} />}
          </article>
        ))}
      </div>
    </>
  );
};

export default CollectionListTable;
