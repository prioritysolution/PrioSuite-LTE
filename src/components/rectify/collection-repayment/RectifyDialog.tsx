"use client";

import { ReactNode } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { cn } from "@/lib/utils";
import {
  formatDisplayDate,
  formatMoney,
} from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import { CollectionRectifyProps } from "@/container/rectify/collection-repayment/CollectionRectifyType";
import RectifyField, { fieldInputClass } from "./RectifyField";
import RectifyHistoryList from "./RectifyHistoryList";
import VoucherLinesTable from "./VoucherLinesTable";

type RectifyDialogProps = Pick<
  CollectionRectifyProps,
  | "rectifyForm"
  | "groupOptions"
  | "coOptions"
  | "groupLoading"
  | "coLoading"
  | "dialogOpen"
  | "onCloseDialog"
  | "detailsLoading"
  | "collection"
  | "voucher"
  | "history"
  | "loanOptions"
  | "loansLoading"
  | "loanSearch"
  | "onLoanSearchChange"
  | "onTargetGroupChange"
  | "selectedLoan"
  | "split"
  | "saving"
  | "onSave"
  | "result"
>;

const REASON_MAX_LENGTH = 200;

const Fact = ({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) => (
  <div className="min-w-0">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p
      className={cn(
        "text-sm truncate",
        emphasis ? "font-bold text-primary" : "font-medium text-gray-800",
      )}
    >
      {value || "—"}
    </p>
  </div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h4 className="text-sm font-bold uppercase tracking-wide text-primary">
    {children}
  </h4>
);

const ReadOnlyAmount = ({
  label,
  value,
  pending,
}: {
  label: string;
  value: number | null;
  pending: boolean;
}) => (
  <RectifyField label={label}>
    <div className="flex h-11 items-center justify-end rounded-md border-[1.5px] border-border bg-slate-50 px-3 text-[15px] font-semibold text-gray-700">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : value === null ? (
        "—"
      ) : (
        formatMoney(value)
      )}
    </div>
  </RectifyField>
);

