"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SearchIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { CashAccountForm } from "@/container/financialReports/cashAccount/cashAccountType";

interface FilterFormProps {
  onFilter: (values: CashAccountForm) => void;
  loading?: boolean;
  form: UseFormReturn<CashAccountForm>;
  resetForm: () => void;
  branchList: any[];
}

export function CashAccountFilterForm({
  onFilter,
  loading,
  form,
  resetForm,
  branchList = [],
}: FilterFormProps) {
  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");

  const isSubmitDisabled = !fromDate || !toDate || loading;

  function onSubmit(values: CashAccountForm) {
    onFilter(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4 items-end"
      >
        <DatePicker
          control={form.control}
          name="fromDate"
          label="From Date"
          placeholder="Select date"
          isRequired
        />

        <DatePicker
          control={form.control}
          name="toDate"
          label="To Date"
          placeholder="Select date"
          isRequired
        />

        <DropdownField
          control={form.control}
          name="branch"
          label="Branch"
          options={branchList}
          optionLabelKey="Branch_Name"
          optionValueKey="Branch_Id"
          searchPlaceholder="Search branch..."
        />

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="bg-primary hover:bg-primary/90 h-11 px-5 font-semibold rounded-lg text-white shadow-sm transition-all flex items-center justify-center gap-2 flex-1 min-w-0"
          >
            <SearchIcon size={16} className="shrink-0" />
            <span className="truncate">
              {loading ? "Searching..." : "Search"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full sm:w-11 px-0 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm shrink-0"
            onClick={resetForm}
            disabled={loading}
            title="Reset filters"
          >
            <RotateCcwIcon size={16} className="text-slate-500" />
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CashAccountFilterForm;
