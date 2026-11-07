"use client";

import { Lock, Scale, Wallet } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import DropdownField from "@/common/formFields/DropdownField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import {
  OPENING_ENTRY_DATE_LABEL,
  OpeningEditForm,
  OpeningEntry,
  OpeningSearchForm,
  REASON_MAX_LENGTH,
  SelectOption,
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

interface OpeningEntryPageProps {
  searchForm: UseFormReturn<OpeningSearchForm>;
  editForm: UseFormReturn<OpeningEditForm>;
  groupOptions: SelectOption[];
  memberOptions: SelectOption[];
  loanOptions: SelectOption[];
  groupLoading: boolean;
  memberLoading: boolean;
  loanLoading: boolean;
  groupSelected: boolean;
  memberSelected: boolean;
  searching: boolean;
  entry: OpeningEntry | null;
  entryError: string;
  hasSearched: boolean;
  openingText: string;
  reasonText: string;
  projectedCurrent: number | null;
  minOpening: number;
  currentIsNegative: boolean;
  saving: boolean;
  onSearch: () => void;
  onResetSearch: () => void;
  onSave: () => void;
}

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
    <p className="truncate text-sm font-semibold text-gray-800">{value || "—"}</p>
  </div>
);

const OpeningEntryPage = ({
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
  minOpening,
  currentIsNegative,
  saving,
  onSearch,
  onResetSearch,
  onSave,
}: OpeningEntryPageProps) => {
  const openingError = editForm.formState.errors.openingBalance?.message;
  const reasonError = editForm.formState.errors.reason?.message;
  const currentLabel =
    projectedCurrent === null ? "" : formatMoney(projectedCurrent);

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
        <div className="min-w-0 pl-2">
          <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
            Loan Opening Entry
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Correct the opening balance of one loan. The opening date stays{" "}
            {OPENING_ENTRY_DATE_LABEL}.
          </p>
        </div>
      </div>

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

export default OpeningEntryPage;
