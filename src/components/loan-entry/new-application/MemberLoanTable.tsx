/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getLoanPurposeAPI } from "@/container/loan-entry/new-application/NewApplicationApi";

import { useGlobalContext } from "@/context/GlobalContext";
import { Button } from "@/components/ui/button";
import { Users, Info, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { IGroupLoanForm } from "@/app/(dashboard)/loan-entry/new-application/types";
import { LoanOtherInfoModal } from "./LoanOtherInfoModal";
import DropdownField from "@/common/formFields/DropdownField";
import InputField from "@/common/formFields/InputField";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const openLoanDetails = (
  getValues: ReturnType<typeof useFormContext<IGroupLoanForm>>["getValues"],
  index: number,
  onOpen: (index: number) => void,
) => {
  const loanAmt = getValues(`members.${index}.loan_amount`);
  const loanDate = getValues("loan_date");
  const schemeId = getValues("scheme_id");
  if (!loanDate) {
    toast.error("Please select loan date first.");
    return;
  }
  if (!schemeId || Number(schemeId) <= 0) {
    toast.error("Please select a scheme first.");
    return;
  }
  if (!loanAmt || loanAmt <= 0) {
    toast.error("Please enter loan amount first.");
    return;
  }
  onOpen(index);
};

export const MemberLoanTable = () => {
  const { user } = useGlobalContext();
  const { control, getValues, setValue } = useFormContext<IGroupLoanForm>();

  const { fields } = useFieldArray({
    control,
    name: "members",
  });

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(
    null,
  );

  const watchedMembers = useWatch({ control, name: "members" });
  const sanctionLimit = useWatch({ control, name: "sanction_limit" }) || 0;

  const totalLoan =
    watchedMembers?.reduce(
      (sum, member) => sum + (Number(member.loan_amount) || 0),
      0,
    ) || 0;

  useEffect(() => {
    setValue("appl_amt", totalLoan);
  }, [totalLoan, setValue]);

  const { data: purposeData } = useQuery({
    queryKey: ["purposeList", user?.org_id],
    queryFn: () => getLoanPurposeAPI(user?.org_id as number),
    enabled: !!user?.org_id,
    staleTime: Infinity,
  });

  const purposes =
    purposeData?.details || purposeData?.data?.Data || purposeData?.Data || [];

  const handleOpenDetails = (index: number) => {
    setActiveMemberIndex(index);
    setIsInfoModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg">
              Member Loan Details
            </h3>
            {sanctionLimit > 0 ? (
              <p className="text-xs text-orange-600 font-semibold mt-0.5">
                Max limit per member: ₹{sanctionLimit.toLocaleString("en-IN")}
              </p>
            ) : (
              <p className="text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">
                Enter loan amounts and purpose for each member
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="hover:bg-primary border-0">
                <TableHead className="w-14 text-center h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Sl
                </TableHead>
                <TableHead className="min-w-[80px] h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Member No
                </TableHead>
                <TableHead className="min-w-[140px] h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Member Name
                </TableHead>
                <TableHead className="min-w-[120px] h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Guardian Name
                </TableHead>
                <TableHead className="min-w-[100px] h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Area
                </TableHead>
                <TableHead className="min-w-[120px] h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Loan Amount
                </TableHead>
                <TableHead className="min-w-[140px] h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Purpose
                </TableHead>
                <TableHead className="min-w-[140px] h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Guarantor Name
                </TableHead>
                <TableHead className="min-w-[100px] text-center h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length > 0 ? (
                fields.map((field, index) => (
                  <TableRow key={field.id} className="align-top">
                    <TableCell className="text-center font-bold text-gray-500 py-3">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 py-3">
                      {field.member_no}
                    </TableCell>
                    <TableCell className="font-bold text-primary py-3">
                      {field.member_name}
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium py-3">
                      {field.gurdain_name}
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium py-3">
                      {field.area}
                    </TableCell>
                    <TableCell className="py-2">
                      <InputField
                        control={control}
                        name={`members.${index}.loan_amount` as any}
                        isNumeric={true}
                        startContent={
                          <span className="text-gray-400 font-bold text-xs">
                            ₹
                          </span>
                        }
                        rules={{
                          validate: (val) => {
                            const num = Number(val);
                            if (!val || isNaN(num)) return true;
                            return (
                              num <= sanctionLimit ||
                              `Max limit ₹${sanctionLimit}`
                            );
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <DropdownField
                        control={control}
                        name={`members.${index}.purpose`}
                        options={purposes}
                        optionLabelKey="Purp_Desc"
                        optionValueKey="Purp_Id"
                        isSearch={true}
                        placeholder="Select Purpose"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <InputField
                        control={control}
                        name={`members.${index}.guranter_name` as any}
                        placeholder="Enter name"
                      />
                    </TableCell>
                    <TableCell className="text-center py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 mx-auto"
                        onClick={() =>
                          openLoanDetails(getValues, index, handleOpenDetails)
                        }
                      >
                        <Info size={12} />
                        Get Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-16 text-gray-400 font-semibold"
                  >
                    No members loaded. Select a group and click &quot;Get
                    Member&quot;
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="bg-primary/5 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase tracking-widest">
            <Calculator size={16} />
            <span>Total Estimated Loan</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-primary font-bold text-sm">₹</span>
            <span className="font-black text-primary text-2xl tracking-tighter">
              {totalLoan.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:hidden">
        {fields.length > 0 ? (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="bg-primary/5 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-500 text-xs">
                  Sl No. {index + 1}
                </span>
                <span className="font-bold text-gray-700 text-xs">
                  #{field.member_no}
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium">
                      Member Name
                    </span>
                    <p className="font-bold text-primary">
                      {field.member_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">
                      Guardian Name
                    </span>
                    <p className="font-medium text-gray-700">
                      {field.gurdain_name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 font-medium">Area</span>
                    <p className="font-medium text-gray-600">{field.area}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">
                      Loan Amount
                    </label>
                    <InputField
                      control={control}
                      name={`members.${index}.loan_amount` as any}
                      isNumeric={true}
                      startContent={
                        <span className="text-gray-400 font-bold text-xs">
                          ₹
                        </span>
                      }
                      rules={{
                        validate: (val) => {
                          const num = Number(val);
                          if (!val || isNaN(num)) return true;
                          return (
                            num <= sanctionLimit ||
                            `Max limit ₹${sanctionLimit}`
                          );
                        },
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">
                      Purpose
                    </label>
                    <DropdownField
                      control={control}
                      name={`members.${index}.purpose`}
                      options={purposes}
                      optionLabelKey="Purp_Desc"
                      optionValueKey="Purp_Id"
                      isSearch={true}
                      placeholder="Select Purpose"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">
                      Guarantor Name
                    </label>
                    <InputField
                      control={control}
                      name={`members.${index}.guranter_name` as any}
                      placeholder="Enter name"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                    onClick={() =>
                      openLoanDetails(getValues, index, handleOpenDetails)
                    }
                  >
                    <Info size={12} />
                    Get Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-gray-100 bg-white py-16 text-center text-gray-400 font-semibold text-xs">
            No members loaded. Select a group and click &quot;Get Member&quot;
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="lg:hidden mx-4 mb-4 bg-primary/5 px-4 py-3 border border-gray-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase tracking-widest">
            <Calculator size={16} />
            <span>Total Estimated Loan</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-primary font-bold text-sm">₹</span>
            <span className="font-black text-primary text-2xl tracking-tighter">
              {totalLoan.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}

      <LoanOtherInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        memberIndex={activeMemberIndex}
      />
    </div>
  );
};
