"use client";

import React from "react";
import {
  ClipboardList,
  Printer,
  Wallet,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { CashAccountProps } from "@/container/financialReports/cashAccount/cashAccountType";
import CashAccountFilterForm from "./CashAccountFilterForm";
import CashAccountTable from "./CashAccountTable";
import CashAccountPrint from "./CashAccountPrint";

export const CashAccountComponent = ({
  form,
  onSubmit,
  branchList,
  cashAccountReport,
  resetForm,
  loading,
}: CashAccountProps) => {
  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const branchVal = form.watch("branch");

  const selectedBranchName = React.useMemo(() => {
    if (!branchVal || !branchList) return "";
    const br = branchList.find(
      (b) => String(b.Branch_Id) === String(branchVal),
    );
    return br ? br.Branch_Name : "";
  }, [branchVal, branchList]);

  return (
    <>
      <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500 print:hidden">
        <div className="page-header-card">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />

          <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Wallet size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
                Cash Account Report
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                Analyze and review receipts, payments, and balances
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                <span className="font-semibold text-gray-800">
                  Financial Reports
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 truncate">
                  {selectedBranchName || "All branches"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 z-10 w-full xl:w-auto pl-2 xl:pl-0">
            {cashAccountReport && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePrint()}
                className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                Print Report
              </Button>
            )}
          </div>
        </div>

        <div className="page-body-card">
          <div className="form-sections">
            <section className="form-section">
              <div className="form-section-title">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Filter size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">
                  Report Filters
                </h3>
              </div>

              <div className="flex items-start gap-2.5 text-primary/80">
                <ClipboardList size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                  Select the date range and branch to generate the cash account
                  statement.
                </p>
              </div>

              <CashAccountFilterForm
                form={form}
                onFilter={onSubmit}
                resetForm={resetForm}
                branchList={branchList}
                loading={loading}
              />
            </section>
          </div>
        </div>

        <div className="page-body-card">
          <div className="form-sections">
            <section className="form-section">
              <div className="form-section-title">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileSpreadsheet size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">
                  Cash Account Statement
                </h3>
              </div>

              <div className="flex items-start gap-2.5 text-primary/80">
                <FileSpreadsheet size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                  Receipts and payments are shown side by side with opening,
                  closing, and grand totals.
                </p>
              </div>

              <CashAccountTable data={cashAccountReport} loading={loading} />
            </section>
          </div>
        </div>
      </div>

      {cashAccountReport && (
        <CashAccountPrint
          printRef={printRef}
          cashAccountReport={cashAccountReport}
          fromDate={fromDate}
          toDate={toDate}
          selectedBranchName={selectedBranchName}
        />
      )}
    </>
  );
};

export default CashAccountComponent;
