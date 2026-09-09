"use client";

import React from "react";
import { useSelector } from "react-redux";
import { FileSpreadsheet, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { CollectionRegisterProps } from "@/container/loan-reports/collection-register/CollectionRegisterType";
import CollectionRegisterFilterForm from "./CollectionRegisterFilterForm";
import CollectionRegisterTable from "./CollectionRegisterTable";
import CollectionRegisterPrint from "./CollectionRegisterPrint";

const pick = (item: any, keys: string[]) => {
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

const CollectionRegisterComponent = ({
  form,
  onSubmit,
  resetForm,
  loading,
}: CollectionRegisterProps) => {
  const collectionRegisterList = useSelector(
    (state: RootState) => state.collectionRegister.collectionRegisterList,
  );
  const branchList = useSelector(
    (state: RootState) => state.collectionRegister.branchList || [],
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
    if (!Array.isArray(collectionRegisterList)) return null;
    return collectionRegisterList.map((item: any, index: number) => ({
      sl: index + 1,
      issueDate: String(
        pick(item, [
          "Coll_Date",
          "coll_date",
          "Collection_Date",
          "collection_date",
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
      memberName: String(
        pick(item, [
          "Member_Name",
          "member_name",
          "Mem_Name",
          "mem_name",
          "MemberName",
        ]) || "",
      ),
      principal:
        pick(item, [
          "Prn_Amount",
          "prn_amount",
          "PRN_AMOUNT",
          "Principal",
          "principal",
          "Prin_Amt",
          "prin_amt",
          "Principal_Amt",
          "principal_amt",
        ]) || 0,
      interest:
        pick(item, [
          "Intt_Amount",
          "intt_amount",
          "INTT_AMOUNT",
          "Interest",
          "interest",
          "Int_Amt",
          "int_amt",
          "Interest_Amt",
          "interest_amt",
        ]) || 0,
      collectionAmount:
        pick(item, [
          "Coll_Amount",
          "coll_amount",
          "COLL_AMOUNT",
          "Coll_Amt",
          "coll_amt",
          "Collection_Amt",
          "collection_amt",
          "Inst_Amt",
          "inst_amt",
          "EMI_Amt",
          "emi_amt",
        ]) || 0,
      outstandingBalance:
        pick(item, [
          "Outs_Amount",
          "outstanding_balance",
          "Outstanding_Balance",
          "Curr_Bal",
        ]) || 0,
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
  }, [collectionRegisterList]);

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
                Collection Register
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                Track and review loan collection details by date range and
                branch
              </p>
              {hasResults && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  <span className="font-semibold text-gray-800">
                    {recordCount}{" "}
                    {recordCount === 1 ? "record" : "records"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">Member-wise collection list</span>
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

              <CollectionRegisterFilterForm
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

                <CollectionRegisterTable data={mappedList} loading={loading} />
              </section>
            )}

            {loading && !hasResults && (
              <section className="form-section">
                <CollectionRegisterTable data={null} loading={loading} />
              </section>
            )}
          </div>
        </div>
      </div>

      {mappedList && mappedList.length > 0 && (
        <CollectionRegisterPrint
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

export default CollectionRegisterComponent;
