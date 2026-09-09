"use client";

import React from "react";
import { useSelector } from "react-redux";
import { FileSpreadsheet, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { IssueRegisterProps } from "@/container/loan-reports/issue-register/IssueRegisterType";
import IssueRegisterFilterForm from "./IssueRegisterFilterForm";
import IssueRegisterTable from "./IssueRegisterTable";
import IssueRegisterPrint from "./IssueRegisterPrint";

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

const pickGuarantor = (item: any) => {
  const fromKeys = pick(item, [
    "Guaranter_Name",
    "Guarantor_Name",
    "Gurantor_Name",
    "Guranter_Name",
    "guarantor_name",
    "gurantor_name",
    "guaranter_name",
    "guranter_name",
    "Gurr_Name",
    "gurr_name",
    "GurrName",
    "Guar_Name",
    "Guarantar_Name",
    "Surety_Name",
    "surety_name",
    "Guarantor",
    "Guaranter",
  ]);
  if (fromKeys) return String(fromKeys);

  for (const key of Object.keys(item || {})) {
    const lk = key.toLowerCase().replace(/[\s-]+/g, "_");
    if (lk.includes("guardian") || lk.includes("gurdain") || lk.includes("gurd_")) {
      continue;
    }
    if (
      lk.includes("guaranter") ||
      lk.includes("guranter") ||
      lk.includes("guarantor") ||
      lk === "gurr_name" ||
      lk === "gurrname" ||
      (lk.startsWith("gurr") && lk.includes("name"))
    ) {
      const val = item[key];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        const s = String(val).trim();
        if (/^[-–—_]+$/.test(s)) continue;
        return s;
      }
    }
  }
  return "";
};

const IssueRegisterComponent = ({
  form,
  onSubmit,
  resetForm,
  loading,
}: IssueRegisterProps) => {
  const issueRegisterList = useSelector(
    (state: RootState) => state.issueRegister.issueRegisterList,
  );
  const branchList = useSelector(
    (state: RootState) => state.issueRegister.branchList || [],
  );

  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const branch = form.watch("branch");

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

  const mappedList = React.useMemo(() => {
    if (!Array.isArray(issueRegisterList)) return null;
    return issueRegisterList.map((item: any, index: number) => ({
      sl: index + 1,
      issueDate: String(
        pick(item, [
          "Loan_Date",
          "loan_date",
          "Issue_Date",
          "issue_date",
          "Disb_Date",
          "disb_date",
        ]) || "",
      ),
      groupName: String(
        pick(item, ["Grp_Name", "Group_Name", "grp_name", "GroupName"]) ||
          "",
      ),
      memberNo: String(
        pick(item, [
          "Member_No",
          "Mem_No",
          "member_no",
          "mem_no",
          "Membership_No",
        ]) || "",
      ),
      memberName: String(
        pick(item, [
          "Member_Name",
          "member_name",
          "Mem_Name",
          "mem_name",
          "MemberName",
        ]) || "",
      ),
      guardianName: String(
        pick(item, [
          "FatHusb_Name",
          "Father_Name",
          "Gurd_Name",
          "Guardian_Name",
          "Gurdain_Name",
          "mem_fname",
          "Father_Husband",
          "FH_Name",
          "Husband_Name",
        ]) || "",
      ),
      area: String(
        pick(item, [
          "Area_Name",
          "Area",
          "Vill_Name",
          "area_name",
          "Vill_Area",
        ]) || "",
      ),
      schemeName: String(
        pick(item, [
          "Schme_Name",
          "Scheme_Name",
          "scheme_name",
          "Schem_Name",
          "Schm_Name",
          "SchemeName",
          "schemeName",
          "Sch_Name",
          "sch_name",
          "Scheme_Nm",
          "scheme_nm",
        ]) || "",
      ),
      realisableAmt:
        pick(item, [
          "Realisable_Amt",
          "Resilable_Amt",
          "resilable_amount",
          "realisable_amount",
          "Realizable_Amt",
        ]) || "",
      guarantorName: pickGuarantor(item),
      loanAmount:
        pick(item, [
          "Loan_Amt",
          "Loan_Amount",
          "loan_amt",
          "loan_amount",
          "Appl_Amt",
          "Sanc_Amount",
        ]) || "",
      installmentAmt:
        pick(item, [
          "Installment_Amt",
          "Instl_Amt",
          "Inst_Amount",
          "inst_amt",
          "Installment_Amount",
        ]) || "",
      underCo: String(
        pick(item, [
          "Co_Name",
          "CO_Name",
          "co_name",
          "Under_CO",
          "Under_Co",
          "Sahayika_Name",
          "Admitted_By",
        ]) || "",
      ),
    }));
  }, [issueRegisterList]);

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
              <FileSpreadsheet size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
                Issue Register
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                Track and review loan issue details by date range and branch
              </p>
              {hasResults && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  <span className="font-semibold text-gray-800">
                    {recordCount}{" "}
                    {recordCount === 1 ? "record" : "records"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">Issue register list</span>
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
                  <FileSpreadsheet size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">
                  Search Filters
                </h3>
              </div>

              <IssueRegisterFilterForm
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
                    <FileSpreadsheet size={14} />
                  </div>
                  <h3 className="font-bold text-primary text-base">
                    Report Results
                  </h3>
                </div>

                <IssueRegisterTable data={mappedList} loading={loading} />
              </section>
            )}

            {loading && !hasResults && (
              <section className="form-section">
                <IssueRegisterTable data={null} loading={loading} />
              </section>
            )}
          </div>
        </div>
      </div>

      {mappedList && mappedList.length > 0 && (
        <IssueRegisterPrint
          printRef={printRef}
          mappedList={mappedList}
          fromDate={fromDate}
          toDate={toDate}
          branchName={branchName}
          branchAddress={branchAddress}
        />
      )}
    </>
  );
};

export default IssueRegisterComponent;
