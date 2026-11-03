"use client";

import { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, Save } from "lucide-react";
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
import { LoanRectifyProps } from "@/container/rectify/loan-issue/LoanRectifyType";
import RectifyField, { fieldInputClass } from "../collection-repayment/RectifyField";
import RectifyHistoryList from "../collection-repayment/RectifyHistoryList";
import VoucherLinesTable from "../collection-repayment/VoucherLinesTable";

type LoanRectifyDialogProps = Pick<
  LoanRectifyProps,
  | "rectifyForm"
  | "coOptions"
  | "schemeOptions"
  | "purposeOptions"
  | "coLoading"
  | "schemeLoading"
  | "purposeLoading"
  | "dialogOpen"
  | "onCloseDialog"
  | "detailsLoading"
  | "loan"
  | "voucher"
  | "history"
  | "terms"
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

const Notice = ({
  tone,
  children,
}: {
  tone: "info" | "warning";
  children: ReactNode;
}) => (
  <div
    className={cn(
      "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
      tone === "warning"
        ? "border-amber-200 bg-amber-50/70 text-amber-800"
        : "border-sky-100 bg-sky-50/70 text-sky-800",
    )}
  >
    {tone === "warning" ? (
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
    ) : (
      <Info className="h-4 w-4 shrink-0 mt-0.5" />
    )}
    <p>{children}</p>
  </div>
);

const ReadOnlyValue = ({
  label,
  value,
  pending,
  align = "right",
}: {
  label: string;
  value: string;
  pending: boolean;
  align?: "left" | "right";
}) => (
  <RectifyField label={label}>
    <div
      className={cn(
        "flex h-11 items-center rounded-md border-[1.5px] border-border bg-slate-50 px-3 text-[15px] font-semibold text-gray-700",
        align === "right" ? "justify-end" : "justify-start",
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : value || "—"}
    </div>
  </RectifyField>
);

const moneyOrBlank = (value: number | null) => (value === null ? "" : formatMoney(value));

const parseApiDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12) : null;
};

const toDisplay = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

const LoanDateHint = ({
  savedDate,
  newDate,
  maxDate,
}: {
  savedDate: string;
  newDate: Date | string | null;
  maxDate: Date;
}) => {
  const picked = newDate ? new Date(newDate) : null;
  const firstDue =
    picked && !Number.isNaN(picked.getTime())
      ? new Date(picked.getFullYear(), picked.getMonth(), picked.getDate() + 7, 12)
      : null;
  return (
    <p className="px-1 text-xs text-gray-500 leading-relaxed">
      Saved: <span className="font-semibold">{formatDisplayDate(savedDate) || "—"}</span>.
      Pick any date up to <span className="font-semibold">{toDisplay(maxDate)}</span>.
      {firstDue && (
        <>
          {" "}
          Schedule due dates move with it: 1st installment on{" "}
          <span className="font-semibold">{toDisplay(firstDue)}</span>, then weekly.
        </>
      )}
    </p>
  );
};

