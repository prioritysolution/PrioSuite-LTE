"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { DisbursementTable } from "./DisbursementTable";
import { DisbursementDetailsScreen } from "./DisbursementDetailsScreen";
import { useLoanIssue } from "@/container/loan-entry/loan-issue/Hooks";
import { IDisbursement } from "@/container/loan-entry/loan-issue/LoanIssueType";
import { Button } from "@/components/ui/button";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { useGlobalContext } from "@/context/GlobalContext";
import DropdownField from "@/common/formFields/DropdownField";

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

type BranchFilterForm = {
  branch_id: string | number | "";
};

const LoanIssueComponent = () => {
  const { user } = useGlobalContext();
  const branchForm = useForm<BranchFilterForm>({
    defaultValues: { branch_id: "" },
  });
  const selectedBranchId = branchForm.watch("branch_id");
  const branchIdNum = Number(selectedBranchId) || 0;

  const { disbursementList, loading, refresh } = useLoanIssue(branchIdNum);
  const [selectedDisbursement, setSelectedDisbursement] =
    useState<IDisbursement | null>(null);

  const { data: branchData, isLoading: branchLoading } = useQuery({
    queryKey: ["branchList", user?.org_id],
    queryFn: () => getBranchListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const branchOptions = useMemo(() => extractList(branchData), [branchData]);

  useEffect(() => {
    if (branchIdNum) {
      refresh();
    }
  }, [branchIdNum, refresh]);

  if (selectedDisbursement) {
    return (
      <DisbursementDetailsScreen
        disbursement={selectedDisbursement}
        branchId={branchIdNum}
        onBack={() => {
          setSelectedDisbursement(null);
          if (branchIdNum) refresh();
        }}
      />
    );
  }

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
        <div className="pl-2 flex-shrink-0">
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            Loan Issue / Disbursement
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            View and process pending loan disbursements for groups
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            <span className="font-semibold text-gray-800">
              {disbursementList.length}{" "}
              {disbursementList.length === 1
                ? "pending application"
                : "pending applications"}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end gap-4 z-10 w-full xl:w-auto">
          <div className="w-full md:w-[260px]">
            <FormProvider {...branchForm}>
              <DropdownField
                control={branchForm.control}
                name="branch_id"
                label="Select Branch"
                options={branchOptions}
                optionLabelKey="Branch_Name"
                optionValueKey="Branch_Id"
                isSearch={true}
                isRequired={true}
                loading={branchLoading}
                placeholder="Select branch"
              />
            </FormProvider>
          </div>

          <Button
            type="button"
            onClick={() => {
              if (!branchIdNum) return;
              refresh();
            }}
            disabled={loading || !branchIdNum}
            className="h-12 px-8 text-[15px] font-bold tracking-wide w-full md:w-auto bg-primary hover:bg-[#024786] text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : undefined}
            />
            Refresh
          </Button>
        </div>
      </div>

      {!branchIdNum ? (
        <div className="rounded-xl border border-gray-100 bg-white px-5 py-12 text-center text-gray-500 font-medium shadow-sm">
          Select a branch to load pending disbursements.
        </div>
      ) : (
        <DisbursementTable
          disbursements={disbursementList}
          loading={loading}
          onViewDetails={setSelectedDisbursement}
        />
      )}
    </div>
  );
};

export default LoanIssueComponent;
