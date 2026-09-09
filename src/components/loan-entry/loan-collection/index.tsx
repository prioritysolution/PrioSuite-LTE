"use client";

import React, { useMemo } from "react";
import {
  Banknote,
  ClipboardList,
  Loader2,
  RefreshCw,
  Save,
  Wallet,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import InputField from "@/common/formFields/InputField";
import RadioField from "@/common/formFields/RadioFields";
import SuccessMessage from "@/common/SuccessMessage";
import { LoanCollectionProps } from "@/container/loan-entry/loan-collection/LoanCollectionType";
import MemberDetailsSection from "./MemberDetailsSection";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { useGlobalContext } from "@/context/GlobalContext";

const transModeOptions = [
  { value: "1", label: "Cash" },
  { value: "2", label: "Bank" },
];

const bankAccountOptions = [{ label: "Main Bank Account", value: 1 }];

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
  memberList,
  isGroupLoading,
  isMemberLoading,
  isLoanInfoLoading,
  isSplitLoading,
  loading,
  onToggleCollection,
  showSuccessMessage = false,
  successMessage = "",
  onSuccessClose,
}: LoanCollectionProps) => {
  const { user } = useGlobalContext();
  const {
    formState: { isValid },
  } = form;

  const selectedBranchId = form.watch("branchId");
  const selectedGroup = form.watch("groupId");
  const selectedMemberId = form.watch("memberId");
  const transMode = form.watch("transMode");
  const isBankMode = transMode === "2";

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
                  form.setValue("memberId", "");
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

          {/* Member Details — group-wise list with Collection checkbox */}
          <MemberDetailsSection
            members={memberList}
            selectedMemberId={selectedMemberId}
            isLoading={isMemberLoading}
            hasGroup={!!selectedGroup}
            onToggleCollection={onToggleCollection}
          />

          {/* Loan info (read-only labels) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet size={18} />
                </div>
                <h3 className="font-semibold text-primary text-lg">
                  Loan Information
                </h3>
              </div>
              {isLoanInfoLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>

            <div className="p-4 sm:p-5 lg:p-6 form-grid">
              <InputField
                control={form.control}
                name="loanDate"
                label="Loan Date"
                placeholder="—"
                disabled
              />

              <InputField
                control={form.control}
                name="loanAmount"
                label="Loan Amount"
                placeholder="—"
                disabled
              />

              <InputField
                control={form.control}
                name="installmentAmount"
                label="Installment Amount"
                placeholder="—"
                disabled
              />

              <InputField
                control={form.control}
                name="currentBalance"
                label="Current Balance"
                placeholder="—"
                disabled
              />

              <InputField
                control={form.control}
                name="demand"
                label="Demand"
                placeholder="—"
                disabled
              />
            </div>
          </div>

          {/* Payment entry */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Banknote size={18} />
              </div>
              <h3 className="font-semibold text-primary text-lg">
                Payment Entry
              </h3>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 form-grid">
              <InputField
                control={form.control}
                name="amount"
                label="Amount"
                type="text"
                placeholder="0.00"
                isNumeric
                isRequired
              />

              <div className="relative">
                <InputField
                  control={form.control}
                  name="principalAmount"
                  label="Principal Amount"
                  type="text"
                  placeholder="0"
                  disabled
                />
                {isSplitLoading && (
                  <div className="absolute inset-0 top-6 flex items-center justify-center rounded-md bg-white/70">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="relative">
                <InputField
                  control={form.control}
                  name="interestAmount"
                  label="Interest Amount"
                  type="text"
                  placeholder="0"
                  disabled
                />
                {isSplitLoading && (
                  <div className="absolute inset-0 top-6 flex items-center justify-center rounded-md bg-white/70">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculating...
                    </span>
                  </div>
                )}
              </div>

              <InputField
                control={form.control}
                name="penalAmount"
                label="Penal Amount"
                type="text"
                placeholder="0"
                disabled
              />

              <InputField
                control={form.control}
                name="refVoucherNo"
                label="Ref Voucher No"
                placeholder="Enter ref voucher no"
              />

              <RadioField
                control={form.control}
                name="transMode"
                label="Trans Mode"
                options={transModeOptions}
                orientation="horizontal"
                isRequired
              />

              {isBankMode && (
                <>
                  <DropdownField
                    control={form.control}
                    name="bankId"
                    label="Select Bank Account"
                    options={bankAccountOptions}
                    optionLabelKey="label"
                    optionValueKey="value"
                    searchPlaceholder="Select bank account..."
                    isRequired
                  />

                  <InputField
                    control={form.control}
                    name="bankRef"
                    label="Bank References"
                    placeholder="Txn ID / Cheque No"
                  />
                </>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={loading}
              className="h-12 px-8 font-bold text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw size={18} />
              Reset
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid}
              className="bg-primary hover:bg-primary/90 h-12 px-10 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Save Collection
            </Button>
          </div>
        </form>
      </Form>

      <SuccessMessage
        showSuccessMessage={showSuccessMessage}
        setShowSuccessMessage={(val) => {
          const open =
            typeof val === "function" ? val(showSuccessMessage) : val;
          onSuccessClose?.(open);
        }}
        successMessage={successMessage}
        showNextButton={false}
        closeLabel="OK"
      />
    </div>
  );
};

export default LoanCollectionComponent;
