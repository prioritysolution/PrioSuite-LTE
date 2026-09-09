import React, { useEffect, useState } from "react";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";

interface PersonalLedgerPrintProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  personalLedgerData: any[];
  groupName: string;
  memberName: string;
  loanCycle: string;
  fromDate: Date | string | null;
  toDate: Date | string | null;
  loanDate: Date | string | null;
  loanAmount: string | number;
  reliasableAmount: string | number;
  installmentAmount: string | number;
}

const pickAddress = (item: any) => {
  if (!item || typeof item !== "object") return "";
  const keys = [
    "Org_Address",
    "org_address",
    "Address",
    "Branch_Add",
    "Brn_Add",
    "branch_add",
    "Branch_Address",
    "Office_Address",
    "office_address",
    "Add1",
    "Add_1",
  ];
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return "";
};

const PersonalLedgerPrint = ({
  printRef,
  personalLedgerData,
  groupName,
  memberName,
  loanCycle,
  fromDate,
  toDate,
  loanDate,
  loanAmount,
  reliasableAmount,
  installmentAmount,
}: PersonalLedgerPrintProps) => {
  const [orgName, setOrgName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    setOrgName(getCookieData("priobank-lite-org_name") || "");
    setBranchName(getCookieData("priobank-lite-branch_name") || "");

    const orgId = Number(getCookieData("priobank-lite-org_id") || 0);
    const branchId = Number(getCookieData("priobank-lite-branch_id") || 0);
    if (!orgId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await getBranchListAPI(orgId);
        const list = Array.isArray(res?.Data)
          ? res.Data
          : Array.isArray(res?.details)
            ? res.details
            : Array.isArray(res?.data)
              ? res.data
              : [];
        const match =
          list.find(
            (b: any) =>
              String(b?.Branch_Id ?? b?.branch_id) === String(branchId),
          ) || list[0];
        if (!cancelled) setOrgAddress(pickAddress(match));
      } catch {
        if (!cancelled) setOrgAddress("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCollectionAmount = personalLedgerData.reduce(
    (acc, row) => acc + (Number(row.collection_amount) || 0),
    0,
  );
  const totalPrincipal = personalLedgerData.reduce(
    (acc, row) => acc + (Number(row.principal) || 0),
    0,
  );
  const totalInterest = personalLedgerData.reduce(
    (acc, row) => acc + (Number(row.interest) || 0),
    0,
  );

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
    [],
  );

  const formatCurrency = (value: string | number | null) => {
    const num = value !== null && value !== undefined ? Number(value) : 0;
    return isNaN(num) ? "₹0.00" : currencyFormatter.format(num);
  };

  const formatDateStr = (dateVal: any) => {
    if (!dateVal) return "-";
    const dateObj = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (isNaN(dateObj.getTime())) return "-";
    return format(dateObj, "d MMM, yyyy");
  };

  const displayAddress = orgAddress.trim();

  return (
    <div
      ref={printRef}
      className="hidden print:block w-[297mm] mx-auto p-6 text-black bg-white text-xs print-area"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `,
        }}
      />

      <table className="w-full border-collapse text-center text-xs">
        <thead>
          <tr style={{ border: "none" }}>
            <td
              colSpan={6}
              style={{ border: "none" }}
              className="font-bold text-xl tracking-wider uppercase text-black py-0.5"
            >
              {orgName}
            </td>
          </tr>
          <tr style={{ border: "none" }}>
            <td
              colSpan={6}
              style={{ border: "none" }}
              className="font-semibold text-sm uppercase text-slate-700 py-0.5"
            >
              {branchName}
            </td>
          </tr>
          {displayAddress ? (
            <tr style={{ border: "none" }}>
              <td
                colSpan={6}
                style={{ border: "none" }}
                className="text-[12px] font-medium text-slate-700 py-0.5 leading-relaxed"
              >
                {displayAddress}
              </td>
            </tr>
          ) : null}
          <tr style={{ border: "none" }}>
            <td
              colSpan={6}
              style={{ border: "none" }}
              className="font-bold text-md tracking-widest underline uppercase text-black pt-2 pb-3"
            >
              PERSONAL LEDGER
            </td>
          </tr>

          <tr
            className="bg-slate-50/40 text-[13px]"
            style={{ border: "1px solid black" }}
          >
            <td
              colSpan={3}
              className="p-3 text-left align-top"
              style={{
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                borderTop: "1px solid black",
                borderLeft: "1px solid black",
              }}
            >
              <div className="pb-1.5 flex items-center gap-1.5">
                <span className="font-bold text-black">Group Name:</span>
                <span className="font-medium text-slate-800">
                  {groupName || "N/A"}
                </span>
              </div>
              <div className="pb-1.5 flex items-center gap-1.5">
                <span className="font-bold text-black">Member Name:</span>
                <span className="font-medium text-slate-800">
                  {memberName || "N/A"}
                </span>
              </div>
              <div className="pb-1.5 flex items-center gap-1.5">
                <span className="font-bold text-black">Loan Cycle:</span>
                <span className="font-medium text-slate-800">
                  {loanCycle || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-black">Date Range:</span>
                <span className="font-medium text-slate-800">
                  {fromDate ? formatDateStr(fromDate) : "Beginning"} to{" "}
                  {toDate ? formatDateStr(toDate) : "End"}
                </span>
              </div>
            </td>
            <td
              colSpan={3}
              className="p-3 text-left align-top"
              style={{
                borderBottom: "1px solid black",
                borderTop: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              <div className="pb-1.5 flex items-center gap-1.5">
                <span className="font-bold text-black">Loan Date:</span>
                <span className="font-medium text-slate-800">
                  {formatDateStr(loanDate)}
                </span>
              </div>
              <div className="pb-1.5 flex items-center gap-1.5">
                <span className="font-bold text-black">Loan Amount:</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(loanAmount)}
                </span>
              </div>
              <div className="pb-1.5 flex items-center gap-1.5">
                <span className="font-bold text-black">Realisable Amount:</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(reliasableAmount)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-black">Installment Amount:</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(installmentAmount)}
                </span>
              </div>
            </td>
          </tr>

          <tr style={{ border: "none" }}>
            <td colSpan={6} style={{ border: "none", height: "16px" }}></td>
          </tr>

          <tr className="bg-slate-100 font-bold border-b border-black">
            <th className="border border-black p-2 w-[40px]">Sl.</th>
            <th className="border border-black p-2 text-left">
              Collection Date
            </th>
            <th className="border border-black p-2 text-right">
              Collection Amount
            </th>
            <th className="border border-black p-2 text-right">Principal</th>
            <th className="border border-black p-2 text-right">Interest</th>
            <th className="border border-black p-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {personalLedgerData.map((row) => (
            <tr key={row.sl} className="border-b border-black">
              <td className="border border-black p-2">{row.sl}</td>
              <td className="border border-black p-2 text-left">
                {formatDateStr(row.collection_date)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatCurrency(row.collection_amount)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatCurrency(row.principal)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatCurrency(row.interest)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatCurrency(row.balance)}
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-slate-50 border-t border-black">
            <td colSpan={2} className="border border-black p-2 text-right">
              Total
            </td>
            <td className="border border-black p-2 text-right">
              {formatCurrency(totalCollectionAmount)}
            </td>
            <td className="border border-black p-2 text-right">
              {formatCurrency(totalPrincipal)}
            </td>
            <td className="border border-black p-2 text-right">
              {formatCurrency(totalInterest)}
            </td>
            <td className="border border-black p-2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PersonalLedgerPrint;
