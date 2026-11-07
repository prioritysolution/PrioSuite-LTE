"use client";

import { ReactNode } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Lock,
  Scale,
  ScrollText,
  Wallet,
} from "lucide-react";
import DropdownField from "@/common/formFields/DropdownField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  formatDisplayDate,
  formatMoney,
} from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import {
  OPENING_ENTRY_DATE_LABEL,
  OpeningEntryPageProps,
  OpeningEntryTab,
  OpeningSaveResult,
  OpeningScheduleSummary,
  REASON_MAX_LENGTH,
} from "@/container/rectify/opening-entry/OpeningEntryType";
import { cn } from "@/lib/utils";
import FilterCard from "../collection-repayment/FilterCard";
import RectifyField, { fieldInputClass } from "../collection-repayment/RectifyField";

const sanitizeAmountInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
};

const TABS: { id: OpeningEntryTab; label: string; icon: ReactNode }[] = [
  { id: "edit", label: "Opening Balance", icon: <Wallet size={16} /> },
  { id: "log", label: "Activity Log", icon: <ScrollText size={16} /> },
];

interface OpeningEntryShellProps {
  tab: OpeningEntryTab;
  onTabChange: (tab: OpeningEntryTab) => void;
  children: ReactNode;
}

export const OpeningEntryShell = ({
  tab,
  onTabChange,
  children,
}: OpeningEntryShellProps) => (
  <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="page-header-card">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
      <div className="min-w-0 pl-2">
        <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
          Loan Opening Entry
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Correct the opening balance as of {OPENING_ENTRY_DATE_LABEL}. Pending
          loan schedule rows are recalculated on save and every attempt is logged.
        </p>
      </div>
    </div>

    <div
      role="tablist"
      className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm"
    >
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={tab === item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
            tab === item.id
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-primary/5 hover:text-primary",
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>

    {children}
  </div>
);

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
    <p className="truncate text-sm font-semibold text-gray-800">{value || "—"}</p>
  </div>
);

const ScheduleStat = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="min-w-0 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-bold text-gray-800">{value}</p>
    {hint ? <p className="mt-0.5 text-xs text-gray-400">{hint}</p> : null}
  </div>
);

const SchedulePanel = ({
  schedule,
  changed,
}: {
  schedule: OpeningScheduleSummary;
  changed: boolean;
}) => (
  <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <CalendarClock size={16} />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-sky-900">Pending Loan Schedule</h4>
        <p className="mt-0.5 text-xs text-sky-800/80">
          {changed
            ? "Preview after this opening change. Save recalculates unpaid installment rows on the server."
            : "Unpaid installment rows linked to this loan. Changing opening balance updates these on save."}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <ScheduleStat
        label="Pending Inst."
        value={String(schedule.pendingInstCount || 0)}
      />
      <ScheduleStat
        label="Pending Principal"
        value={formatMoney(schedule.pendingPrincipal)}
      />
      <ScheduleStat
        label="Pending Interest"
        value={formatMoney(schedule.pendingInterest)}
      />
      <ScheduleStat
        label="Pending Demand"
        value={formatMoney(schedule.pendingDemand)}
      />
      <ScheduleStat
        label="Installment Amt"
        value={schedule.instAmount ? formatMoney(schedule.instAmount) : "—"}
      />
      <ScheduleStat
        label="Next Due"
        value={formatDisplayDate(schedule.nextDueDate) || "—"}
      />
    </div>
  </div>
);

const SaveResultBanner = ({
  result,
  onDismiss,
}: {
  result: OpeningSaveResult;
  onDismiss: () => void;
}) => (
  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-emerald-900">{result.message}</p>
          <p className="text-xs text-emerald-800/80">
            Opening {formatMoney(result.oldOpeningBalance)} →{" "}
            {formatMoney(result.newOpeningBalance)} · Current{" "}
            {formatMoney(result.oldCurrentBalance)} →{" "}
            {formatMoney(result.newCurrentBalance)}
            {result.schedule.rowsUpdated > 0
              ? ` · ${result.schedule.rowsUpdated} schedule row(s) updated`
              : ""}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onDismiss}
        className="h-9 shrink-0 border-emerald-200 bg-white px-3 text-emerald-800 hover:bg-emerald-100"
      >
        Dismiss
      </Button>
    </div>
  </div>
);

interface EditTabProps extends OpeningEntryPageProps {}

