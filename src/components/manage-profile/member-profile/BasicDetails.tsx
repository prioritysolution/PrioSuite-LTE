/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/master.service";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { useGlobalContext } from "@/context/GlobalContext";
import InputField from "@/common/formFields/InputField";
import { UserPlus } from "lucide-react";
import { IMemberFormInput } from "@/app/(dashboard)/manage-profile/member-profile/types";
import DropdownField from "@/common/formFields/DropdownField";
import TextareaField from "@/common/formFields/TextareaField";
import { extractList } from "@/container/manage-profile/member-profile/memberProfileHelpers";

interface Props {
  editMode: boolean;
}

export const BasicDetails = (_props: Props) => {
  const { user } = useGlobalContext();
  const { control, setValue } = useFormContext<IMemberFormInput>();

  const watchedGroupId = useWatch({ control, name: "grp_id" });
  const selectedBranchId = useWatch({ control, name: "branch_id" });

  const { data: genderOpt } = useQuery({
    queryKey: ["opt", 4],
    queryFn: () => masterService.getApplicationOption(4),
  });
  const { data: religionOpt } = useQuery({
    queryKey: ["opt", 5],
    queryFn: () => masterService.getApplicationOption(5),
  });
  const { data: casteOpt } = useQuery({
    queryKey: ["opt", 6],
    queryFn: () => masterService.getApplicationOption(6),
  });
  const { data: maritalOpt } = useQuery({
    queryKey: ["opt", 7],
    queryFn: () => masterService.getApplicationOption(7),
  });

  const { data: branchData, isLoading: branchLoading } = useQuery({
    queryKey: ["branchList", user?.org_id],
    queryFn: () => getBranchListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const { data: areaData, isLoading: areaLoading } = useQuery({
    queryKey: ["areaList", user?.org_id, selectedBranchId],
    queryFn: () =>
      masterService.getAreaList(
        user?.org_id as number,
        Number(selectedBranchId),
      ),
    enabled: !!user?.org_id && !!selectedBranchId,
  });

  const { data: groupData } = useQuery({
    queryKey: ["groupList", user?.org_id, selectedBranchId],
    queryFn: () =>
      masterService.getGroupList(
        user?.org_id as number,
        Number(selectedBranchId),
      ),
    enabled: !!user?.org_id && !!selectedBranchId,
  });

  const genderOptions = extractList(genderOpt).map((opt: any) => ({
    label: opt.Option_Name || opt.Opt_Description || opt.Opt_Desc || "",
    value: opt.Id ?? opt.Opt_Code ?? opt.id,
  }));
  const religionOptions = extractList(religionOpt).map((opt: any) => ({
    label: opt.Option_Name || opt.Opt_Description || opt.Opt_Desc || "",
    value: opt.Id ?? opt.Opt_Code ?? opt.id,
  }));
  const casteOptions = extractList(casteOpt).map((opt: any) => ({
    label: opt.Option_Name || opt.Opt_Description || opt.Opt_Desc || "",
    value: opt.Id ?? opt.Opt_Code ?? opt.id,
  }));
  const maritalOptions = extractList(maritalOpt).map((opt: any) => ({
    label: opt.Option_Name || opt.Opt_Description || opt.Opt_Desc || "",
    value: opt.Id ?? opt.Opt_Code ?? opt.id,
  }));
  const branchOptions = extractList(branchData);
  const areaOptions = extractList(areaData);
  const groupOptions = extractList(groupData).map((opt: any) => {
    const groupId = opt.Group_Id || opt.Grp_Id || opt.grp_id;
    const groupName = opt.Group_Name || opt.Grp_Name || opt.grp_name;
    return {
      label: groupName,
      value: groupId,
    };
  });
  const selectedGroup = extractList(groupData).find(
    (g: any) => (g.Group_Id || g.Grp_Id || g.grp_id) == watchedGroupId,
  );

  return (
    <div className="form-section">
      <div className="form-section-title">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <UserPlus size={14} />
        </div>
        <h3 className="font-bold text-primary text-base">Basic Details</h3>
      </div>
      <div className="form-grid xl:grid-cols-4">
        <InputField
          control={control}
          name="member_name"
          label="Member Name"
          isRequired={true}
        />

        <InputField
          control={control}
          name="mem_fname"
          label="Guardian Name"
          isRequired={true}
        />

        <TextareaField
          control={control}
          name="mem_add"
          label="Address"
          isRequired={true}
          rows={4}
        />

        <InputField
          control={control}
          name="mem_mob"
          label="Mobile No"
          isRequired={true}
          maxLength={10}
          isNumeric={true}
        />

        <InputField
          control={control}
          name="mem_conct"
          label="Contact No"
          maxLength={10}
          isNumeric={true}
          placeholder="Enter 10 digit contact no"
        />

        <InputField
          control={control}
          name="mem_age"
          label="Age"
          isRequired={true}
          isNumeric={true}
          maxLength={3}
          placeholder="Enter age (18-100)"
        />

        <div className="space-y-2.5">
          <DropdownField
            control={control}
            name="mem_gender"
            label="Gender"
            options={genderOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch={true}
            isRequired={true}
          />
        </div>

        <div className="space-y-2.5">
          <DropdownField
            control={control}
            name="mem_caste"
            label="Caste"
            options={casteOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch={true}
          />
        </div>

        <div className="space-y-2.5">
          <DropdownField
            control={control}
            name="mem_relig"
            label="Religion"
            options={religionOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch={true}
          />
        </div>

        <div className="space-y-2.5">
          <DropdownField
            control={control}
            name="mar_sts"
            label="Marital Status"
            options={maritalOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch={true}
          />
        </div>

        <InputField
          control={control}
          name="mem_spose"
          label="Spouse Name"
          isLetters={true}
          maxLength={50}
          placeholder="Enter spouse name"
        />

        <InputField
          control={control}
          name="mem_sage"
          label="Spouse Age"
          isNumeric={true}
          maxLength={3}
          placeholder="Enter age (18-100)"
        />

        <InputField
          control={control}
          name="mem_quf"
          label="Qualification"
          maxLength={50}
          placeholder="Enter qualification"
        />

        <div className="space-y-2.5">
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
            rules={{
              required: "Select branch is required",
              validate: (value: string | number | "") =>
                value !== "" &&
                value !== null &&
                value !== undefined &&
                Number(value) !== 0
                  ? true
                  : "Select branch is required",
            }}
            onChange={() => {
              setValue("area_vill", "");
              setValue("grp_id", "");
            }}
          />
        </div>

        <div className="space-y-2.5">
          <DropdownField
            control={control}
            name="area_vill"
            label="Area Village"
            options={areaOptions}
            optionLabelKey="Area_Name"
            optionValueKey="Area_Id"
            isSearch={true}
            isRequired={true}
            loading={areaLoading}
            placeholder={
              selectedBranchId ? "Select area village" : "Select branch first"
            }
            disabled={!selectedBranchId}
          />
        </div>

        <div className="space-y-2.5">
          <DropdownField
            control={control}
            name="grp_id"
            label="Under Group"
            options={groupOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch={true}
            placeholder={
              selectedBranchId ? "Select under group" : "Select branch first"
            }
            disabled={!selectedBranchId}
          />
          {watchedGroupId && selectedGroup && (
            <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-[11px] space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex justify-between items-center">
                <span className="text-blue-900 font-bold uppercase">
                  Group Status:
                </span>
                <span
                  className={`font-black px-2 py-0.5 rounded ${selectedGroup.Status_Name === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {selectedGroup.Status_Name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600 font-medium">
                <span>Type: {selectedGroup.Type_Name || "N/A"}</span>
                <span>Area: {selectedGroup.Area_Name || "N/A"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
