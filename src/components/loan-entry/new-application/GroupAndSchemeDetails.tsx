"use client";

import { useFormContext } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getSchemeAPI,
  getGroupDataAPI,
  getGroupMemberAPI,
} from "@/container/loan-entry/new-application/NewApplicationApi";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { useGlobalContext } from "@/context/GlobalContext";
import InputField from "@/common/formFields/InputField";
import { Users, Search, Loader2, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  IGroupLoanForm,
  IScheme,
} from "@/app/(dashboard)/loan-entry/new-application/types";
import { SearchGroupModal } from "./SearchGroupModal";
import DropdownField from "@/common/formFields/DropdownField";
import TextareaField from "@/common/formFields/TextareaField";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { DatePicker } from "@/common/formFields/DatePicker";

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

export const GroupAndSchemeDetails = () => {
  const { user } = useGlobalContext();
  const { control, setValue, getValues, trigger, clearErrors, watch } =
    useFormContext<IGroupLoanForm>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const coList = useSelector((state: RootState) => state.newApplication.coList);

  const coListDate = (coList || []).map((item: any) => ({
    ...item,
    CO_Name: `${item.CO_Name || ""}-${item.CO_Code || ""}`,
  }));

  const currentGroupId = watch("group_id");
  const selectedBranchId = watch("branch_id");

  const { data: branchData, isLoading: branchLoading } = useQuery({
    queryKey: ["branchList", user?.org_id],
    queryFn: () => getBranchListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const branchOptions = extractList(branchData);

  const clearGroupFields = () => {
    setValue("group_id", null);
    setValue("group_no", "");
    setValue("group_name", "");
    setValue("group_address", "");
    setValue("group_area", "");
    setValue("members", []);
    setValue("co_id", "");
  };

  const fetchMembersMutation = useMutation({
    mutationFn: () => {
      const groupId = getValues("group_id");
      if (!groupId) throw new Error("Please select a group first.");
      return getGroupMemberAPI(user?.org_id as number, String(groupId));
    },
    onSuccess: (response) => {
      const membersList = response?.Data || response?.data?.Data;
      if (!membersList || membersList.length === 0) {
        toast.error("No members found for this group.");
        return;
      }
      const mappedMembers = membersList.map((m: any) => ({
        mem_id: m.Member_Id,
        member_no: m.Member_No,
        member_name: m.Member_Name,
        gurdain_name: m.FatHusb_Name || m.Guardian_Name || "",
        area: m.Area_Name || "",
        loan_amount: "",
        purpose: "",
        guranter_name: "",
      }));
      setValue("members", mappedMembers);
      toast.success("Members loaded successfully.");
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to fetch members."),
  });

  const { data: schemeData } = useQuery({
    queryKey: ["schemeList", user?.org_id],
    queryFn: () => getSchemeAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const fetchGroupDataMutation = useMutation({
    mutationFn: (group_no: string) => {
      const branchId = Number(getValues("branch_id") || 0);
      if (!branchId) throw new Error("Please select a branch first.");
      return getGroupDataAPI(user?.org_id as number, group_no, branchId);
    },
    onSuccess: (response) => {
      const groupData =
        response?.data?.data?.data?.[0] ||
        response?.Data?.[0] ||
        response?.data?.Data?.[0];
      if (!groupData) {
        toast.error("No data found for this group.");
        return;
      }
      setValue("group_id", groupData.Group_Id || groupData.Grp_Id);
      setValue("group_no", String(groupData.Group_No || groupData.Grp_No), {
        shouldValidate: true,
      });
      clearErrors("group_no");
      trigger("group_no");
      setValue("group_name", groupData.Group_Name || groupData.Grp_Name || "");
      setValue("group_address", groupData.Grp_Address || "");
      setValue("group_area", groupData.Area || groupData.Area_Name || "");
      setValue("members", []);
      setIsSearchOpen(false);
    },
    onError: (error: any) =>
      toast.error(error?.message || "Failed to fetch group details."),
  });

  const schemes: IScheme[] =
    schemeData?.details || schemeData?.Data || schemeData?.data?.Data || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Users size={18} />
        </div>
        <h3 className="font-semibold text-primary text-lg">
          Group & Scheme Details
        </h3>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="form-grid xl:grid-cols-4">
          <DatePicker
            control={control}
            name="loan_date"
            label="Loan Date"
            isRequired={true}
            restrictToFinancialYear
          />

          <DropdownField
            control={control}
            name="branch_id"
            label="Select Branch"
            options={branchOptions}
            optionLabelKey="Branch_Name"
            optionValueKey="Branch_Id"
            isSearch={true}
            isRequired={true}
            loading={branchLoading}
            placeholder="Select branch"
            onChange={() => clearGroupFields()}
          />

          <InputField
            control={control}
            name="group_no"
            label="Group No"
            isRequired={true}
            placeholder={
              selectedBranchId
                ? "Enter Group No or Search"
                : "Select branch first"
            }
            disabled={!selectedBranchId}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value;
                if (val) fetchGroupDataMutation.mutate(val);
              }
            }}
            endContent={
              <button
                type="button"
                onClick={() => {
                  if (!selectedBranchId) {
                    toast.error("Please select a branch first.");
                    return;
                  }
                  setIsSearchOpen(true);
                }}
                disabled={!selectedBranchId}
                className="h-9 w-9 flex items-center justify-center text-gray-500 hover:text-primary transition-colors bg-gray-100 border-l border-gray-200 rounded-r-md -mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetchGroupDataMutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Search size={18} />
                )}
              </button>
            }
          />

          <InputField
            control={control}
            name="group_name"
            label="Group Name"
            readOnly={true}
            tabIndex={-1}
          />

          <InputField
            control={control}
            name="group_area"
            label="Group Area"
            readOnly={true}
            tabIndex={-1}
          />

          <div className="md:col-span-2 xl:col-span-2">
            <TextareaField
              control={control}
              name="group_address"
              label="Group Address"
              readOnly={true}
            />
          </div>

          <DropdownField
            control={control}
            name="scheme_id"
            label="Select Scheme"
            options={schemes}
            optionLabelKey="Scheme_Name"
            optionValueKey="Scheme_Id"
            isSearch={true}
            isRequired={true}
            onChange={(val) => {
              const selectedId = Number(val);
              const selectedScheme = schemes.find(
                (s) => s.Scheme_Id === selectedId,
              );
              if (selectedScheme) {
                setValue("roi", Number(selectedScheme.RoI));
                setValue("repay_mode", selectedScheme.Repay_Mode);
                setValue("repay_name", selectedScheme.Repay_Name);
                setValue(
                  "sanction_limit",
                  Number(selectedScheme.Sanction_Limit),
                );
              } else {
                setValue("roi", 0);
                setValue("repay_mode", 0);
                setValue("repay_name", "");
                setValue("sanction_limit", 0);
              }
            }}
          />

          <DropdownField
            control={control}
            name="co_id"
            label="Select CO"
            options={coListDate}
            optionLabelKey="CO_Name"
            optionValueKey="CO_Id"
            isSearch={true}
            isRequired={true}
            placeholder={
              selectedBranchId ? "Select select co" : "Select branch first"
            }
            disabled={!selectedBranchId}
          />

          <InputField
            control={control}
            name="roi"
            type="number"
            label="ROI"
            readOnly={true}
            tabIndex={-1}
          />

          <InputField
            control={control}
            name="repay_name"
            label="Repay Mode"
            readOnly={true}
            tabIndex={-1}
          />
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <Button
            type="button"
            onClick={() => fetchMembersMutation.mutate()}
            disabled={fetchMembersMutation.isPending || !currentGroupId}
            className="bg-primary hover:bg-[#024786] text-white font-bold h-12 px-8 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            {fetchMembersMutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            Get Member
          </Button>
        </div>
      </div>

      <SearchGroupModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(group_no) => fetchGroupDataMutation.mutate(group_no)}
        initialKeyword={getValues("group_no")}
        branchId={Number(selectedBranchId) || 0}
      />
    </div>
  );
};
