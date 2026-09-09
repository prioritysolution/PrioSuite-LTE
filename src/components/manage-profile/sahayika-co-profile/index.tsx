"use client";

import React from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, Save, RefreshCw, Search, ArrowRight } from "lucide-react";
import { ICoFormInput, ICoProfile } from "@/app/(dashboard)/manage-profile/sahayika-co-profile/types";
import { CoProfileDetails } from "./CoProfileDetails";
import { SearchCoModal } from "./SearchCoModal";
import RadioField from "@/common/formFields/RadioFields";

interface SahayikaCoProfileUIProps {
  state: {
    flowMode: "add" | "update";
    isFormVisible: boolean;
    isSearchOpen: boolean;
    editMode: boolean;
  };
  methods: UseFormReturn<ICoFormInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown>;
  handleCoSelect: (coData: ICoProfile) => void;
  handleNextClick: () => void;
  handleResetFlow: () => void;
  setFlowMode: (mode: "add" | "update") => void;
  setIsSearchOpen: (open: boolean) => void;
  submitPending: boolean;
}

export const SahayikaCoProfileUI: React.FC<SahayikaCoProfileUIProps> = ({
  state,
  methods,
  onSubmit,
  handleCoSelect,
  handleNextClick,
  handleResetFlow,
  setIsSearchOpen,
  submitPending,
}) => {
  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* header section */}
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
        <div className="pl-2 flex-shrink-0">
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            Sahayika / CO Profile
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Register and manage collection officers efficiently
          </p>
        </div>

        {/* mode selection + action */}
        <div className="flex flex-col md:flex-row items-center gap-4 z-10 w-full xl:w-auto">
          <FormProvider {...(methods as any)}>
            <RadioField
              control={methods.control as any}
              name="flowMode"
              label=""
              orientation="horizontal"
              options={[
                { value: "add", label: "Add New Profile" },
                { value: "update", label: "Update Existing Profile" },
              ]}
              disabled={state.isFormVisible}
            />
          </FormProvider>

          {state.isFormVisible ? (
            <Button
              onClick={handleResetFlow}
              className="h-12 px-8 text-[15px] font-bold tracking-wide w-full md:w-auto bg-primary hover:bg-[#024786] text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              <RefreshCw size={18} />
              Reset
            </Button>
          ) : (
            <div className="flex items-center gap-3 w-full md:w-auto animate-in fade-in slide-in-from-right-4 duration-300">
              {state.flowMode === "update" ? (
                <Button
                  variant="outline"
                  onClick={() => setIsSearchOpen(true)}
                  className="h-12 px-6 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 w-full md:w-auto"
                >
                  <Search size={18} />
                  Search CO Profile
                </Button>
              ) : (
                <Button
                  onClick={handleNextClick}
                  className="h-12 px-10 text-[15px] font-bold tracking-wide w-full md:w-auto bg-primary hover:bg-[#024786] text-white rounded-lg shadow-sm transition-all flex items-center gap-2 group"
                >
                  Next
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* main form section */}
      {state.isFormVisible && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 page-body-card">
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="form-sections">
              <CoProfileDetails isEditMode={state.editMode} />

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
                  {state.editMode ? "Update Profile" : "Save Profile"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      <SearchCoModal
        isOpen={state.isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(coData) => {
          handleCoSelect(coData);
        }}
      />
    </div>
  );
};
