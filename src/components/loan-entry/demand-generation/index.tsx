"use client";

import React from "react";
import { ClipboardList, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/GlobalContext";
import { DemandGenerationProps } from "@/container/loan-entry/demand-generation/DemandGenerationType";
import DemandGenerationFilterForm from "./DemandGenerationFilterForm";
import DemandGenerationTable from "./DemandGenerationTable";
import DemandGenerationPrint from "./DemandGenerationPrint";

const DemandGenerationUI = ({
  form,
  coOptions,
  groupOptions,
  coLoading,
  groupLoading,
  generating,
  rows,
  onGenerate,
  onReset,
  onSelectionChange,
}: DemandGenerationProps) => {
  const { user } = useGlobalContext();
  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const selectedCoId = form.watch("co_id");
  const selectedGroupId = form.watch("group_id");
  const sahayikaName =
    coOptions.find((item) => String(item.value) === String(selectedCoId))
      ?.label || "";
  const groupName =
    groupOptions.find((item) => String(item.value) === String(selectedGroupId))
      ?.label || "";

  const hasResults = rows !== null;
  const canPrint = !!rows && rows.length > 0;

  return (
    <>
      <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500 print:hidden">
        <div className="page-header-card">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
          <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ClipboardList size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Demand Generation
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Generate member-wise demand for a Sahayika group
              </p>
              {hasResults && (
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {rows.length} {rows.length === 1 ? "member" : "members"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="page-body-card">
          <div className="form-sections">
            <section className="form-section">
              <div className="form-section-title">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">
                  Select Sahayika and Group
                </h3>
              </div>

              <DemandGenerationFilterForm
                form={form}
                coOptions={coOptions}
                groupOptions={groupOptions}
                coLoading={coLoading}
                groupLoading={groupLoading}
                generating={generating}
                onGenerate={onGenerate}
                onReset={onReset}
                onSelectionChange={onSelectionChange}
              />
            </section>

            {(generating || hasResults) && (
              <section className="form-section">
                <div className="border-b border-gray-100 pb-3 mb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ClipboardList size={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-primary text-base">
                        Demand List
                      </h3>
                      {groupName ? (
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {sahayikaName}
                          {sahayikaName && groupName ? " · " : ""}
                          {groupName}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {canPrint && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePrint()}
                      className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                    >
                      <Printer size={18} />
                      Print
                    </Button>
                  )}
                </div>

                <DemandGenerationTable data={rows} loading={generating} />
              </section>
            )}
          </div>
        </div>
      </div>

      {canPrint && (
        <DemandGenerationPrint
          printRef={printRef}
          rows={rows}
          sahayikaName={sahayikaName}
          groupName={groupName}
          branchName={user?.branch_name || ""}
        />
      )}
    </>
  );
};

export default DemandGenerationUI;
