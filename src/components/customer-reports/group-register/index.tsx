"use client";

import React from "react";
import { useSelector } from "react-redux";
import { Users, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { RootState } from "@/redux/store";
import { GroupRegisterProps } from "@/container/customer-reports/group-register/GroupRegisterType";
import GroupRegisterFilterForm from "./GroupRegisterFilterForm";
import GroupRegisterTable from "./GroupRegisterTable";
import GroupRegisterPrint from "./GroupRegisterPrint";

const pick = (item: any, keys: string[]) => {
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

const GroupRegisterComponent = ({
  form,
  onSubmit,
  resetForm,
  loading,
}: GroupRegisterProps) => {
  const groupRegisterList = useSelector(
    (state: RootState) => state.groupRegister.groupRegisterList,
  );
  const branchList = useSelector(
    (state: RootState) => state.groupRegister.branchList || [],
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
    if (!Array.isArray(groupRegisterList)) return null;
    return groupRegisterList.map((item: any, index: number) => ({
      sl: index + 1,
      groupNo: String(
        pick(item, ["Group_No", "Grp_No", "grp_no", "GroupNo"]) || "",
      ),
      groupName: String(
        pick(item, ["Group_Name", "Grp_Name", "grp_name", "GroupName"]) ||
          "",
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
      memberCount:
        pick(item, ["Mem_No", "Member_Count", "mem_no", "Tot_Mem", "No_Of_Member", "NoOfMember"]) ||
        "",
      admissionDate: String(
        pick(item, ["Adm_Date", "adm_date", "Admission_Date", "Form_Date"]) ||
          "",
      ),
      underCo: String(
        pick(item, [
          "CO_Name",
          "Co_Name",
          "co_name",
          "Under_CO",
          "Under_Co",
          "Sahayika_Name",
          "Admitted_By",
          "CO_Code",
          "Co_Code",
        ]) || "",
      ),
    }));
  }, [groupRegisterList]);

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
              <Users size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
                Group Register
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                Track and review group details by date range and branch
              </p>
              {hasResults && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                  <span className="font-semibold text-gray-800">
                    {recordCount}{" "}
                    {recordCount === 1 ? "record" : "records"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500">Group register list</span>
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
                  <Users size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">
                  Search Filters
                </h3>
              </div>

              <GroupRegisterFilterForm
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
                    <Users size={14} />
                  </div>
                  <h3 className="font-bold text-primary text-base">
                    Report Results
                  </h3>
                </div>

                <GroupRegisterTable data={mappedList} loading={loading} />
              </section>
            )}

            {loading && !hasResults && (
              <section className="form-section">
                <GroupRegisterTable data={null} loading={loading} />
              </section>
            )}
          </div>
        </div>
      </div>

      {mappedList && mappedList.length > 0 && (
        <GroupRegisterPrint
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

export default GroupRegisterComponent;
