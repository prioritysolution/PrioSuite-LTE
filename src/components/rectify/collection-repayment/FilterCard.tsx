"use client";

import { ReactNode } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

interface FilterCardProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  title: string;
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
  children: ReactNode;
}

const FilterCard = <T extends FieldValues>({
  form,
  title,
  loading,
  onSearch,
  onReset,
  children,
}: FilterCardProps<T>) => (
  <Form {...form}>
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSearch();
      }}
      className="bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <div className="bg-primary/5 px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3 rounded-t-xl">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Search size={18} />
        </div>
        <h3 className="font-semibold text-primary text-lg">{title}</h3>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 grid grid-cols-1 items-start gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
        {children}
      </div>

      <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={loading}
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Search className="h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
    </form>
  </Form>
);

export const ResultCard = ({
  title,
  icon,
  count,
  totalCount,
  countLabel,
  headerExtra,
  children,
}: {
  title: string;
  icon: ReactNode;
  count: number;
  totalCount?: number;
  countLabel: [string, string];
  headerExtra?: ReactNode;
  children: ReactNode;
}) => {
  const labelCount = totalCount ?? count;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
          <h3 className="font-semibold text-primary text-lg">{title}</h3>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {headerExtra}
          <span className="text-sm font-semibold text-gray-700 shrink-0 whitespace-nowrap">
            {totalCount !== undefined && totalCount !== count && `${count} of `}
            {labelCount} {labelCount === 1 ? countLabel[0] : countLabel[1]}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5 lg:p-6">{children}</div>
    </div>
  );
};

export default FilterCard;
