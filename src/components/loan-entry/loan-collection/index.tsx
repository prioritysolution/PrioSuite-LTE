"use client";

import React, { useMemo } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { LoanCollectionProps } from "@/container/loan-entry/loan-collection/LoanCollectionType";
import MemberDetailsSection from "./MemberDetailsSection";
import PaymentEntrySection from "./PaymentEntrySection";
import CollectionReceiptDialog from "./CollectionReceiptDialog";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { useGlobalContext } from "@/context/GlobalContext";

const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const LoanCollectionComponent = ({
  form,
  onSubmit,
  resetForm,
  groupList,
  loanRows,
  isGroupLoading,
  isLoanListLoading,
  loading,
  entries,
  rowErrors,
  totals,
  canSave,
  isSplitting,
  onToggleLoan,
  onToggleAll,
  onEntryChange,
  onRemoveEntry,
  onClearEntries,
  collectionResult,
  onReceiptClose,
}: LoanCollectionProps) => {
  const { user } = useGlobalContext();
  const {
    formState: { isValid },
  } = form;

  const selectedBranchId = form.watch("branchId");
  const selectedGroup = form.watch("groupId");

  const { data: branchData, isLoading: branchLoading } = useQuery({
    queryKey: ["branchList", user?.org_id],
    queryFn: () => getBranchListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const branchOptions = useMemo(() => extractList(branchData), [branchData]);

  const normalizedGroups = useMemo(() => {
    return (groupList || []).map((item) => {
      const id = item.Group_Id ?? item.Grp_Id ?? item.grp_id;
      const no = item.Group_No || item.Grp_No || item.grp_no || "";
      const name = item.Group_Name || item.Grp_Name || item.grp_name || "";
      return {
        ...item,
        Group_Id: id,
        Group_Name: [no, name].filter(Boolean).join(" - ") || String(id ?? ""),
      };
    });
  }, [groupList]);

  const selectedAccountIds = useMemo(
    () => new Set(entries.map((entry) => entry.accountId)),
    [entries],
  );

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
        <div className="pl-2 flex-shrink-0">
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            Loan Collection
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Record loan collection against group members
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 z-10 w-full xl:w-auto">
          <Button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="h-12 px-8 text-[15px] font-bold tracking-wide w-full md:w-auto bg-primary hover:bg-[#024786] text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Reset
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="form-sections">
          {/* Collection Details — Date + Branch + Group */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ClipboardList size={18} />
              </div>
              <h3 className="font-semibold text-primary text-lg">
                Collection Details
              </h3>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 form-grid">
              <DatePicker
                control={form.control}
                name="collectionDate"
                label="Collection Date"
                placeholder="Select date"
                isRequired
                restrictToFinancialYear
              />

              <DropdownField
                control={form.control}
                name="branchId"
                label="Select Branch"
                options={branchOptions}
                optionLabelKey="Branch_Name"
                optionValueKey="Branch_Id"
                searchPlaceholder="Search branch..."
                loading={branchLoading}
                isRequired
                placeholder="Select branch"
                onChange={() => {
                  form.setValue("groupId", "");
                }}
              />

              <DropdownField
                control={form.control}
                name="groupId"
                label="Select Group"
                options={normalizedGroups}
                optionLabelKey="Group_Name"
                optionValueKey="Group_Id"
                searchPlaceholder="Search group..."
                loading={isGroupLoading}
                isRequired
                placeholder={
                  selectedBranchId ? "Search group..." : "Select branch first"
                }
                disabled={!selectedBranchId}
              />
            </div>
          </div>

          <MemberDetailsSection
            rows={loanRows}
            selectedAccountIds={selectedAccountIds}
            isLoading={isLoanListLoading}
            hasGroup={!!selectedGroup}
            disabled={loading}
            onToggleLoan={onToggleLoan}
            onToggleAll={onToggleAll}
          />

          <PaymentEntrySection
            control={form.control}
            entries={entries}
            rowErrors={rowErrors}
            totals={totals}
            saving={loading}
            isSplitting={isSplitting}
            saveDisabled={!canSave || !isValid}
            onEntryChange={onEntryChange}
            onRemoveEntry={onRemoveEntry}
            onClear={onClearEntries}
          />
        </form>
      </Form>

      <CollectionReceiptDialog
        result={collectionResult}
        onClose={onReceiptClose}
      />
    </div>
  );
};

export default LoanCollectionComponent;
