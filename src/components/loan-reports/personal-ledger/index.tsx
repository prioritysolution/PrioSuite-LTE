"use client";

import React from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  ClipboardList,
  Filter,
  FileSpreadsheet,
  Layers,
  Printer,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { PersonalLedgerProps } from "@/container/loan-reports/personal-ledger/PersonalLedgerType";
import PersonalLedgerFilterForm from "./PersonalLedgerFilterForm";
import PersonalLedgerTable from "./PersonalLedgerTable";
import PersonalLedgerPrint from "./PersonalLedgerPrint";

const formatCycleDate = (raw: unknown) => {
  if (raw == null || raw === "") return "";
  const str = String(raw).trim();
  let date = parseISO(str.length >= 10 ? str.slice(0, 10) : str);
  if (!isValid(date)) date = new Date(str);
  if (!isValid(date)) return str;
  return format(date, "dd/MM/yy");
};

const PersonalLedgerComponent = ({
  form,
  onSubmit,
  groupListData,
  memberListData,
  loanCycleListData,
  personalLedgerData,
  resetForm,
  isMemberListLoading,
  isLoanCycleListLoading,
  loading,
}: PersonalLedgerProps) => {
  const groupId = form.watch("groupId");
  const memberId = form.watch("memberId");
  const loanCycleId = form.watch("loanCycleId");
  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const loanDate = form.watch("loanDate");
  const loanAmount = form.watch("loanAmount");
  const reliasableAmount = form.watch("reliasableAmount");
  const installmentAmount = form.watch("installmentAmount");

  const groupName =
    groupListData?.find((g) => String(g.Group_Id) === String(groupId))
      ?.Group_Name || "";
  const memberName =
    memberListData?.find((m) => String(m.Member_Id) === String(memberId))
      ?.Member_Name || "";

  const formattedLoanCycleList = React.useMemo(() => {
    return (loanCycleListData || []).map((item) => ({
      ...item,
      Cycle_Display: `${item.Loan_Cycle} - ${formatCycleDate(item.Loan_Date)}`,
    }));
  }, [loanCycleListData]);

  const loanCycle =
    formattedLoanCycleList?.find(
      (l) => String(l.Loan_Cycle) === String(loanCycleId),
    )?.Cycle_Display || "";

  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const hasResults =
    Array.isArray(personalLedgerData) && personalLedgerData.length > 0;

  return (
    <>
      <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500 print:hidden">
        <div className="page-header-card">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />

          <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ClipboardList size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
                Personal Ledger
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                Track and review loan collection entries
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                <span className="font-semibold text-gray-800">
                  {hasResults
                    ? `${personalLedgerData.length} ${
                        personalLedgerData.length === 1 ? "record" : "records"
                      }`
                    : "Loan Reports"}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 truncate">
                  {memberName || "Select group & member"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 z-10 w-full xl:w-auto pl-2 xl:pl-0">
            {hasResults && (
              <>
                <div className="inline-flex items-center gap-2.5 self-center bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 shrink-0">
                  <Layers className="w-4 h-4 text-primary shrink-0" />
                  <div className="leading-tight min-w-0">
                    <p className="text-[9px] text-primary/70 font-bold uppercase tracking-widest m-0">
                      Total Records
                    </p>
                    <p className="text-base font-bold text-primary leading-none font-mono mt-0.5 m-0">
                      {personalLedgerData.length}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePrint()}
                  className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print Report
                </Button>
              </>
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
                  Select date range, group, member, and loan cycle to view the
                  personal ledger.
                </p>
              </div>

              <PersonalLedgerFilterForm
                form={form}
                onFilter={onSubmit}
                resetForm={resetForm}
                groupListData={groupListData}
                memberListData={memberListData}
                loanCycleListData={loanCycleListData}
                isMemberListLoading={isMemberListLoading}
                isLoanCycleListLoading={isLoanCycleListLoading}
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
                  Collection Ledger
                </h3>
              </div>

              <p className="text-sm font-medium text-gray-500 leading-relaxed -mt-1">
                Collection entries with principal, interest, and outstanding
                balance for the selected member.
              </p>

              <PersonalLedgerTable
                data={personalLedgerData}
                loading={loading}
              />
            </section>
          </div>
        </div>
      </div>

      {hasResults && (
        <PersonalLedgerPrint
          printRef={printRef}
          personalLedgerData={personalLedgerData}
          groupName={groupName}
          memberName={memberName}
          loanCycle={loanCycle}
          fromDate={fromDate}
          toDate={toDate}
          loanDate={loanDate}
          loanAmount={loanAmount}
          reliasableAmount={reliasableAmount}
          installmentAmount={installmentAmount}
        />
      )}
    </>
  );
};

export default PersonalLedgerComponent;
