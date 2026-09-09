"use client";

import { useEffect, useMemo, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { format, isValid, parseISO } from "date-fns";
import { SearchIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import InputField from "@/common/formFields/InputField";
import { PersonalLedgerForm } from "@/container/loan-reports/personal-ledger/PersonalLedgerType";

const formatCycleDate = (raw: unknown) => {
  if (raw == null || raw === "") return "";
  const str = String(raw).trim();
  let date = parseISO(str.length >= 10 ? str.slice(0, 10) : str);
  if (!isValid(date)) date = new Date(str);
  if (!isValid(date)) return str;
  return format(date, "dd/MM/yy");
};

interface FilterFormProps {
  onFilter: (values: PersonalLedgerForm) => void;
  loading?: boolean;
  form: UseFormReturn<PersonalLedgerForm>;
  resetForm: () => void;
  groupListData: any[];
  memberListData: any[];
  loanCycleListData: any[];
  isMemberListLoading?: boolean;
  isLoanCycleListLoading?: boolean;
}

export function PersonalLedgerFilterForm({
  onFilter,
  loading,
  form,
  resetForm,
  groupListData = [],
  memberListData = [],
  loanCycleListData = [],
  isMemberListLoading = false,
  isLoanCycleListLoading = false,
}: FilterFormProps) {
  const selectedGroup = form.watch("groupId");
  const selectedMember = form.watch("memberId");
  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");

  const formattedLoanCycleList = useMemo(() => {
    return (loanCycleListData || []).map((item) => ({
      ...item,
      Cycle_Display: `${item.Loan_Cycle} - ${formatCycleDate(item.Loan_Date)}`,
    }));
  }, [loanCycleListData]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    form.setValue("memberId", "");
    form.setValue("loanCycleId", "");
  }, [selectedGroup, form]);

  const isMemberFirstRender = useRef(true);
  useEffect(() => {
    if (isMemberFirstRender.current) {
      isMemberFirstRender.current = false;
      return;
    }
    form.setValue("loanCycleId", "");
  }, [selectedMember, form]);

  const { isValid } = form.formState;

  const isSubmitDisabled =
    Boolean(fromDate && !toDate) ||
    Boolean(!fromDate && toDate) ||
    !selectedGroup ||
    !selectedMember ||
    !isValid ||
    loading;

  useEffect(() => {
    if (selectedMember && memberListData.length > 0) {
      const member = memberListData.find(
        (m) => String(m.Member_Id) === String(selectedMember),
      );
      if (member) {
        form.setValue(
          "loanDate",
          member.Loan_Date ? new Date(member.Loan_Date) : "",
        );
        form.setValue("loanAmount", member.Sanc_Amount || "");
        form.setValue("reliasableAmount", member.Realisable_Amt || "");
        form.setValue("installmentAmount", member.Installment_Amt || "");
      }
    } else {
      form.setValue("loanDate", "");
      form.setValue("loanAmount", "");
      form.setValue("reliasableAmount", "");
      form.setValue("installmentAmount", "");
    }
  }, [selectedMember, memberListData, form]);

  function onSubmit(values: PersonalLedgerForm) {
    onFilter(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="form-grid xl:grid-cols-5">
          <DatePicker
            control={form.control}
            name="fromDate"
            label="From Date"
            placeholder="Select date"
            isRequired={!!toDate}
          />

          <DatePicker
            control={form.control}
            name="toDate"
            label="To Date"
            placeholder="Select date"
            isRequired={!!fromDate}
          />

          <DropdownField
            control={form.control}
            name="groupId"
            label="Select Group"
            options={groupListData}
            optionLabelKey="Group_Name"
            optionValueKey="Group_Id"
            searchPlaceholder="Search group..."
          />

          <DropdownField
            control={form.control}
            name="memberId"
            label="Select Member"
            options={memberListData}
            optionLabelKey="Member_Name"
            optionValueKey="Member_Id"
            disabled={!selectedGroup}
            loading={isMemberListLoading}
            searchPlaceholder="Search member..."
          />

          <DropdownField
            control={form.control}
            name="loanCycleId"
            label="Select Loan Cycle"
            options={formattedLoanCycleList}
            optionLabelKey="Cycle_Display"
            optionValueKey="Loan_Cycle"
            disabled={!selectedMember}
            loading={isLoanCycleListLoading}
            searchPlaceholder="Search loan cycle..."
          />
        </div>

        <div className="form-grid xl:grid-cols-4">
          <DatePicker
            control={form.control}
            name="loanDate"
            label="Loan Date"
            placeholder="Select date"
            disabled={true}
          />

          <InputField
            control={form.control}
            name="loanAmount"
            label="Loan Amount"
            type="number"
            placeholder="0.00"
            disabled={true}
          />

          <InputField
            control={form.control}
            name="reliasableAmount"
            label="Realisable Amount"
            type="number"
            placeholder="0.00"
            disabled={true}
          />

          <InputField
            control={form.control}
            name="installmentAmount"
            label="Installment Amount"
            type="number"
            placeholder="0.00"
            disabled={true}
          />
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={loading}
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
            title="Reset filters"
          >
            <RotateCcwIcon size={16} />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="bg-primary hover:bg-primary/90 h-11 px-6 font-semibold rounded-lg text-white shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px]"
          >
            <SearchIcon size={16} className="shrink-0" />
            <span className="truncate">
              {loading ? "Searching..." : "Search"}
            </span>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default PersonalLedgerFilterForm;
