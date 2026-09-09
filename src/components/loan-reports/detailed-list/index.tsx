"use client";

import React from "react";
import { useSelector } from "react-redux";
import { ClipboardList, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { DetailedListProps } from "@/container/loan-reports/detailed-list/DetailedListType";
import DetailedListFilterForm from "./DetailedListFilterForm";
import DetailedListTable from "./DetailedListTable";
import DetailedListPrint from "./DetailedListPrint";

const pickNum = (item: any, keys: string[]) => {
  for (const key of keys) {
    const raw = item?.[key];
    if (raw === undefined || raw === null || raw === "") continue;
    const n = Number(raw);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
};

const pick = (item: any, keys: string[]) => {
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      const s = String(val).trim();
      if (/^[-–—_]+$/.test(s)) continue;
      return val;
    }
  }
  const wanted = keys.map((k) => k.toLowerCase());
  for (const key of Object.keys(item || {})) {
    if (!wanted.includes(key.toLowerCase())) continue;
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      const s = String(val).trim();
      if (/^[-–—_]+$/.test(s)) continue;
      return val;
    }
  }
  return "";
};

const DetailedListComponent = ({
  form,
  onSubmit,
  resetForm,
  loading,
}: DetailedListProps) => {
  const detailedList = useSelector(
    (state: RootState) => state.detailedList.detailedList,
  );
  const branchList = useSelector(
    (state: RootState) => state.detailedList.branchList || [],
  );
  const schemeList = useSelector(
    (state: RootState) => state.detailedList.schemeList || [],
  );

  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const branch = form.watch("branch");
  const scheme = form.watch("scheme");

  const selectedBranch = branchList.find(
    (b: any) => String(b.Branch_Id) === String(branch),
  );
  const branchName = selectedBranch?.Branch_Name || "";
  const branchAddress = String(
    pick(selectedBranch, [
      "Address",
      "Branch_Add",
      "Brn_Add",
      "branch_add",
      "Branch_Address",
      "Org_Address",
      "org_address",
      "Office_Address",
      "office_address",
      "Add1",
      "Add_1",
    ]) || "",
  );
  const schemeName =
    schemeList.find((s: any) => String(s.Scheme_Id) === String(scheme))
      ?.Scheme_Name || "";

  const mappedList = React.useMemo(() => {
    if (!Array.isArray(detailedList)) return null;
    return detailedList.map((item: any) => ({
      sl: Number(item.sl ?? item.Sl ?? 0),
      groupName: item.grp_name || item.Group_Name || item.Grp_Name || "",
      memberName:
        item.member_name || item.Member_Name || item.Mem_Name || "N/A",
      loanDate: item.loan_date || item.Loan_Date || "",
      loanAmount: pickNum(item, ["loan_amount", "Loan_Amount", "Issue_Amt"]),
      realizableAmount: pickNum(item, [
        "resilable_amount",
        "realisable_amount",
        "Realisable_Amt",
        "Resilable_Amt",
      ]),
      openingBalance: pickNum(item, [
        "opening_balance",
        "Opening_Balance",
        "open_balance",
        "Open_Balance",
        "opn_balance",
      ]),
      issueAmount: pickNum(item, [
        "issue_amount",
        "Issue_Amount",
        "issue",
        "Issue",
        "loan_issue",
        "Loan_Issue",
      ]),
      repayPrincipal: pickNum(item, [
        "repay_principal",
        "Repay_Principal",
        "repayment_principal",
        "prn_repay",
        "Prn_Repay",
        "principal_repay",
        "Principal",
      ]),
      repayInterest: pickNum(item, [
        "repay_interest",
        "Repay_Interest",
        "repayment_interest",
        "intt_repay",
        "Intt_Repay",
        "interest_repay",
        "Interest",
      ]),
      receivableInterest: pickNum(item, [
        "receivable_interest",
        "Receivable_Interest",
        "recv_intt",
        "Recv_Intt",
        "receivable_intt",
        "Receivable_Intt",
      ]),
      outstandingBalance: pickNum(item, [
        "outstanding_balance",
        "Outstanding_Balance",
        "outs_balance",
        "Outs_Amount",
        "Outs_Balance",
      ]),
    }));
  }, [detailedList]);

  const printRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const recordCount = mappedList?.length ?? 0;
  const hasResults = mappedList !== null;

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
                Detailed List
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                Track and review loan details by date range, branch, and scheme
              </p>
              {hasResults && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  <span className="font-semibold text-gray-800">
                    {recordCount}{" "}
                    {recordCount === 1 ? "record" : "records"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 truncate">
                    {schemeName || "Loan detailed list"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 z-10 w-full xl:w-auto pl-2 xl:pl-0">
            {mappedList && mappedList.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePrint()}
                className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Printer size={18} />
                Print
              </Button>
            )}
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
                  Search Filters
                </h3>
              </div>

              <DetailedListFilterForm
                form={form}
                onFilter={onSubmit}
                resetForm={resetForm}
                loading={loading}
              />
            </section>

            {hasResults && (
              <section className="form-section">
                <div className="form-section-title">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ClipboardList size={14} />
                  </div>
                  <h3 className="font-bold text-primary text-base">
                    Report Results
                  </h3>
                </div>

                <DetailedListTable data={mappedList} loading={loading} />
              </section>
            )}

            {loading && !hasResults && (
              <section className="form-section">
                <DetailedListTable data={null} loading={loading} />
              </section>
            )}
          </div>
        </div>
      </div>

      {mappedList && mappedList.length > 0 && (
        <DetailedListPrint
          printRef={printRef}
          mappedList={mappedList}
          fromDate={fromDate}
          toDate={toDate}
          branchName={branchName}
          branchAddress={branchAddress}
          schemeName={schemeName}
        />
      )}
    </>
  );
};

export default DetailedListComponent;
