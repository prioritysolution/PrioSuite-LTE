"use client";

import React from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { IGroupLoanForm } from "@/app/(dashboard)/loan-entry/new-application/types";
import { GroupAndSchemeDetails } from "./GroupAndSchemeDetails";
import { MemberLoanTable } from "./MemberLoanTable";

interface NewApplicationUIProps {
  methods: UseFormReturn<IGroupLoanForm>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown>;
  submitPending: boolean;
  onReset: () => void;
}

export const NewApplicationUI: React.FC<NewApplicationUIProps> = ({
  methods,
  onSubmit,
  submitPending,
  onReset,
}) => {
  const members = methods.watch("members") || [];
  const hasMembers = members.length > 0;

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
        <div className="pl-2 flex-shrink-0">
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            New Loan Application
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Create and process new loan applications for groups
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 z-10 w-full xl:w-auto">
          <Button
            type="button"
            onClick={onReset}
            className="h-12 px-8 text-[15px] font-bold tracking-wide w-full md:w-auto bg-primary hover:bg-[#024786] text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Reset
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="form-sections">
          <GroupAndSchemeDetails />

          {hasMembers && <MemberLoanTable />}

          {hasMembers && (
            <div className="form-actions">
              <Button
                type="submit"
                disabled={submitPending}
                className="bg-primary hover:bg-primary/90 h-12 px-10 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto"
              >
                {submitPending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                Save Entry
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};
