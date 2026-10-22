"use client";

import { History, Loader2 } from "lucide-react";
import { DatePicker } from "@/common/formFields/DatePicker";
import { LoanRectifyHistoryProps } from "@/container/rectify/loan-issue/LoanRectifyType";
import FilterCard, { ResultCard } from "../collection-repayment/FilterCard";
import RectifyHistoryList from "../collection-repayment/RectifyHistoryList";

const LoanHistoryTab = ({
  form,
  rows,
  loading,
  onSearch,
  onReset,
}: LoanRectifyHistoryProps) => (
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
              {row.memberName || "—"}
              <span className="ml-2 text-xs font-medium text-gray-400">
                {[row.accountLabel && `Acct ${row.accountLabel}`, row.voucherNo]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </p>
          )}
          emptyText="No corrections found for this date range."
        />
      )}
    </ResultCard>
  </div>
);

export default LoanHistoryTab;
