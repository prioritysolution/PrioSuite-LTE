import React, { useEffect, useState } from "react";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";

interface DetailedListPrintProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  mappedList: any[];
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branchName: string;
  branchAddress?: string;
  schemeName?: string;
}

const COLS = 12;

const DetailedListPrint = ({
  printRef,
  mappedList,
  fromDate,
  toDate,
  branchName,
  branchAddress = "",
  schemeName = "",
}: DetailedListPrintProps) => {
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrgName(getCookieData("priobank-lite-org_name") || "");
    }
  }, []);

  const displayAddress = (branchAddress || "").trim();

  const totalOpeningBalance = mappedList.reduce(
    (acc, row) => acc + (Number(row.openingBalance) || 0),
    0,
  );
  const totalIssueAmount = mappedList.reduce(
    (acc, row) => acc + (Number(row.issueAmount) || 0),
    0,
  );
  const totalRepayPrincipal = mappedList.reduce(
    (acc, row) => acc + (Number(row.repayPrincipal) || 0),
    0,
  );
  const totalRepayInterest = mappedList.reduce(
    (acc, row) => acc + (Number(row.repayInterest) || 0),
    0,
  );
  const totalReceivableInterest = mappedList.reduce(
    (acc, row) => acc + (Number(row.receivableInterest) || 0),
    0,
  );
  const totalLoanAmount = mappedList.reduce(
    (acc, row) => acc + (Number(row.loanAmount) || 0),
    0,
  );
  const totalRealisableAmount = mappedList.reduce(
    (acc, row) => acc + (Number(row.realizableAmount) || 0),
    0,
  );
  const totalOutstandingBalance = mappedList.reduce(
    (acc, row) => acc + (Number(row.outstandingBalance) || 0),
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

  return (
    <div
      ref={printRef}
      className="hidden print:block w-[297mm] mx-auto p-4 text-black bg-white text-[10px] print-area"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
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

      <table className="w-full border-collapse text-center text-[10px]">
        <thead>
          <tr style={{ border: "none" }}>
            <td
              colSpan={COLS}
              style={{ border: "none" }}
              className="font-bold text-xl tracking-wider uppercase text-black py-0.5"
            >
              {orgName}
            </td>
          </tr>
          <tr style={{ border: "none" }}>
            <td
              colSpan={COLS}
              style={{ border: "none" }}
              className="font-semibold text-sm uppercase text-slate-700 py-0.5"
            >
              {branchName}
            </td>
          </tr>
          {displayAddress ? (
            <tr style={{ border: "none" }}>
              <td
                colSpan={COLS}
                style={{ border: "none" }}
                className="text-[12px] font-medium text-slate-700 py-0.5 leading-relaxed"
              >
                {displayAddress}
              </td>
            </tr>
          ) : null}
          <tr style={{ border: "none" }}>
            <td
              colSpan={COLS}
              style={{ border: "none" }}
              className="font-bold text-md tracking-widest underline uppercase text-black pt-2 pb-3"
            >
              DETAILED LIST
            </td>
          </tr>

          <tr
            className="bg-slate-50/40 text-[12px]"
            style={{ border: "1px solid black" }}
          >
            <td
              colSpan={4}
              className="p-2.5 text-left"
              style={{
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                borderTop: "1px solid black",
                borderLeft: "1px solid black",
              }}
            >
              <div className="pb-1">
                <span className="font-bold text-black">Branch Name:</span>{" "}
                <span className="font-medium text-slate-800">
                  {branchName || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-bold text-black">Scheme:</span>{" "}
                <span className="font-medium text-slate-800">
                  {schemeName || "N/A"}
                </span>
              </div>
            </td>
            <td
              colSpan={8}
              className="p-2.5 text-right"
              style={{
                borderBottom: "1px solid black",
                borderTop: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              <span className="font-bold text-black">Date Range:</span>{" "}
              <span className="font-medium text-slate-800">
                {fromDate ? formatDateStr(fromDate) : "Beginning"} to{" "}
                {toDate ? formatDateStr(toDate) : "End"}
              </span>
            </td>
          </tr>

          <tr style={{ border: "none" }}>
            <td colSpan={COLS} style={{ border: "none", height: "12px" }}></td>
          </tr>

          <tr className="bg-slate-100 font-bold border-b border-black">
            <th className="border border-black p-1.5 w-[32px]">Sl.</th>
            <th className="border border-black p-1.5 text-left">Group</th>
            <th className="border border-black p-1.5 text-left">Member</th>
            <th className="border border-black p-1.5">Loan Date</th>
            <th className="border border-black p-1.5 text-right">Opening Bal.</th>
            <th className="border border-black p-1.5 text-right">Issue</th>
            <th className="border border-black p-1.5 text-right">Repay Prn.</th>
            <th className="border border-black p-1.5 text-right">Repay Intt.</th>
            <th className="border border-black p-1.5 text-right">Recv. Intt.</th>
            <th className="border border-black p-1.5 text-right">Loan Amt</th>
            <th className="border border-black p-1.5 text-right">Realisable</th>
            <th className="border border-black p-1.5 text-right">Outs. Bal.</th>
          </tr>
        </thead>
        <tbody>
          {mappedList.map((row) => (
            <tr key={row.sl} className="border-b border-black">
              <td className="border border-black p-1.5">{row.sl}</td>
              <td className="border border-black p-1.5 text-left">
                {row.groupName}
              </td>
              <td className="border border-black p-1.5 text-left">
                {row.memberName}
              </td>
              <td className="border border-black p-1.5">
                {formatDateStr(row.loanDate)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.openingBalance)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.issueAmount)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.repayPrincipal)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.repayInterest)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.receivableInterest)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.loanAmount)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.realizableAmount)}
              </td>
              <td className="border border-black p-1.5 text-right">
                {formatCurrency(row.outstandingBalance)}
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-slate-50 border-t border-black">
            <td colSpan={4} className="border border-black p-1.5 text-right">
              Total
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalOpeningBalance)}
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalIssueAmount)}
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalRepayPrincipal)}
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalRepayInterest)}
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalReceivableInterest)}
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalLoanAmount)}
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalRealisableAmount)}
            </td>
            <td className="border border-black p-1.5 text-right">
              {formatCurrency(totalOutstandingBalance)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DetailedListPrint;
