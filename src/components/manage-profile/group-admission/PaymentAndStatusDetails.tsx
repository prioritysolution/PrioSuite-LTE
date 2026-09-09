/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/master.service";
import { useGlobalContext } from "@/context/GlobalContext";
import InputField from "@/common/formFields/InputField";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { IGroupFormInput } from "@/app/(dashboard)/manage-profile/group-admission/types";
import { useEffect } from "react";
import DropdownField from "@/common/formFields/DropdownField";
import { DatePicker } from "@/common/formFields/DatePicker";

interface Props {
  isEditMode: boolean;
}

export const PaymentAndStatusDetails = ({ isEditMode }: Props) => {
  const { user } = useGlobalContext();
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<IGroupFormInput>();
  const txnMode = useWatch({ control, name: "txn_mode" });
  const grpSts = useWatch({ control, name: "grp_sts" });

  const { data: statusData } = useQuery({
    queryKey: ["groupStatusOption"],
    queryFn: () => masterService.getApplicationOption(2),
    enabled: isEditMode && !!user?.org_id,
  });

  const statusOptions = statusData?.Data || statusData?.details || [];

  useEffect(() => {
    if (!isEditMode && txnMode === "Cash") {
      setValue("bank_id", "");
      setValue("bank_ref", "");
    }
  }, [txnMode, isEditMode, setValue]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <FileText size={18} />
        </div>
        <h3 className="font-semibold text-primary text-lg">
          {isEditMode ? "Status Information" : "Transaction Details"}
        </h3>
      </div>

      <div className="p-4 sm:p-5 lg:p-6 form-grid">
        {!isEditMode && (
          <>
            <div className="space-y-2.5">
              <Label className="text-primary font-bold text-[13px] uppercase tracking-wide">
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
                  options={[{ label: "Main Bank Account", value: 1 }]}
                  optionLabelKey="label"
                  optionValueKey="value"
                  isSearch={true}
                  isRequired={true}
                />
                <InputField
                  control={control}
                  name="bank_ref"
                  label="Bank References"
                  placeholder="Txn ID / Cheque No"
                  isRequired={true}
                  maxLength={30}
                />
              </>
            )}
          </>
        )}

        {isEditMode && (
          <>
            <DropdownField
              control={control}
              name="grp_sts"
              label="Group Status"
              options={statusOptions}
              optionLabelKey="Option_Name"
              optionValueKey="Id"
              isSearch={true}
            />

            {Number(grpSts) === 3 && (
              <DatePicker
                control={control}
                name="with_date"
                label="Withdrawn Date"
                dateFormat="dd/MM/yyyy"
                isRequired={true}
                disableFuture
              />
            )}

            <div className="space-y-2.5 xl:col-span-3">
              <Label className="text-primary font-bold text-[13px] uppercase tracking-wide">
                Remarks
              </Label>
              <textarea
                {...register("remarks")}
                className="flex w-full rounded-md border border-gray-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-medium min-h-[60px]"
                placeholder="Enter reason for status change or any remarks..."
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
