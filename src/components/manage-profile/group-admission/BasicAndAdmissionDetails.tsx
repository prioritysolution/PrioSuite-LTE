/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getAreaListAPI } from "@/container/setup/area-master/AreaMasterApi";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { masterService } from "@/services/master.service";
import { useGlobalContext } from "@/context/GlobalContext";
import InputField from "@/common/formFields/InputField";
import { Users } from "lucide-react";
import { IGroupFormInput } from "@/app/(dashboard)/manage-profile/group-admission/types";
import DropdownField from "@/common/formFields/DropdownField";
import TextareaField from "@/common/formFields/TextareaField";
import { DatePicker } from "@/common/formFields/DatePicker";

interface Props {
  isEditMode: boolean;
}

const COLLECTION_DAY_OPTIONS = [
  { label: "Sunday", value: "Sunday" },
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
];

const parsePayload = (res: any): any => {
  if (typeof res !== "string") return res;
  const trimmed = res.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return res;
  try {
    return JSON.parse(trimmed);
  } catch {
    return res;
  }
};

const extractList = (res: any): any[] => {
  const payload = parsePayload(res);
  const candidates = [
    payload?.Data,
    payload?.data?.Data,
    payload?.details,
    payload?.data?.details,
    payload?.data?.data,
    payload?.data,
    payload,
  ];
  const nonEmpty = candidates.find(
    (item) => Array.isArray(item) && item.length > 0,
  );
  if (nonEmpty) return nonEmpty;
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const toCoOption = (opt: any) => {
  const name = String(opt?.CO_Name ?? opt?.Co_Name ?? opt?.co_name ?? "").trim();
  const code = String(opt?.CO_Code ?? opt?.Co_Code ?? opt?.co_code ?? "").trim();
  const id = opt?.CO_Id ?? opt?.Co_Id ?? opt?.co_id;
  return {
    CO_Id: id,
    CO_Name: [name, code ? `(${code})` : ""].filter(Boolean).join(" "),
  };
};

export const BasicAndAdmissionDetails = (_props: Props) => {
  const { user } = useGlobalContext();
  const { control, setValue } = useFormContext<IGroupFormInput>();

  const selectedBranchId = useWatch({ control, name: "branch_id" });

  const { data: branchData, isLoading: branchLoading } = useQuery({
    queryKey: ["branchList", user?.org_id],
    queryFn: () => getBranchListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const { data: areaData, isLoading: areaLoading } = useQuery({
    queryKey: ["areaList", user?.org_id, selectedBranchId],
    queryFn: () =>
      getAreaListAPI(user?.org_id as number, Number(selectedBranchId)),
    enabled: !!user?.org_id && !!selectedBranchId,
  });

  const { data: typeData, isLoading: typeLoading } = useQuery({
    queryKey: ["groupTypeOption"],
    queryFn: () => masterService.getApplicationOption(1),
    enabled: !!user?.org_id,
  });

  const coBranchId = Number(selectedBranchId || user?.branch_id || 0);

  const { data: coData, isLoading: coLoading } = useQuery({
    queryKey: ["groupAdmissionCoList", user?.org_id, coBranchId],
    queryFn: () =>
      masterService.getCoList(user?.org_id as number, coBranchId),
    enabled: !!user?.org_id && coBranchId > 0,
    staleTime: 0,
  });

  const branchOptions = extractList(branchData);
  const areaOptions = extractList(areaData);
  const typeOptions = extractList(typeData).map((opt: any) => ({
    label: opt.Option_Name || opt.Opt_Description || opt.Opt_Desc || "",
    value: opt.Id ?? opt.Opt_Code ?? opt.id,
  }));
  const coOptions = useMemo(
    () =>
      extractList(coData)
        .map(toCoOption)
        .filter(
          (opt) =>
            opt.CO_Name !== "" &&
            opt.CO_Id !== undefined &&
            opt.CO_Id !== null &&
            opt.CO_Id !== "",
        ),
    [coData],
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3 rounded-t-xl">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Users size={18} />
        </div>
        <h3 className="font-semibold text-primary text-lg">
          Basic & Admission Details
        </h3>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 form-grid">
        <InputField
          control={control}
          name="grp_name"
          label="Group Name"
          isRequired={true}
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
            setValue("co_id", "");
          }}
        />

        <DropdownField
          control={control}
          name="area_vill"
          label="Area"
          options={areaOptions}
          optionLabelKey="Area_Name"
          optionValueKey="Area_Id"
          isSearch={true}
          isRequired={true}
          loading={areaLoading}
          placeholder={
            selectedBranchId ? "Select area" : "Select branch first"
          }
          disabled={!selectedBranchId}
        />

        <TextareaField
          control={control}
          name="grp_add"
          label="Group Address"
          isRequired={true}
          rows={2}
        />

        <InputField
          control={control}
          name="mem_no"
          label="No Of Member"
          isRequired={true}
          isNumeric={true}
          maxLength={2}
          placeholder="Enter no of members"
        />

        <DropdownField
          control={control}
          name="grp_type"
          label="Group Type"
          options={typeOptions}
          optionLabelKey="label"
          optionValueKey="value"
          isSearch={true}
          isRequired={true}
          loading={typeLoading}
          placeholder="Select group type"
        />

        <DropdownField
          control={control}
          name="collection_day"
          label="Group Collection Day"
          options={COLLECTION_DAY_OPTIONS}
          optionLabelKey="label"
          optionValueKey="value"
          isSearch={true}
          isRequired={true}
          disableSorting
          placeholder="Select collection day"
        />

        <DropdownField
          control={control}
          name="co_id"
          label="Admitted By"
          options={coOptions}
          optionLabelKey="CO_Name"
          optionValueKey="CO_Id"
          isSearch={true}
          isRequired={true}
          disableSorting
          loading={coLoading}
          disabled={!coBranchId}
          placeholder={
            !coBranchId
              ? "Select branch first"
              : coOptions.length
                ? "Select CO / Sahayika"
                : "No CO found"
          }
        />

        <DatePicker
          control={control}
          name="adm_date"
          label="Admission Date"
          placeholder="dd/mm/yyyy"
          dateFormat="dd/MM/yyyy"
          isRequired={true}
          showCurrentDate={true}
          disableFuture={true}
        />

        <InputField
          control={control}
          name="adm_amt"
          type="number"
          label="Admission Fees"
          isRequired={true}
          disabled={true}
        />
      </div>
    </div>
  );
};
