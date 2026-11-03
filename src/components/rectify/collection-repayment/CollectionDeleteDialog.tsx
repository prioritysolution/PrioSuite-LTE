"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatDisplayDate,
  formatMoney,
} from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import { CollectionRectifyProps } from "@/container/rectify/collection-repayment/CollectionRectifyType";

type CollectionDeleteDialogProps = Pick<
  CollectionRectifyProps,
  "deleteTarget" | "deleting" | "onCancelDelete" | "onConfirmDelete"
>;

const CollectionDeleteDialog = ({
  deleteTarget,
  deleting,
  onCancelDelete,
  onConfirmDelete,
}: CollectionDeleteDialogProps) => {
  const details = deleteTarget
    ? [
        ["Voucher", deleteTarget.voucherNo || "—"],
        ["Date", formatDisplayDate(deleteTarget.collDate) || "—"],
        ["Member", deleteTarget.memberName || "—"],
        [
          "Loan Account",
          [
            deleteTarget.accountLabel,
            deleteTarget.loanCycle ? `Cycle ${deleteTarget.loanCycle}` : "",
          ]
            .filter(Boolean)
            .join(" · ") || "—",
        ],
        ["Amount", formatMoney(deleteTarget.collAmount)],
      ]
    : [];

  return (
    <Dialog
      open={deleteTarget !== null}
      onOpenChange={(open) => {
        if (!open) onCancelDelete();
      }}
    >
      <DialogContent
        className="sm:max-w-md border border-gray-100 shadow-2xl rounded-xl"
        showCloseButton={!deleting}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Collection?
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            The collection and its receipt voucher will be permanently deleted, and the
            loan&apos;s paid installments and outstanding will be recalculated. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <dl className="divide-y divide-gray-100 rounded-lg border border-gray-100 bg-slate-50/50 text-sm">
          {details.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <dt className="text-gray-500">{label}</dt>
              <dd className="text-right font-semibold text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>

        <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelDelete}
            disabled={deleting}
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirmDelete}
            disabled={deleting}
            className="h-11 px-5 bg-red-600 text-white hover:bg-red-700 font-semibold rounded-lg"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDeleteDialog;
