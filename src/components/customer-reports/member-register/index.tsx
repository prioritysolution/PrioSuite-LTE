"use client";

import React from "react";
import { useSelector } from "react-redux";
import { UserRound, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { MemberRegisterProps } from "@/container/customer-reports/member-register/MemberRegisterType";
import MemberRegisterFilterForm from "./MemberRegisterFilterForm";
import MemberRegisterTable from "./MemberRegisterTable";
import MemberRegisterPrint from "./MemberRegisterPrint";

const pick = (item: any, keys: string[]) => {
  if (!item || typeof item !== "object") return "";

  for (const key of keys) {
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }

  const wanted = keys.map((k) => k.toLowerCase());
  for (const key of Object.keys(item)) {
    if (!wanted.includes(key.toLowerCase())) continue;
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }

  return "";
};

const MemberRegisterComponent = ({
  form,
  onSubmit,
  resetForm,
  loading,
}: MemberRegisterProps) => {
  const memberRegisterList = useSelector(
    (state: RootState) => state.memberRegister.memberRegisterList,
  );
  const branchList = useSelector(
    (state: RootState) => state.memberRegister.branchList || [],
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
    if (!Array.isArray(memberRegisterList)) return null;
    return memberRegisterList.map((item: any, index: number) => ({
      sl: index + 1,
      memberNo: String(
        pick(item, ["Member_No", "Mem_No", "member_no", "mem_no"]) || "",
      ),
      memberName: String(
        pick(item, ["Member_Name", "Mem_Name", "member_name", "mem_name"]) ||
          "",
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
      groupName: String(
        pick(item, [
          "Group_Name",
          "Grp_Name",
          "grp_name",
          "GroupName",
          "group_name",
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
      admissionDate: String(
        pick(item, [
          "Adm_Date",
          "adm_date",
          "Admission_Date",
          "Form_Date",
          "Admit_Date",
          "Mem_Adm_Date",
          "Entry_Date",
        ]) || "",
      ),
      underCo: String(
        pick(item, [
          "CO_Name",
          "Co_Name",
          "co_name",
          "Under_CO",
          "Under_Co",
          "Sahayika_Name",
          "Sahayika",
          "Admitted_By",
        ]) || "",
      ),
    }));
  }, [memberRegisterList]);

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
              <UserRound size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
                Member Register
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                Track and review member details by date range and branch
              </p>
              {hasResults && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  <span className="font-semibold text-gray-800">
                    {recordCount}{" "}
                    {recordCount === 1 ? "record" : "records"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">Member register list</span>
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
                  <UserRound size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">
                  Search Filters
                </h3>
              </div>

              <MemberRegisterFilterForm
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
                    <UserRound size={14} />
                  </div>
                  <h3 className="font-bold text-primary text-base">
                    Report Results
                  </h3>
                </div>

                <MemberRegisterTable data={mappedList} loading={loading} />
              </section>
            )}

            {loading && !hasResults && (
              <section className="form-section">
                <MemberRegisterTable data={null} loading={loading} />
              </section>
            )}
          </div>
        </div>
      </div>

      {mappedList && mappedList.length > 0 && (
        <MemberRegisterPrint
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

export default MemberRegisterComponent;
