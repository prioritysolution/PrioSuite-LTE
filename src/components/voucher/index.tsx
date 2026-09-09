"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Save, RotateCcw } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import RadioField from "@/common/formFields/RadioFields";
import InputField from "@/common/formFields/InputField";
import DropdownField from "@/common/formFields/DropdownField";
import { VoucherProps } from "@/container/voucher/VoucherType";

const VoucherComponent = ({
  form,
  onSubmit,
  resetForm,
  ledgerList = [],
  loading,
}: VoucherProps) => {
  const {
    formState: { isValid },
  } = form;

  const voucherTypeOptions = [
    { value: "1", label: "Receipt" },
    { value: "2", label: "Payment" },
  ];

  const modeOptions = [
    { value: "1", label: "Cash" },
    { value: "2", label: "Bank" },
  ];

  return (
    <div className="w-full h-full flex justify-between bg-[#fefefe] rounded-md">
      <div className="flex flex-col justify-start rounded-md border border-slate-200 p-1 w-full gap-3 overflow-hidden bg-gradient-to-b from-slate-50/60 to-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-3 py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary flex-shrink-0">
              <ClipboardList className="w-4.5 h-4.5" size={18} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                Voucher Entry
              </p>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Record receipts and payments transactions
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="w-full flex-1">
          <div className="p-4">
            <Card className="w-full overflow-hidden border-slate-200/60 shadow-md bg-white rounded-xl">
              <CardContent className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Section 1: Dates & Types */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DatePicker
                        control={form.control}
                        name="voucherDate"
                        label="Voucher Date"
                        placeholder="Select Date"
                        isRequired
                        restrictToFinancialYear
                      />

                      <RadioField
                        control={form.control}
                        name="voucherType"
                        label="Voucher Type"
                        options={voucherTypeOptions}
                        orientation="horizontal"
                        isRequired
                      />
                    </div>

                    {/* Section 2: Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        control={form.control}
                        name="particulars"
                        label="Particulars"
                        placeholder="Enter particulars"
                        isRequired
                      />

                      <InputField
                        control={form.control}
                        name="refVouchNo"
                        label="Ref Vouch No"
                        placeholder="Enter reference voucher number"
                      />
                    </div>

                    {/* Section 3: Ledger & Cash/Bank Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="">
                        <DropdownField
                          control={form.control}
                          name="ledger"
                          label="Select Ledger"
                          options={ledgerList}
                          optionLabelKey="Ledger_Name"
                          optionValueKey="Account_Id"
                          searchPlaceholder="Search ledger..."
                          isRequired
                        />
                      </div>

                      <InputField
                        control={form.control}
                        name="amount"
                        label="Amount"
                        type="text"
                        placeholder="0.00"
                        isNumeric
                        isRequired
                      />
                    </div>

                    {/* Section 4: Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                      <RadioField
                        control={form.control}
                        name="mode"
                        label="Mode"
                        options={modeOptions}
                        orientation="horizontal"
                        isRequired
                      />
                    </div>

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={loading}
                        className="px-5 py-2.5 h-11 text-slate-600 hover:text-slate-900"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !isValid}
                        className="px-6 py-2.5 h-11 min-w-[140px] shadow-sm hover:shadow"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Voucher
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default VoucherComponent;
