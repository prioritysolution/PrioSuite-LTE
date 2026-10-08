"use client";

import { UseFormReturn } from "react-hook-form";
import { ClipboardList, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import DropdownField from "@/common/formFields/DropdownField";
import {
  DemandGenerationForm,
  SelectOption,
} from "@/container/loan-entry/demand-generation/DemandGenerationType";

interface FilterFormProps {
  form: UseFormReturn<DemandGenerationForm>;
  coOptions: SelectOption[];
  groupOptions: SelectOption[];
  coLoading: boolean;
  groupLoading: boolean;
  generating: boolean;
  onGenerate: (values: DemandGenerationForm) => void;
  onReset: () => void;
  onSelectionChange: () => void;
}

export function DemandGenerationFilterForm({
  form,
  coOptions,
  groupOptions,
  coLoading,
  groupLoading,
  generating,
  onGenerate,
  onReset,
  onSelectionChange,
}: FilterFormProps) {
  const selectedCoId = form.watch("co_id");
  const selectedGroupId = form.watch("group_id");
  const canGenerate = !!selectedCoId && !!selectedGroupId && !generating;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onGenerate)}
        className="space-y-4"
      >
        <div className="form-grid xl:grid-cols-2">
          <DropdownField
            control={form.control}
            name="co_id"
            label="Sahayika"
            options={coOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch
            isRequired
            loading={coLoading}
            placeholder="Select Sahayika"
            onChange={() => {
              form.setValue("group_id", "");
              onSelectionChange();
            }}
          />

          <DropdownField
            control={form.control}
            name="group_id"
            label="Group"
            options={groupOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch
            isRequired
            loading={!!selectedCoId && groupLoading}
            disabled={!selectedCoId}
            placeholder={
              selectedCoId
                ? groupOptions.length
                  ? "Select group"
                  : "No groups for this Sahayika"
                : "Select Sahayika first"
            }
            onChange={() => onSelectionChange()}
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