const OpeningEditTab = ({
  searchForm,
  editForm,
  groupOptions,
  memberOptions,
  loanOptions,
  groupLoading,
  memberLoading,
  loanLoading,
  groupSelected,
  memberSelected,
  searching,
  entry,
  entryError,
  hasSearched,
  openingText,
  reasonText,
  projectedCurrent,
  projectedSchedule,
  minOpening,
  currentIsNegative,
  saving,
  saveResult,
  onDismissResult,
  onSearch,
  onResetSearch,
  onSave,
}: EditTabProps) => {
  const openingError = editForm.formState.errors.openingBalance?.message;
  const reasonError = editForm.formState.errors.reason?.message;
  const currentLabel =
    projectedCurrent === null ? "" : formatMoney(projectedCurrent);
  const scheduleChanged =
    !!entry &&
    !!projectedSchedule &&
    (projectedSchedule.pendingPrincipal !== entry.schedule.pendingPrincipal ||
      projectedSchedule.pendingDemand !== entry.schedule.pendingDemand);

  return (
    <div className="form-sections">
      <FilterCard
        form={searchForm}
        title="Find Loan"
        loading={searching}
        onSearch={onSearch}
        onReset={onResetSearch}
      >
        <DropdownField
          control={searchForm.control}
          name="groupId"
          label="Group"
          className="space-y-0"
          options={groupOptions}
          optionLabelKey="label"
          optionValueKey="value"
          isSearch
          isRequired
          loading={groupLoading}
          placeholder="Select group"
        />
        <DropdownField
          control={searchForm.control}
          name="memberId"
          label="Member"
          className="space-y-0"
          options={memberOptions}
          optionLabelKey="label"
          optionValueKey="value"
          isSearch
          isRequired
          disabled={!groupSelected}
          loading={memberLoading}
          placeholder={groupSelected ? "Select member" : "Select a group first"}
        />
        <DropdownField
          control={searchForm.control}
          name="loanKey"
          label="Loan"
          className="space-y-0"
          options={loanOptions}
          optionLabelKey="label"
          optionValueKey="value"
          isSearch
          isRequired
          disabled={!memberSelected}
          loading={loanLoading}
          placeholder={memberSelected ? "Select loan" : "Select a member first"}
        />
      </FilterCard>

      {saveResult && (
        <SaveResultBanner result={saveResult} onDismiss={onDismissResult} />
      )}

      {hasSearched && !entry && !searching && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {entryError || "No opening entry found for this loan."}
        </div>
      )}

      {entry && (
        <Form {...editForm}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 bg-primary/5 px-4 py-4 sm:px-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wallet size={18} />
              </div>
              <h3 className="text-lg font-semibold text-primary">Opening Balance</h3>
            </div>

            <div className="space-y-5 p-4 sm:p-5 lg:p-6">
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-4">
                <Fact
                  label="Group"
                  value={[entry.groupName, entry.groupNo ? `(${entry.groupNo})` : ""]
                    .filter(Boolean)
                    .join(" ")}
                />
                <Fact
                  label="Member"
                  value={[entry.memberName, entry.memberNo ? `(${entry.memberNo})` : ""]
                    .filter(Boolean)
                    .join(" ")}
                />
                <Fact
                  label="Loan"
                  value={
                    entry.accountNo
                      ? `A/c ${entry.accountNo}`
                      : entry.accountId
                        ? `A/c #${entry.accountId}`
                        : "—"
                  }
                />
                <Fact
                  label="Cycle"
                  value={entry.loanCycle ? `Cycle ${entry.loanCycle}` : "—"}
                />
              </div>

              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
                <RectifyField
                  label="Opening Date"
                  hint="Fixed. This date cannot be changed."
                >
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      readOnly
                      disabled
                      value={OPENING_ENTRY_DATE_LABEL}
                      aria-label="Opening date"
                      className={cn(fieldInputClass, "bg-gray-50 pl-9 text-gray-700")}
                    />
                  </div>
                </RectifyField>

                <RectifyField
                  label="Opening Balance"
                  required
                  error={openingError}
                  hint={
                    openingError
                      ? undefined
                      : `Lowest allowed is ${formatMoney(minOpening)}, so the current balance stays zero or above.`
                  }
                >
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    disabled={saving}
                    placeholder="0.00"
                    aria-label="Opening balance"
                    className={fieldInputClass}
                    value={openingText}
                    onChange={(event) => {
                      editForm.setValue(
                        "openingBalance",
                        sanitizeAmountInput(event.target.value),
                        { shouldDirty: true },
                      );
                      if (editForm.formState.errors.openingBalance) {
                        editForm.clearErrors("openingBalance");
                      }
                    }}
                  />
                </RectifyField>

                <RectifyField
                  label="Current Balance"
                  error={
                    currentIsNegative
                      ? "Current balance cannot be negative. Raise the opening balance."
                      : undefined
                  }
                  hint={
                    currentIsNegative
                      ? undefined
                      : "Updates with the opening balance. It cannot go below zero."
                  }
                >
                  <div className="relative">
                    <Scale
                      size={16}
                      className={cn(
                        "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                        currentIsNegative ? "text-red-500" : "text-gray-400",
                      )}
                    />
                    <Input
                      readOnly
                      value={currentLabel}
                      aria-label="Current balance"
                      className={cn(
                        fieldInputClass,
                        "bg-gray-50 pl-9 font-semibold",
                        currentIsNegative
                          ? "border-red-400 text-red-600"
                          : "text-gray-800",
                      )}
                    />
                  </div>
                </RectifyField>
              </div>

              {projectedSchedule && (
                <SchedulePanel
                  schedule={projectedSchedule}
                  changed={scheduleChanged}
                />
              )}

              <RectifyField
                label="Reason"
                required
                error={reasonError}
                hint={`${reasonText.length}/${REASON_MAX_LENGTH}`}
              >
                <Textarea
                  rows={3}
                  maxLength={REASON_MAX_LENGTH}
                  disabled={saving}
                  placeholder="Why is this opening balance being changed?"
                  className="min-h-[80px] resize-none border-[1.5px] text-[15px]"
                  {...editForm.register("reason")}
                />
              </RectifyField>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    editForm.reset({
                      openingBalance: entry.openingBalance.toFixed(2),
                      reason: "",
                    });
                    editForm.clearErrors();
                    onDismissResult();
                  }}
                  className="h-11 w-full rounded-lg border-gray-200 px-5 font-semibold text-gray-700 shadow-sm hover:bg-gray-50 sm:w-auto"
                >
                  Restore
                </Button>
                <Button
                  type="submit"
                  disabled={saving || currentIsNegative}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-8 font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95 sm:w-auto"
                >
                  {saving ? "Saving..." : "Update Opening Balance"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default OpeningEditTab;
