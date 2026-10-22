"use client";

import { useMemo, useState } from "react";
import { ListChecks, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { CollectionRectifyProps } from "@/container/rectify/collection-repayment/CollectionRectifyType";
import CollectionListPager, { PAGE_SIZE_OPTIONS } from "./CollectionListPager";
import CollectionListTable from "./CollectionListTable";
import FilterCard, { ResultCard } from "./FilterCard";
import RectifyDialog from "./RectifyDialog";
import RectifyField, { fieldInputClass } from "./RectifyField";

const CollectionsTab = ({
  searchForm,
  groupOptions,
  groupLoading,
  collections,
  listLoading,
  onSearch,
  onResetSearch,
  onEdit,
  ...dialogProps
}: CollectionRectifyProps) => {
  const [memberSearch, setMemberSearch] = useState("");
  const query = memberSearch.trim().toLowerCase();

  const filteredCollections = useMemo(() => {
    if (!query) return collections;
    return collections.filter((row) =>
      [row.memberName, row.memberNo, row.guardianName, row.accountLabel].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
      ),
    );
  }, [collections, query]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const lastPage = Math.max(1, Math.ceil(filteredCollections.length / pageSize));
  const currentPage = Math.min(page, lastPage);
  const startIndex = (currentPage - 1) * pageSize;

  const pagedCollections = useMemo(
    () => filteredCollections.slice(startIndex, startIndex + pageSize),
    [filteredCollections, startIndex, pageSize],
  );

  return (
    <div className="form-sections">
      <FilterCard
        form={searchForm}
        title="Find Collection"
        loading={listLoading}
        onSearch={() => {
          setPage(1);
          return onSearch();
        }}
        onReset={() => {
          setMemberSearch("");
          setPage(1);
          onResetSearch();
        }}
      >
        <DatePicker
          control={searchForm.control}
          name="fromDate"
          label="From Date"
          placeholder="Select date"
        />
        <DatePicker
          control={searchForm.control}
          name="toDate"
          label="To Date"
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
        <RectifyField label="Voucher No">
          <Input
            placeholder="e.g. REC26-27/10"
            className={fieldInputClass}
            {...searchForm.register("voucher_no")}
          />
        </RectifyField>
      </FilterCard>

      <ResultCard
        title="Collections"
        icon={<ListChecks size={18} />}
        count={filteredCollections.length}
        totalCount={collections.length}
        countLabel={["collection", "collections"]}
        headerExtra={
          collections.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={memberSearch}
                onChange={(event) => {
                  setMemberSearch(event.target.value);
                  setPage(1);
                }}
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
                  onClick={() => {
                    setMemberSearch("");
                    setPage(1);
                  }}
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
        <CollectionListTable
          collections={pagedCollections}
          loading={listLoading}
          startIndex={startIndex + 1}
          onEdit={onEdit}
        />
        {!listLoading && (
          <CollectionListPager
            page={currentPage}
            pageSize={pageSize}
            total={filteredCollections.length}
            loading={listLoading}
            onPageChange={(next) => setPage(Math.min(Math.max(1, next), lastPage))}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </ResultCard>

      <RectifyDialog
        groupOptions={groupOptions}
        groupLoading={groupLoading}
        {...dialogProps}
      />
    </div>
  );
};

export default CollectionsTab;
