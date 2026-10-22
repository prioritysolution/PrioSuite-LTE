"use client";

import { ClipboardList, RefreshCw, Save } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import { DemandCollectionProps } from "@/container/loan-entry/demand-collection/DemandCollectionType";
import MemberDetailsSection from "./MemberDetailsSection";

const DemandCollectionUI = ({
  form,
  coOptions,
  demandOptions,
  coLoading,
  demandLoading,
  detailsLoading,
  saving,
  members,
  summary,
  groups,
  groupWise,
  showMembers,
  onAmountChange,
  onCollectionDetails,
  onSave,
  onReset,
  onSahayikaChange,
}: DemandCollectionProps) => {
  const collectionDate = form.watch("collectionDate");
  const canLoadDetails = !!collectionDate && !detailsLoading;
  const hasPayable = members.some(
    (member) => !member.isCollected && Number(member.payAmount) > 0,
  );

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
      </div>

      <Form {...form}>
        <div className="form-sections">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-primary/5 px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3 rounded-t-xl">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ClipboardList size={18} />
              </div>
              <h3 className="font-semibold text-primary text-lg">
                Collection Details
              </h3>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 form-grid items-start">
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
                className="space-y-0"
                options={coOptions}
                optionLabelKey="label"
                optionValueKey="value"
                isSearch
                loading={coLoading}
                placeholder="All Sahayika"
                onChange={() => onSahayikaChange()}
              />

              <DropdownField
                control={form.control}
                name="group_id"
                label="Demand"
                className="space-y-0"
                options={demandOptions}
                optionLabelKey="label"
                optionValueKey="value"
                isSearch
                disableSorting
                loading={!!collectionDate && demandLoading}
                disabled={!collectionDate}
                placeholder="All Demands"
                searchPlaceholder="Search demand..."
              />
            </div>

            <div className="px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onReset}
                  disabled={saving}
                  className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <RefreshCw size={16} />
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={onCollectionDetails}
                  disabled={!canLoadDetails}
                  className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <ClipboardList className="h-4 w-4" />
                  {detailsLoading ? "Loading..." : "Collection Details"}
                </Button>
              </div>
            </div>
          </div>

          {showMembers && (
            <MemberDetailsSection
              members={members}
              summary={summary}
              groups={groups}
              groupWise={groupWise}
              loading={detailsLoading}
              saving={saving}
              onAmountChange={onAmountChange}
            />
          )}

          {showMembers && !summary?.isFullyCollected && (
            <div className="form-actions">
              <Button
                type="button"
                onClick={onSave}
                disabled={saving || detailsLoading || !hasPayable}
                className="bg-primary hover:bg-primary/90 h-12 px-10 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </Form>
    </div>
  );
};

export default DemandCollectionUI;
