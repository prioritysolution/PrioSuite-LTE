"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useSelector } from "react-redux";
import { SearchIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { DetailedListForm } from "@/container/loan-reports/detailed-list/DetailedListType";
import { RootState } from "@/redux/store";

interface FilterFormProps {
  onFilter: (values: DetailedListForm) => void;
  loading?: boolean;
  form: UseFormReturn<DetailedListForm>;
  resetForm: () => void;
}

export function DetailedListFilterForm({
  onFilter,
  loading,
  form,
  resetForm,
}: FilterFormProps) {
  const branchList = useSelector(
    (state: RootState) => state.detailedList.branchList || [],
  );
  const schemeList = useSelector(
    (state: RootState) => state.detailedList.schemeList || [],
  );

  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const branch = form.watch("branch");
  const scheme = form.watch("scheme");

  const isSubmitDisabled =
    !fromDate || !toDate || !branch || !scheme || loading;

  function onSubmit(values: DetailedListForm) {
    onFilter(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-grid xl:grid-cols-4">
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
            isRequired
            sortValue="Branch_Id"
          />

          <DropdownField
            control={form.control}
            name="scheme"
            label="Scheme"
            options={schemeList}
            optionLabelKey="Scheme_Name"
            optionValueKey="Scheme_Id"
            isRequired
            searchPlaceholder="Search scheme..."
          />
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
            onClick={resetForm}
            disabled={loading}
          >
            <RotateCcwIcon className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px]"
          >
            <SearchIcon className="h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default DetailedListFilterForm;
