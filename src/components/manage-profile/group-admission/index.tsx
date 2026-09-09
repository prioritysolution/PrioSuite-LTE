"use client";

import React from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, RefreshCw, Search, ArrowRight, X } from "lucide-react";
import { IGroupFormInput } from "@/app/(dashboard)/manage-profile/group-admission/types";
import { BasicAndAdmissionDetails } from "./BasicAndAdmissionDetails";
import { PaymentAndStatusDetails } from "./PaymentAndStatusDetails";
import { SearchGroupModal } from "./SearchGroupModal";
import RadioField from "@/common/formFields/RadioFields";

interface GroupAdmissionUIProps {
  state: {
    flowMode: "add" | "update";
    isFormVisible: boolean;
    isSearchOpen: boolean;
    editMode: boolean;
    searchId: string;
  };
  methods: UseFormReturn<IGroupFormInput & { flowMode: "add" | "update" }>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<unknown>;
  handleNextClick: () => void;
  handleResetFlow: () => void;
  setFlowMode: (mode: "add" | "update") => void;
  setIsSearchOpen: (open: boolean) => void;
  setSearchId: (id: string) => void;
  fetchPending: boolean;
  onFetchGroup: (groupNo: string) => void;
  submitPending: boolean;
}

export const GroupAdmissionUI: React.FC<GroupAdmissionUIProps> = ({
  state,
  methods,
  onSubmit,
  handleNextClick,
  handleResetFlow,
  setFlowMode,
  setIsSearchOpen,
  setSearchId,
  fetchPending,
  onFetchGroup,
  submitPending,
}) => {
  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* group admission header section */}
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary"></div>
        <div className="pl-2 flex-shrink-0">
          <h2 className="text-2xl font-bold text-primary tracking-tight">
            Group Admission
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Register and manage group details efficiently
          </p>
        </div>

        {/*add and update section */}
        <div className="flex flex-col md:flex-row items-center gap-4 z-10 w-full xl:w-auto">
          <FormProvider {...(methods as any)}>
            <RadioField
              control={methods.control as any}
              name="flowMode"
              label=""
              orientation="horizontal"
              options={[
                { value: "add", label: "Add New Group" },
                { value: "update", label: "Update Existing Group" },
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
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full sm:w-[260px]">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                    />
                    <Input
                      placeholder="Enter Group No..."
                      value={state.searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        state.searchId &&
                        onFetchGroup(state.searchId)
                      }
                      className="pl-9 pr-9 h-12 bg-slate-50 border-gray-200 focus-visible:ring-primary focus-visible:border-primary transition-all font-medium w-full"
                    />
                    {state.searchId ? (
                      <button
                        type="button"
                        onClick={() => setSearchId("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Clear group no"
                      >
                        <X size={17} />
                      </button>
                    ) : null}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => onFetchGroup(state.searchId)}
                      disabled={!state.searchId || fetchPending}
                      className="h-12 px-6 bg-primary hover:bg-[#024786] text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap"
                    >
                      {fetchPending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Fetch Data"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsSearchOpen(true)}
                      className="h-12 w-12 p-0 border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg shadow-sm transition-all shrink-0 flex items-center justify-center"
                      title="Advance Search"
                    >
                      <Search size={20} />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleNextClick}
                  className="h-12 px-10 text-[15px] font-bold tracking-wide w-full md:w-auto bg-primary hover:bg-[#024786] text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group"
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

      {state.isFormVisible && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="form-sections">
              <BasicAndAdmissionDetails isEditMode={state.editMode} />
              <PaymentAndStatusDetails isEditMode={state.editMode} />

              <div className="form-actions">
                {/* <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFlow}
                  className="h-12 px-8 font-bold text-gray-700 border-gray-300 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 w-full sm:w-auto"
                >
                  <RefreshCw size={18} />
                  Reset
                </Button> */}
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
                  {state.editMode ? "Update Group" : "Save Group"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      <SearchGroupModal
        isOpen={state.isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(grp_no) => {
          setIsSearchOpen(false);
          onFetchGroup(grp_no);
        }}
      />
    </div>
  );
};
