"use client";

import { useMemo, useState } from "react";
import { ListChecks, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { CollectionRectifyProps } from "@/container/rectify/collection-repayment/CollectionRectifyType";
import CollectionDeleteDialog from "./CollectionDeleteDialog";
import CollectionListPager from "./CollectionListPager";
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
  pagination,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onResetSearch,
  onEdit,
  deleteTarget,
  deleting,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
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

  const totalCollections = pagination?.total ?? collections.length;

  return (
    <div className="form-sections">
      <FilterCard
        form={searchForm}
        title="Find Collection"
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
        count={query ? filteredCollections.length : totalCollections}
        totalCount={totalCollections}
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
        <CollectionListTable
          collections={filteredCollections}
          loading={listLoading}
          startIndex={pagination?.from || 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        {pagination && (
          <CollectionListPager
            page={pagination.currentPage}
            pageSize={pageSize}
            total={pagination.total}
            loading={listLoading}
            onPageChange={(next) =>
              onPageChange(Math.min(Math.max(1, next), pagination.lastPage))
            }
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </ResultCard>

      <RectifyDialog
        groupOptions={groupOptions}
        groupLoading={groupLoading}
        {...dialogProps}
      />

      <CollectionDeleteDialog
        deleteTarget={deleteTarget}
        deleting={deleting}
        onCancelDelete={onCancelDelete}
        onConfirmDelete={onConfirmDelete}
      />
    </div>
  );
};

export default CollectionsTab;