const RectifyDialog = ({
  rectifyForm,
  groupOptions,
  coOptions,
  groupLoading,
  coLoading,
  dialogOpen,
  onCloseDialog,
  detailsLoading,
  collection,
  voucher,
  history,
  loanOptions,
  loansLoading,
  loanSearch,
  onLoanSearchChange,
  onTargetGroupChange,
  selectedLoan,
  split,
  saving,
  onSave,
  result,
}: RectifyDialogProps) => {
  const { errors } = rectifyForm.formState;
  const reasonLength = (rectifyForm.watch("reason") || "").length;
  const savedGroup = collection
    ? [collection.groupName, collection.groupNo ? `(${collection.groupNo})` : ""]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) onCloseDialog();
      }}
    >
      <DialogContent
        className="sm:max-w-5xl max-h-[92vh] overflow-y-auto border border-gray-100 shadow-2xl rounded-xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Rectify Collection
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {collection
              ? `Voucher ${collection.voucherNo || "—"}${
                  collection.isBulkVoucher ? " · Bulk receipt" : ""
                }. The voucher number stays the same after the correction.`
              : "Correct a saved loan repayment."}
          </DialogDescription>
        </DialogHeader>

        {detailsLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-semibold">Loading collection</span>
            </div>
          </div>
        ) : !collection ? (
          <div className="flex items-center justify-center h-32 rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              Collection not found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <SectionTitle>Saved</SectionTitle>
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-slate-50/60 p-4 md:grid-cols-4">
                <Fact label="Date" value={formatDisplayDate(collection.collDate)} />
                <Fact
                  label="Voucher"
                  value={
                    collection.refVouNo && collection.refVouNo !== collection.voucherNo
                      ? `${collection.voucherNo} (Ref ${collection.refVouNo})`
                      : collection.voucherNo
                  }
                />
                <Fact label="Group" value={savedGroup} />
                <Fact
                  label="Member"
                  value={[
                    collection.memberName,
                    collection.memberNo ? `(${collection.memberNo})` : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
                <Fact
                  label="Loan Account"
                  value={[
                    collection.accountLabel,
                    collection.loanCycle ? `Cycle ${collection.loanCycle}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
                <Fact label="Sahayika" value={collection.coName} />
                <Fact
                  label="Amount"
                  value={formatMoney(collection.collAmount)}
                  emphasis
                />
                <Fact
                  label="Principal / Interest"
                  value={`${formatMoney(collection.prnAmount)} / ${formatMoney(
                    collection.inttAmount,
                  )}`}
                />
                <Fact label="Penal" value={formatMoney(collection.penalAmount)} />
                <Fact
                  label="Outstanding After"
                  value={formatMoney(collection.outsAfterColl)}
                />
                {collection.branchName && (
                  <Fact label="Branch" value={collection.branchName} />
                )}
              </div>
            </section>

            {result ? (
              <section className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-800">
                      {result.message}
                    </p>
                    <p className="text-sm text-emerald-700">
                      Voucher {result.voucherNo || "—"}
                      {result.collDate
                        ? ` · ${formatDisplayDate(result.collDate)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 p-4 md:grid-cols-4">
                  <Fact
                    label="Amount"
                    value={formatMoney(result.collAmount)}
                    emphasis
                  />
                  <Fact
                    label="Principal / Interest"
                    value={`${formatMoney(result.prnAmount)} / ${formatMoney(
                      result.inttAmount,
                    )}`}
                  />
                  <Fact label="Penal" value={formatMoney(result.penalAmount)} />
                  {result.accountChanged ? (
                    <>
                      <Fact
                        label="Old Loan Outstanding"
                        value={formatMoney(result.oldAccountOuts)}
                      />
                      <Fact
                        label="New Loan Outstanding"
                        value={formatMoney(result.newAccountOuts)}
                      />
                    </>
                  ) : (
                    <Fact
                      label="Loan Outstanding"
                      value={formatMoney(result.newAccountOuts)}
                    />
                  )}
                </div>
              </section>
            ) : (
              <Form {...rectifyForm}>
                <section className="space-y-4">
                  <SectionTitle>Correct</SectionTitle>

                  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                    <DropdownField
                      control={rectifyForm.control}
                      name="group_id"
                      label="Group"
                      className="space-y-0"
                      options={groupOptions}
                      optionLabelKey="label"
                      optionValueKey="value"
                      isSearch
                      loading={groupLoading}
                      disabled={saving}
                      placeholder="Select group"
                      onChange={() => onTargetGroupChange()}
                    />
                    <RectifyField
                      label="Search Loan"
                      hint="Account no., member no. or member name"
                    >
                      <Input
                        value={loanSearch}
                        onChange={(event) => onLoanSearchChange(event.target.value)}
                        placeholder="Type at least 2 characters"
                        disabled={saving}
                        className={fieldInputClass}
                      />
                    </RectifyField>
                  </div>

                  <DropdownField
                    control={rectifyForm.control}
                    name="account_id"
                    label="Correct Loan Account"
                    className="space-y-0"
                    options={loanOptions}
                    optionLabelKey="label"
                    optionValueKey="value"
                    isSearch
                    isRequired
                    disableSorting
                    loading={loansLoading}
                    disabled={saving}
                    placeholder={
                      loanOptions.length
                        ? "Select loan account"
                        : "Select a group or search to list loans"
                    }
                  />

                  {selectedLoan && (
                    <div className="grid grid-cols-2 gap-4 rounded-xl border border-primary/10 bg-primary/5 p-4 md:grid-cols-4">
                      <Fact
                        label="Member"
                        value={[
                          selectedLoan.memberName,
                          selectedLoan.memberNo ? `(${selectedLoan.memberNo})` : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      <Fact label="Guardian" value={selectedLoan.guardianName} />
                      <Fact
                        label="Group"
                        value={[
                          selectedLoan.groupName,
                          selectedLoan.groupNo ? `(${selectedLoan.groupNo})` : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      <Fact label="Sahayika" value={selectedLoan.coName} />
                      <Fact
                        label="Loan"
                        value={`${formatMoney(selectedLoan.loanAmount)} · ${formatDisplayDate(
                          selectedLoan.loanDate,
                        )}`}
                      />
                      <Fact
                        label="Balance On Date"
                        value={formatMoney(selectedLoan.balanceOnDate)}
                      />
                      <Fact
                        label="Demand On Date"
                        value={formatMoney(selectedLoan.demandOnDate)}
                      />
                      <Fact
                        label="Max Collection"
                        value={formatMoney(selectedLoan.maxCollAmount)}
                        emphasis
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DatePicker
                      control={rectifyForm.control}
                      name="coll_date"
                      label="Collection Date"
                      placeholder="Select date"
                      disabled={!collection.canChangeDate || saving}
                      allowClear={false}
                    />
                    <RectifyField
                      label="Amount"
                      required
                      error={errors.coll_amount?.message}
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        disabled={saving}
                        className={cn(fieldInputClass, "text-right")}
                        {...rectifyForm.register("coll_amount")}
                      />
                    </RectifyField>
                    <RectifyField label="Penal" error={errors.penal_amount?.message}>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        disabled={saving}
                        className={cn(fieldInputClass, "text-right")}
                        {...rectifyForm.register("penal_amount")}
                      />
                    </RectifyField>
                    <DropdownField
                      control={rectifyForm.control}
                      name="co_id"
                      label="Sahayika"
                      className="space-y-0"
                      options={coOptions}
                      optionLabelKey="label"
                      optionValueKey="value"
                      isSearch
                      loading={coLoading}
                      disabled={saving}
                      placeholder="Keep saved Sahayika"
                    />
                  </div>
                  {!collection.canChangeDate && (
                    <p className="-mt-2 text-xs text-muted-foreground">
                      The date of a bulk receipt cannot be changed.
                    </p>
                  )}

                  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <ReadOnlyAmount
                      label="Principal"
                      value={split.prnAmount}
                      pending={split.pending}
                    />
                    <ReadOnlyAmount
                      label="Interest"
                      value={split.inttAmount}
                      pending={split.pending}
                    />
                    {split.error && (
                      <p className="text-xs font-medium text-red-500 md:col-span-2 xl:self-center">
                        {split.error}
                      </p>
                    )}
                  </div>

                  <RectifyField
                    label="Reason"
                    required
                    error={errors.reason?.message}
                    hint={`${reasonLength}/${REASON_MAX_LENGTH}`}
                  >
                    <Textarea
                      rows={3}
                      maxLength={REASON_MAX_LENGTH}
                      disabled={saving}
                      placeholder="e.g. Entered under the wrong member; paid by the correct member"
                      className="min-h-[80px] text-[15px] border-[1.5px] resize-none"
                      {...rectifyForm.register("reason")}
                    />
                  </RectifyField>
                </section>
              </Form>
            )}

            <section className="space-y-3">
              <SectionTitle>
                {result ? "Voucher After Correction" : "Voucher Lines"}
              </SectionTitle>
              <VoucherLinesTable lines={result ? result.voucher : voucher} />
            </section>

            <section className="space-y-3">
              <SectionTitle>Past Corrections</SectionTitle>
              <RectifyHistoryList history={history} />
            </section>
          </div>
        )}

        <DialogFooter className="gap-2 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCloseDialog}
            disabled={saving}
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && collection && (
            <Button
              type="button"
              onClick={onSave}
              disabled={saving || detailsLoading}
              className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Correction"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RectifyDialog;
