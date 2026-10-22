"use client";

import { History, Loader2 } from "lucide-react";
import { DatePicker } from "@/common/formFields/DatePicker";
import { RectifyHistoryProps } from "@/container/rectify/collection-repayment/CollectionRectifyType";
import FilterCard, { ResultCard } from "./FilterCard";
import RectifyHistoryList from "./RectifyHistoryList";

const HistoryTab = ({
  form,
  rows,
  loading,
  onSearch,
  onReset,
}: RectifyHistoryProps) => (
  <div className="form-sections">
    <FilterCard
      form={form}
      title="Correction History"
      loading={loading}
      onSearch={onSearch}
      onReset={onReset}
    >
      <DatePicker
        control={form.control}
        name="fromDate"
        label="From Date"
        placeholder="Select date"
      />
      <DatePicker
        control={form.control}
        name="toDate"
        label="To Date"
        placeholder="Select date"
      />
    </FilterCard>

    <ResultCard
      title="Corrections"
      icon={<History size={18} />}
      count={rows.length}
      countLabel={["correction", "corrections"]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40 rounded-xl border border-gray-100 bg-slate-50/40">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-semibold">Loading corrections</span>
          </div>
        </div>
      ) : (
        <RectifyHistoryList
          history={rows}
          heading={(row) => (
            <p className="font-semibold text-primary">
              {row.voucherNo || "—"}
              {row.collId ? (
                <span className="ml-2 text-xs font-medium text-gray-400">
                  Coll #{row.collId}
                </span>
              ) : null}
            </p>
          )}
          emptyText="No corrections found for this date range."
        />
      )}
    </ResultCard>
  </div>
);

export default HistoryTab;
