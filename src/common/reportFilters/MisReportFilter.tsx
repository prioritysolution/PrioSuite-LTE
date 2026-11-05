"use client";

import type { ReactNode } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";

export interface MisReportBranchOption {
  label: string;
  value: number;
}

export const MIS_REPORT_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "month", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "quarter", label: "This Quarter" },
  { id: "fy", label: "This Financial Year" },
];

interface MisReportFilterProps<T extends FieldValues> {
  control: Control<T>;
  isHead: boolean;
  branchName: string;
  branchOptions: MisReportBranchOption[];
  branchLoading: boolean;
  loading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  fromName: Path<T>;
  toName: Path<T>;
  branchNameField: Path<T>;
  onBranchChange?: (value: unknown) => void;
  children?: ReactNode;
  presets?: { id: DatePreset; label: string }[];
  activePreset?: DatePreset | null;
  onPreset?: (preset: DatePreset) => void;
}

const MisReportFilter = <T extends FieldValues>({
  control,
  isHead,
  branchName,
  branchOptions,
  branchLoading,
  loading,
  onSubmit,
  fromName,
  toName,
  branchNameField,
  onBranchChange,
  children,
  presets,
  activePreset,
  onPreset,
}: MisReportFilterProps<T>) => (
  <form onSubmit={onSubmit} className="page-body-card">
    <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
      <DatePicker control={control} name={fromName} label="From" dateFormat="dd-MM-yyyy" />
      <DatePicker control={control} name={toName} label="To" dateFormat="dd-MM-yyyy" />
      {isHead ? (
        <DropdownField
          control={control}
          name={branchNameField}
          label="Branch"
          options={branchOptions}
          optionLabelKey="label"
          optionValueKey="value"
          disableSorting
          loading={branchLoading}
          searchPlaceholder="Select branch..."
          onChange={onBranchChange}
        />
      ) : (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Branch</p>
          <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-800">
            {branchName}
          </div>
        </div>
      )}
      {children}
      <Button type="submit" disabled={loading} className="h-10 w-full bg-primary font-semibold text-white hover:bg-primary/90">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Show"}
      </Button>
    </div>
    {presets?.length && onPreset ? (
      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant={activePreset === preset.id ? "default" : "outline"}
            aria-pressed={activePreset === preset.id}
            disabled={loading}
            onClick={() => onPreset(preset.id)}
            className={activePreset === preset.id ? "bg-primary text-white hover:bg-primary/90" : undefined}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    ) : null}
  </form>
);

export default MisReportFilter;
