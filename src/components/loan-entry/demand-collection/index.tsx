"use client";

import { ClipboardList, RefreshCw, Send } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { DemandCollectionProps } from "@/container/loan-entry/demand-collection/DemandCollectionType";
import MemberDetailsSection from "./MemberDetailsSection";

const DemandCollectionUI = ({
  form,
  coOptions,
  groupOptions,
  members,
  showMembers,
  selectedMemberIds,
  onToggleMember,
  onCollectionDetails,
  onSend,
  onReset,
  onSahayikaChange,
}: DemandCollectionProps) => {
  const selectedCoId = form.watch("co_id");
  const selectedGroupId = form.watch("group_id");
  const collectionDate = form.watch("collectionDate");
  const canLoadDetails =
    !!collectionDate && !!selectedCoId && !!selectedGroupId;

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
        <div className="pl-2 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            Demand Collection
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Review group demand by Sahayika and collection date
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

      <Form {...form}>
        <div className="form-sections">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ClipboardList size={18} />
              </div>
              <h3 className="font-semibold text-primary text-lg">
                Collection Details
              </h3>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 form-grid">
              <DatePicker
                control={form.control}
                name="collectionDate"
                label="Collection Date"
                placeholder="Select date"
                isRequired
                restrictToFinancialYear
              />

              <DropdownField
                control={form.control}
                name="co_id"
                label="Sahayika"
                options={coOptions}
                optionLabelKey="label"
                optionValueKey="value"
                isSearch
                isRequired
                placeholder="Select Sahayika"
                onChange={() => onSahayikaChange()}
              />

              <DropdownField
                control={form.control}
                name="group_id"
                label="Group"
                options={groupOptions}
                optionLabelKey="label"
                optionValueKey="value"
                isSearch
                isRequired
                disabled={!selectedCoId}
                placeholder={
                  selectedCoId
                    ? groupOptions.length
                      ? "Select group"
                      : "No groups for this Sahayika"
                    : "Select Sahayika first"
                }
              />
            </div>

            <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
              <div className="form-actions">
                <Button
                  type="button"
                  onClick={onCollectionDetails}
                  disabled={!canLoadDetails}
                  className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <ClipboardList className="h-4 w-4" />
                  Collection Details
                </Button>
              </div>
            </div>
          </div>

          {showMembers && (
            <MemberDetailsSection
              members={members}
              hasGroup
              selectedMemberIds={selectedMemberIds}
              onToggleMember={onToggleMember}
            />
          )}

          <div className="form-actions">
            <Button
              type="button"
              onClick={onSend}
              disabled={!showMembers || selectedMemberIds.length === 0}
              className="bg-primary hover:bg-primary/90 h-12 px-10 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Send size={18} />
              Send
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default DemandCollectionUI;
