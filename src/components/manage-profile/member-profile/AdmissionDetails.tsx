/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/master.service";
import { useGlobalContext } from "@/context/GlobalContext";
import InputField from "@/common/formFields/InputField";
import { Label } from "@/components/ui/label";
import { Landmark, Edit3 } from "lucide-react";
import { IMemberFormInput } from "@/app/(dashboard)/manage-profile/member-profile/types";
import DropdownField from "@/common/formFields/DropdownField";
import { DatePicker } from "@/common/formFields/DatePicker";
import { extractList } from "@/container/manage-profile/member-profile/memberProfileHelpers";

interface Props {
  editMode: boolean;
}

export const AdmissionDetails = ({ editMode }: Props) => {
  const { user } = useGlobalContext();

  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<IMemberFormInput>();
  const txnMode = watch("txn_mode");

  const { data: coData } = useQuery({
    queryKey: ["coList", user?.org_id, user?.branch_id],
    queryFn: () =>
      masterService.getCoList(
        user?.org_id as number,
        user?.branch_id as number,
      ),
    enabled: !!user?.org_id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: statusOpt } = useQuery({
    queryKey: ["opt", 2],
    queryFn: () => masterService.getApplicationOption(2),
    enabled: editMode,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const coOptions = extractList(coData).map((opt: any) => ({
    label: `${opt.CO_Name || opt.Co_Name || ""} (${opt.CO_Code || opt.Co_Code || ""})`.trim(),
    value: opt.CO_Id ?? opt.Co_Id ?? opt.co_id,
  }));
  const statusOptions = extractList(statusOpt).map((opt: any) => ({
    label: opt.Option_Name || opt.Opt_Description || opt.Opt_Desc || "",
    value: opt.Id ?? opt.Opt_Code ?? opt.id,
  }));

  return (
    <>
      <div className="form-section">
        <div className="form-section-title">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Landmark size={14} className="text-primary" />
          </div>
          <h3 className="font-bold text-primary text-base">
            Admission Details
          </h3>
        </div>
        <div className="form-grid">
          <DropdownField
            control={control}
            name="co_id"
            label="Admitted By"
            options={coOptions}
            optionLabelKey="label"
            optionValueKey="value"
            isSearch={true}
            isRequired={true}
          />

          <DatePicker
            control={control}
            name="adm_date"
            label="Admitted On"
            placeholder="dd/mm/yyyy"
            dateFormat="dd/MM/yyyy"
            isRequired={true}
            showCurrentDate={true}
            disableFuture={true}
          />

          {!editMode && (
            <>
              <InputField
                control={control}
                name="adm_amt"
                type="number"
                label="Admission Fees"
                disabled={true}
              />
              <InputField
                control={control}
                name="share_amt"
                type="number"
                label="Share Amount"
                disabled={true}
              />

              <div className="space-y-2.5">
                <Label className="text-primary font-bold text-[13px] tracking-wide uppercase">
                  Transaction Mode
                </Label>
                <div className="flex items-center gap-6 mt-2 h-11">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="radio"
                      value="Cash"
                      {...register("txn_mode")}
                      className="w-4 h-4 text-primary"
                    />{" "}
                    Cash
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input
                      type="radio"
                      value="Bank"
                      {...register("txn_mode")}
                      className="w-4 h-4 text-primary"
                    />{" "}
                    Bank
                  </label>
                </div>
              </div>

              {txnMode === "Bank" && (
                <>
                  <DropdownField
                    control={control}
                    name="bank_id"
                    label="Select Bank Account"
                    options={[
                      { label: "SBI Account", value: 1 },
                      { label: "HDFC Account", value: 2 },
                    ]}
                    optionLabelKey="label"
                    optionValueKey="value"
                    isSearch={true}
                    isRequired={true}
                  />
                  <InputField
                    control={control}
                    name="bank_ref"
                    label="Bank References"
                    isRequired={true}
                    maxLength={30}
                    placeholder="Txn ID / Cheque No"
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {editMode && (
        <div className="form-section">
          <div className="form-section-title">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Edit3 size={14} className="text-primary" />
            </div>
            <h3 className="font-bold text-primary text-base">Update Status</h3>
          </div>
          <div className="form-grid">
            <DropdownField
              control={control}
              name="mem_status"
              label="Status"
              options={statusOptions}
              optionLabelKey="label"
              optionValueKey="value"
              isSearch={true}
            />
            <DatePicker
              control={control}
              name="with_date"
              label="Withdrawn Date"
              dateFormat="dd/MM/yyyy"
              disableFuture
            />
            <div className="space-y-2.5 xl:col-span-3">
              <Label className="text-primary font-bold text-[13px] tracking-wide uppercase">
                Remarks
              </Label>
              <textarea
                {...register("remarks")}
                className="flex w-full rounded-md border border-gray-100 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[60px] font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
