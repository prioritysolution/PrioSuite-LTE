"use client";

import { useMemo, useState } from "react";
import { Landmark, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { LoanRectifyProps } from "@/container/rectify/loan-issue/LoanRectifyType";
import FilterCard, { ResultCard } from "../collection-repayment/FilterCard";
import RectifyField, { fieldInputClass } from "../collection-repayment/RectifyField";
import LoanListPager from "./LoanListPager";
import LoanListTable from "./LoanListTable";
import LoanRectifyDialog from "./LoanRectifyDialog";

const LoansTab = ({
  searchForm,
  groupOptions,
  groupLoading,
  loans,
  listLoading,
  pagination,
  onPageChange,
  onSearch,
  onResetSearch,
  onEdit,
  ...dialogProps
}: LoanRectifyProps) => {
  const [memberSearch, setMemberSearch] = useState("");
  const query = memberSearch.trim().toLowerCase();

  const filteredLoans = useMemo(() => {
    if (!query) return loans;
    return loans.filter((row) =>
      [row.memberName, row.memberNo, row.guardianName, row.accountLabel].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
      ),
    );
  }, [loans, query]);

  const totalLoans = pagination?.total ?? loans.length;

  return (
    <div className="form-sections">
      <FilterCard
        form={searchForm}
        title="Find Issued Loan"
        loading={listLoading}
        onSearch={onSearch}
        onReset={() => {
          setMemberSearch("");
          onResetSearch();
        }}
      >
        <DatePicker
          control={searchForm.control}
          name="fromDate"
          label="From Loan Date"
          placeholder="Select date"
        />
        <DatePicker
          control={searchForm.control}
          name="toDate"
          label="To Loan Date"
          placeholder="Select date"
        />
        <DropdownField
          control={searchForm.control}
          name="group_id"
          label="Group"
          className="space-y-0"
          options={groupOptions}
          optionLabelKey="label"
          optionValueKey="value"
          isSearch
          loading={groupLoading}
          placeholder="All Groups"
        />
        <RectifyField label="Search" hint="Account no., member no., member name or voucher no.">
          <Input
            placeholder="e.g. SAKILA or 10200001"
            className={fieldInputClass}
            {...searchForm.register("search")}
          />
        </RectifyField>
      </FilterCard>

      <ResultCard
        title="Issued Loans"
        icon={<Landmark size={18} />}
        count={query ? filteredLoans.length : totalLoans}
        totalCount={totalLoans}
        countLabel={["loan", "loans"]}
        headerExtra={
          loans.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Search member name / no / A/c..."
                aria-label="Search members"
                autoComplete="off"
                className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => setMemberSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )
        }
      >
        <LoanListTable
          loans={filteredLoans}
          loading={listLoading}
          startIndex={pagination?.from || 1}
          onEdit={onEdit}
        />
        {pagination && (
          <LoanListPager
            pagination={pagination}
            loading={listLoading}
            onPageChange={onPageChange}
          />
        )}
      </ResultCard>

      <LoanRectifyDialog {...dialogProps} />
    </div>
  );
};

export default LoansTab;
