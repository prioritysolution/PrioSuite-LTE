"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getLoanOtherInfoAPI } from "@/container/loan-entry/new-application/NewApplicationApi";
import { useGlobalContext } from "@/context/GlobalContext";
import { Loader2, Calculator, Calendar } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { format, isValid } from "date-fns";
import { IGroupLoanForm } from "@/app/(dashboard)/loan-entry/new-application/types";
import InputField from "@/common/formFields/InputField";

const toApiDate = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = value instanceof Date ? value : new Date(value as string);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

interface LoanOtherInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberIndex: number | null;
}

export const LoanOtherInfoModal = ({
  isOpen,
  onClose,
  memberIndex,
}: LoanOtherInfoModalProps) => {
  const { user } = useGlobalContext();
  const { watch, setValue, control } = useFormContext<IGroupLoanForm>();

  const loanDate = watch("loan_date");
  const schemeId = watch("scheme_id");
  const member = memberIndex !== null ? watch(`members.${memberIndex}`) : null;

  const loanAmount = member?.loan_amount || 0;
  const formattedLoanDate = useMemo(() => toApiDate(loanDate), [loanDate]);

  const { data: infoData, isLoading } = useQuery({
    queryKey: [
      "loanOtherInfo",
      schemeId,
      formattedLoanDate,
      member?.mem_id,
      loanAmount,
    ],
    queryFn: () =>
      getLoanOtherInfoAPI(
        user?.org_id as number,
        Number(schemeId),
        formattedLoanDate,
        member?.mem_id as number,
        Number(loanAmount),
      ),
    enabled:
      isOpen &&
      !!member?.mem_id &&
      !!schemeId &&
      Number(schemeId) > 0 &&
      !!formattedLoanDate,
  });

  useEffect(() => {
    let resData = null;
    if (infoData) {
      if (infoData.Data && infoData.Data[0]) {
        resData = infoData.Data[0];
      } else if (infoData.data && infoData.data.Data && infoData.data.Data[0]) {
        resData = infoData.data.Data[0];
      } else if (
        infoData.data &&
        infoData.data.data &&
        infoData.data.data.data &&
        infoData.data.data.data[0]
      ) {
        resData = infoData.data.data.data[0];
      } else if (infoData.data && infoData.data.data && infoData.data.data[0]) {
        resData = infoData.data.data[0];
      } else if (infoData.data && infoData.data[0]) {
        resData = infoData.data[0];
      }
    }

    if (resData && memberIndex !== null) {
      setValue(
        `members.${memberIndex}.ln_cycle`,
        resData.Loan_Cycle ?? resData.ln_cycle ?? 1,
      );
      setValue(
        `members.${memberIndex}.inst_no`,
        resData.Inst_No ?? resData.inst_no ?? resData.No_Of_Inst ?? 0,
      );
      setValue(
        `members.${memberIndex}.inst_amt`,
        resData.Inst_Amt ?? resData.inst_amt ?? 0,
      );
      setValue(
        `members.${memberIndex}.resil_amt`,
        resData.Tot_Repay_Amt ??
          resData.Tot_repay_amt ??
          resData.Resil_Amt ??
          resData.resil_amt ??
          0,
      );
      setValue(
        `members.${memberIndex}.final_date`,
        resData.Final_Date ?? resData.final_date ?? "",
      );
    }
  }, [infoData, memberIndex, setValue]);

  if (memberIndex === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl rounded-xl font-sans"
      >
        <div className="bg-primary px-6 py-5 flex items-center justify-between">
          <div>
            <DialogTitle className="text-[18px] font-semibold text-primary-foreground tracking-wide">
              Loan Other Information
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-[12px] mt-1 font-medium">
              Details for {member?.member_name} ({member?.member_no})
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 bg-white space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm font-semibold text-gray-500 animate-pulse">
                Calculating Loan Details...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Loan Cycle
                </Label>
                <InputField
                  control={control}
                  name={`members.${memberIndex}.ln_cycle` as any}
                  isNumeric={true}
                  className="h-10 bg-slate-50 border-gray-200 font-bold text-primary"
                  disabled={true}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  No. of Installments
                </Label>
                <InputField
                  control={control}
                  name={`members.${memberIndex}.inst_no` as any}
                  isNumeric={true}
                  endContent={
                    <Calculator className="text-gray-300" size={14} />
                  }
                  className="h-10 bg-slate-50 border-gray-200 font-bold text-primary"
                  disabled={true}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Installment Amount
                </Label>
                <InputField
                  control={control}
                  name={`members.${memberIndex}.inst_amt` as any}
                  isNumeric={true}
                  className="h-10 bg-slate-50 border-gray-200 font-bold text-green-600"
                  disabled={true}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Resil Amount
                </Label>
                <InputField
                  control={control}
                  name={`members.${memberIndex}.resil_amt` as any}
                  isNumeric={true}
                  className="h-10 bg-slate-50 border-gray-200 font-bold text-orange-600"
                  disabled={true}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Final Date
                </Label>
                <InputField
                  control={control}
                  name={`members.${memberIndex}.final_date` as any}
                  readOnly={true}
                  endContent={<Calendar className="text-gray-300" size={14} />}
                  className="h-10 bg-slate-100 border-gray-200 font-bold text-gray-600"
                  disabled={true}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-6 font-bold rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 h-10 px-8 font-bold rounded-lg text-white shadow-md"
              onClick={onClose}
            >
              Accept & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
