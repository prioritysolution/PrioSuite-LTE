"use client";

import { UseFormReturn } from "react-hook-form";
import { ClipboardList, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import DropdownField from "@/common/formFields/DropdownField";
import { DatePicker } from "@/common/formFields/DatePicker";
import {
  DemandGenerationForm,
  SelectOption,
} from "@/container/loan-entry/demand-generation/DemandGenerationType";

interface FilterFormProps {
  form: UseFormReturn<DemandGenerationForm>;
  coOptions: SelectOption[];
  coLoading: boolean;
  generating: boolean;
  onGenerate: (values: DemandGenerationForm) => void;
  onReset: () => void;
  onSelectionChange: () => void;
}

export function DemandGenerationFilterForm({
  form,
  coOptions,
  coLoading,
  generating,
  onGenerate,
  onReset,
  onSelectionChange,
}: FilterFormProps) {
  const demandDate = form.watch("demand_date");
  const canGenerate = !!demandDate && !generating;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onGenerate)}
        className="space-y-4"
      >
        <div className="form-grid items-start">
          <DatePicker
            control={form.control}
            name="demand_date"
            label="Demand Date"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/MM/yyyy"
            isRequired
            showCurrentDate
            onChange={() => onSelectionChange()}
          />

          <DropdownField
            control={form.control}
            name="co_id"
            label="Sahayika"
            className="space-y-0"
            options={coOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch
            loading={coLoading}
            placeholder="All Sahayika"
            hint="Demand is generated for every group of the selected Sahayika"
            onChange={() => onSelectionChange()}
            disableSorting
          />
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={generating}
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={!canGenerate}
            className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[150px]"
          >
            <ClipboardList className="h-4 w-4" />
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default DemandGenerationFilterForm;