const LoanRectifyDialog = ({
  rectifyForm,
  coOptions,
  schemeOptions,
  purposeOptions,
  coLoading,
  schemeLoading,
  purposeLoading,
  dialogOpen,
  onCloseDialog,
  detailsLoading,
  loan,
  voucher,
  history,
  terms,
  saving,
  onSave,
  result,
}: LoanRectifyDialogProps) => {
  const { errors } = rectifyForm.formState;
  const reasonLength = (rectifyForm.watch("reason") || "").length;
  const newLoanDate = rectifyForm.watch("loan_date");

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const firstColl = loan ? parseApiDate(loan.firstCollDate) : null;
  const loanDateMax = firstColl && firstColl < today ? firstColl : today;

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
            Rectify Loan Issue
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {loan
              ? `Voucher ${loan.voucherNo || "—"}${
                  loan.transModeName ? ` · ${loan.transModeName}` : ""
                }. The loan account and voucher number stay the same after the correction.`
              : "Correct an issued loan."}
          </DialogDescription>
        </DialogHeader>

        {detailsLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-semibold">Loading loan</span>
            </div>
          </div>
        ) : !loan ? (
          <div className="flex items-center justify-center h-32 rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">Loan not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <SectionTitle>Saved</SectionTitle>
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-slate-50/60 p-4 md:grid-cols-4">
                <Fact label="Loan Date" value={formatDisplayDate(loan.loanDate)} />
                <Fact
                  label="Voucher"
                  value={
                    loan.refVouNo && loan.refVouNo !== loan.voucherNo
                      ? `${loan.voucherNo} (Ref ${loan.refVouNo})`
                      : loan.voucherNo
                  }
                />
                <Fact
                  label="Group"
                  value={[loan.groupName, loan.groupNo ? `(${loan.groupNo})` : ""]
                    .filter(Boolean)
                    .join(" ")}
                />
                <Fact
                  label="Member"
                  value={[loan.memberName, loan.memberNo ? `(${loan.memberNo})` : ""]
                    .filter(Boolean)
                    .join(" ")}
                />
                <Fact
                  label="Loan Account"
                  value={[
                    loan.accountLabel,
                    loan.loanCycle ? `Cycle ${loan.loanCycle}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
                <Fact label="Loan Amount" value={formatMoney(loan.loanAmount)} emphasis />
                <Fact
                  label="Scheme"
                  value={[loan.schemeName, loan.roi ? `${loan.roi}%` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                />
                <Fact
                  label="Installments"
                  value={
                    loan.instNo
                      ? `${loan.instNo} × ${formatMoney(loan.instAmount)}${
                          loan.repayName ? ` (${loan.repayName})` : ""
                        }`
                      : ""
                  }
                />
                <Fact label="Realisable" value={formatMoney(loan.realisableAmt)} />
                <Fact label="Final Date" value={formatDisplayDate(loan.finalDate)} />
                <Fact label="Purpose" value={loan.purposeName} />
                <Fact label="Guarantor" value={loan.guarantorName} />
                <Fact label="Sahayika" value={loan.coName} />
                <Fact
                  label="Repayments"
                  value={
                    loan.collCount
                      ? `${loan.collCount} (first ${formatDisplayDate(loan.firstCollDate)})`
                      : "None yet"
                  }
                />
                <Fact label="Principal Repaid" value={formatMoney(loan.prnCollected)} />
                <Fact label="Outstanding" value={formatMoney(loan.outstanding)} />
              </div>
            </section>

            {result ? (
              <section className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-emerald-800">{result.message}</p>
                    <p className="text-sm text-emerald-700">
                      Voucher {result.voucherNo || "—"}
                      {result.loanDate ? ` · ${formatDisplayDate(result.loanDate)}` : ""}
                      {result.affectedLoans > 1
                        ? ` · ${result.affectedLoans} loans on this voucher updated`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 p-4 md:grid-cols-4">
                  <Fact label="Loan Amount" value={formatMoney(result.loanAmount)} emphasis />
                  <Fact
                    label="Scheme"
                    value={[result.schemeName, result.roi ? `${result.roi}%` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                  <Fact
                    label="Installments"
                    value={
                      result.instNo
                        ? `${result.instNo} × ${moneyOrBlank(result.instAmount)}`
                        : ""
                    }
                  />
                  <Fact label="Realisable" value={moneyOrBlank(result.realisableAmt)} />
                  <Fact label="Final Date" value={formatDisplayDate(result.finalDate)} />
                  <Fact label="Outstanding" value={formatMoney(result.outstanding)} />
                </div>
              </section>
            ) : (
              <Form {...rectifyForm}>
                <section className="space-y-4">
                  <SectionTitle>Correct</SectionTitle>

                  {!loan.canChangeTerms && (
                    <Notice tone="warning">
                      {loan.lockReason ||
                        "The loan date and amount of this loan cannot be changed."}{" "}
                      You can still correct the purpose, guarantor and Sahayika.
                    </Notice>
                  )}
                  {loan.canChangeTerms && loan.collCount > 0 && (
                    <Notice tone="info">
                      This loan already has {loan.collCount} repayment
                      {loan.collCount > 1 ? "s" : ""}. The loan date cannot be after{" "}
                      {formatDisplayDate(loan.firstCollDate)} and the amount cannot be
                      less than {formatMoney(loan.prnCollected)} (principal repaid). The
                      schedule and outstanding are recalculated on save.
                    </Notice>
                  )}
                  {loan.canChangeTerms && loan.voucherLoanCount > 1 && (
                    <Notice tone="info">
                      Voucher {loan.voucherNo} pays out {loan.voucherLoanCount} loans.
                      Changing the loan date moves all {loan.voucherLoanCount} loans to the
                      new date.
                    </Notice>
                  )}

                  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-1.5">
                      <DatePicker
                        control={rectifyForm.control}
                        name="loan_date"
                        label={loan.canChangeTerms ? "New Loan Date" : "Loan Date"}
                        placeholder="Select date"
                        isRequired
                        disableFuture
                        maxDate={loanDateMax}
                        allowClear={false}
                        disabled={!loan.canChangeTerms || saving}
                      />
                      {loan.canChangeTerms && (
                        <LoanDateHint
                          savedDate={loan.loanDate}
                          newDate={newLoanDate}
                          maxDate={loanDateMax}
                        />
                      )}
                    </div>
                    <RectifyField
                      label="Loan Amount"
                      required
                      error={errors.loan_amount?.message}
                    >
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="decimal"
                        disabled={!loan.canChangeTerms || saving}
                        className={cn(fieldInputClass, "text-right")}
                        {...rectifyForm.register("loan_amount")}
                      />
                    </RectifyField>
                    <DropdownField
                      control={rectifyForm.control}
                      name="scheme_id"
                      label="Scheme"
                      className="space-y-0"
                      options={schemeOptions}
                      optionLabelKey="label"
                      optionValueKey="value"
                      isSearch
                      isRequired
                      allowClear={false}
                      loading={schemeLoading}
                      disabled={!loan.canChangeScheme || saving}
                      hint={
                        loan.canChangeScheme
                          ? undefined
                          : "The scheme can only be changed before the first repayment."
                      }
                      placeholder="Select scheme"
                    />
                    <DropdownField
                      control={rectifyForm.control}
                      name="purpose_id"
                      label="Purpose"
                      className="space-y-0"
                      options={purposeOptions}
                      optionLabelKey="label"
                      optionValueKey="value"
                      isSearch
                      loading={purposeLoading}
                      disabled={saving}
                      placeholder="Keep saved purpose"
                    />
                    <RectifyField
                      label="Guarantor Name"
                      error={errors.guarantor_name?.message}
                    >
                      <Input
                        maxLength={100}
                        disabled={saving}
                        placeholder="Guarantor name"
                        className={fieldInputClass}
                        {...rectifyForm.register("guarantor_name")}
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

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Recalculated from date, amount and scheme
                    </p>
                    <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3 xl:grid-cols-5">
                      <ReadOnlyValue
                        label="RoI"
                        value={terms.roi === null ? "" : `${terms.roi}%`}
                        pending={terms.pending}
                      />
                      <ReadOnlyValue
                        label="Installments"
                        value={terms.instNo === null ? "" : String(terms.instNo)}
                        pending={terms.pending}
                      />
                      <ReadOnlyValue
                        label="Installment Amount"
                        value={moneyOrBlank(terms.instAmount)}
                        pending={terms.pending}
                      />
                      <ReadOnlyValue
                        label="Realisable"
                        value={moneyOrBlank(terms.realisableAmt)}
                        pending={terms.pending}
                      />
                      <ReadOnlyValue
                        label="Final Date"
                        value={formatDisplayDate(terms.finalDate)}
                        pending={terms.pending}
                        align="left"
                      />
                    </div>
                    {terms.error && (
                      <p className="text-xs font-medium text-red-500">{terms.error}</p>
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
                      placeholder="e.g. Loan amount typed as 20000; sanctioned amount is 25000"
                      className="min-h-[80px] text-[15px] border-[1.5px] resize-none"
                      {...rectifyForm.register("reason")}
                    />
                  </RectifyField>
                </section>
              </Form>
            )}

            <section className="space-y-3">
              <SectionTitle>
                {result ? "Voucher After Correction" : "Disbursement Voucher"}
              </SectionTitle>
              <VoucherLinesTable
                lines={result ? result.voucher : voucher}
                emptyText="This loan has no disbursement voucher lines."
              />
            </section>

            <section className="space-y-3">
              <SectionTitle>Past Corrections</SectionTitle>
              <RectifyHistoryList
                history={history}
                emptyText="This loan has not been corrected before."
              />
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
          {!result && loan && (
            <Button
              type="button"
              onClick={onSave}
              disabled={saving || detailsLoading || terms.pending}
              className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Correction"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanRectifyDialog;
