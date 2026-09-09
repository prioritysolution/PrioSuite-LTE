"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Loader2,
  Search,
  Layers,
  Save,
  X,
} from "lucide-react";
import {
  FieldErrors,
  UseFormRegister,
  Control,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";
import { IScheme } from "@/container/setup/scheme-master/SchemeMasterReducer";
import { ISchemeFormInput } from "@/container/setup/scheme-master/Hooks";
import InputField from "@/common/formFields/InputField";
import DropdownField from "@/common/formFields/DropdownField";

interface SchemeUIProps {
  state: {
    isModalOpen: boolean;
    editId: number | null;
    searchTerm: string;
  };
  isLoading: boolean;
  filteredData: IScheme[];
  register: UseFormRegister<ISchemeFormInput>;
  control: Control<ISchemeFormInput>;
  errors: FieldErrors<ISchemeFormInput>;
  submitPending: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleEdit: (item: IScheme) => void;
  openModal: () => void;
  closeModal: () => void;
  setSearchTerm: (term: string) => void;
  form: UseFormReturn<ISchemeFormInput>;
  repayModeOptions: any[];
  repayModeLoading: boolean;
  ledgerOptions: any[];
  ledgerLoading: boolean;
}

export const SchemeUI: React.FC<SchemeUIProps> = ({
  state,
  isLoading,
  filteredData,
  control,
  submitPending,
  onSubmit,
  handleEdit,
  openModal,
  closeModal,
  setSearchTerm,
  form,
  repayModeOptions,
  repayModeLoading,
  ledgerOptions,
  ledgerLoading,
}) => {
  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "₹ 0.00";
    return `₹ ${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount)}`;
  };

  const columns: ColumnDef<IScheme>[] = [
    {
      id: "sl",
      header: "Sl",
      cell: ({ row }) => (
        <span className="text-gray-600 font-semibold px-1">
          {row.index + 1}
        </span>
      ),
    },
    {
      id: "scheme",
      header: "Scheme Name",
      cell: ({ row }) => {
        const name = row.original.Scheme_Name || "Unknown";
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Layers size={14} />
            </div>
            <span className="font-semibold text-primary tracking-wide">
              {name}
            </span>
          </div>
        );
      },
    },
    {
      id: "roi",
      header: "ROI (%)",
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">
          {row.original.RoI ?? "-"}
        </span>
      ),
    },
    {
      id: "repay",
      header: "Repay Mode",
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">
          {row.original.Repay_Name || row.original.Repay_Mode || "-"}
        </span>
      ),
    },
    {
      id: "period",
      header: "Repay Period",
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">
          {row.original.Repay_Period ?? "-"}
        </span>
      ),
    },
    {
      id: "limit",
      header: "Sanction Limit",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-800">
          {formatCurrency(row.original.Sanction_Limit)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Action</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-1 pr-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 transition-all rounded-md"
              onClick={() => handleEdit(item)}
            >
              <Edit size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />

        <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Layers size={24} />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
              Scheme Master
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              Define and manage loan schemes efficiently
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <span className="font-semibold text-gray-800">
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "scheme" : "schemes"}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">Loan scheme setup</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 z-10 w-full xl:w-auto pl-2 xl:pl-0">
          <div className="relative w-full sm:w-[260px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={17}
            />
            <Input
              placeholder="Search scheme..."
              value={state.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 h-11 bg-slate-50 border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 w-full font-medium"
            />
            {state.searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            ) : null}
          </div>

          <Button
            onClick={openModal}
            className="bg-primary hover:bg-primary/90 h-11 px-5 font-semibold rounded-lg text-white shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            Add New Scheme
          </Button>
        </div>
      </div>

      <Dialog
        open={state.isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl font-sans gap-0">
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Layers size={18} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                  {state.editId ? "Update Scheme Details" : "Create New Scheme"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1 font-medium">
                  {state.editId
                    ? "Modify the selected loan scheme details below."
                    : "Enter the required details to create a loan scheme."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <FormProvider {...form}>
            <form
              onSubmit={onSubmit}
              className="p-5 sm:p-6 space-y-5 bg-white max-h-[70vh] overflow-y-auto"
              autoComplete="off"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="sm:col-span-2">
                  <InputField
                    control={control}
                    name="scheme_name"
                    label="Scheme Name"
                    placeholder="Enter scheme name"
                    isRequired={true}
                  />
                </div>

                <InputField
                  control={control}
                  name="roi"
                  label="ROI (%)"
                  placeholder="Enter rate of interest"
                  isNumeric={true}
                  isRequired={true}
                />

                {repayModeOptions.length > 0 ? (
                  <DropdownField
                    control={control}
                    name="repay_mode"
                    label="Repay Mode"
                    placeholder="Select repay mode"
                    options={repayModeOptions}
                    optionLabelKey="Option_Name"
                    optionValueKey="Opt_Code"
                    isRequired={true}
                    isSearch={true}
                    loading={repayModeLoading}
                  />
                ) : (
                  <InputField
                    control={control}
                    name="repay_mode"
                    label="Repay Mode"
                    placeholder="Enter repay mode code"
                    isNumeric={true}
                    isRequired={true}
                  />
                )}

                <InputField
                  control={control}
                  name="repay_period"
                  label="Repay Period"
                  placeholder="Enter repay period"
                  isNumeric={true}
                  isRequired={true}
                />

                <InputField
                  control={control}
                  name="sanction_limit"
                  label="Sanction Limit"
                  placeholder="Enter sanction limit"
                  isNumeric={true}
                  isRequired={true}
                  startContent={
                    <span className="text-gray-400 font-bold text-xs">₹</span>
                  }
                />

                <InputField
                  control={control}
                  name="roi_od"
                  label="ROI OD (%)"
                  placeholder="Enter overdue ROI"
                  isNumeric={true}
                  isRequired={true}
                />

                <InputField
                  control={control}
                  name="instl_amt_1000"
                  label="Installment Amt / 1000"
                  placeholder="Enter installment amount per 1000"
                  isNumeric={true}
                  isRequired={true}
                />

                <DropdownField
                  control={control}
                  name="prn_ledger"
                  label="Principal Ledger"
                  placeholder="Select principal ledger"
                  options={ledgerOptions}
                  optionLabelKey="Ledger_Name"
                  optionValueKey="Account_Id"
                  isRequired={true}
                  isSearch={true}
                  loading={ledgerLoading}
                  searchPlaceholder="Search ledger..."
                />

                <DropdownField
                  control={control}
                  name="intt_ledger"
                  label="Interest Ledger"
                  placeholder="Select interest ledger"
                  options={ledgerOptions}
                  optionLabelKey="Ledger_Name"
                  optionValueKey="Account_Id"
                  isRequired={true}
                  isSearch={true}
                  loading={ledgerLoading}
                  searchPlaceholder="Search ledger..."
                />
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitPending}
                  className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px]"
                >
                  {submitPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {state.editId ? "Update Scheme" : "Save Scheme"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <div className="page-body-card">
        <div className="form-sections">
          <section className="form-section">
            <div className="form-section-title">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Layers size={14} />
              </div>
              <h3 className="font-bold text-primary text-base">Scheme List</h3>
            </div>

            <div className="flex items-start gap-2.5 text-primary/80">
              <Layers size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Maintain loan schemes used across new loan application
                workflows.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] sm:h-[320px] rounded-xl border border-gray-100 bg-slate-50/50">
                <div className="flex flex-col items-center gap-3 text-primary">
                  <Loader2 className="animate-spin" size={36} />
                  <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
                    Fetching Records...
                  </span>
                </div>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredData} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
