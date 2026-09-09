import React, { useEffect, useState } from "react";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";
import { CashAccountReportData } from "@/container/financialReports/cashAccount/cashAccountType";

interface CashAccountPrintProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  cashAccountReport: CashAccountReportData | null;
  fromDate: Date | string | null;
  toDate: Date | string | null;
  selectedBranchName: string;
}

const CashAccountPrint = ({
  printRef,
  cashAccountReport,
  fromDate,
  toDate,
  selectedBranchName,
}: CashAccountPrintProps) => {
  const [userName, setUserName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(getCookieData("priobank-lite-User_Name") || "");
      setOrgName(getCookieData("priobank-lite-org_name") || "");
      setBranchName(getCookieData("priobank-lite-branch_name") || "");
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");

    setCurrentDate(`${day}-${month}-${year}`);
    setCurrentTime(`${hoursStr}:${minutes}:${seconds} ${ampm}`);
  }, []);

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
    return format(dateObj, "dd-MM-yyyy");
  };

  if (!cashAccountReport) return null;

  const receipts = cashAccountReport.Receipts || [];
  const payments = cashAccountReport.Payments || [];
  const maxRows = Math.max(receipts.length, payments.length);

  const subTotalReceipts = receipts.reduce(
    (acc, curr) => acc + (curr.Receipt_Amount || 0),
    0,
  );
  const subTotalPayments = payments.reduce(
    (acc, curr) => acc + (curr.Payment_Amount || 0),
    0,
  );

  const openingBalance = cashAccountReport.Opening_Cash_Balance || 0;
  const closingBalance = cashAccountReport.Closing_Cash_Balance || 0;

  const grandTotalReceipts = subTotalReceipts + openingBalance;
  const grandTotalPayments = subTotalPayments + closingBalance;

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
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          caption {
            caption-side: top;
          }
          thead {
            display: table-header-group !important;
          }
          tbody {
            display: table-row-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `,
        }}
      />

      <table className="w-full border-collapse text-center text-xs">
        {/* 1. CAPTION: Header Info (Appears ONCE at the top of the first page) */}
        <caption>
          <div className="text-center mb-3">
            <h1 className="font-bold text-xl tracking-wider uppercase text-black py-0.5">
              {orgName}
            </h1>
            <h2 className="font-semibold text-sm uppercase text-slate-700 py-0.5">
              {branchName}
            </h2>
            <h3 className="font-bold text-md tracking-widest underline uppercase text-black pt-2 pb-3">
              CASH ACCOUNT REPORT
            </h3>
          </div>

          <div className="flex justify-between items-center bg-slate-50/40 text-[13px] border border-black p-3 mb-4 text-left">
            <div>
              <span className="font-bold text-black">Branch Name:</span>{" "}
              <span className="font-medium text-slate-800">
                {selectedBranchName || branchName || "N/A"}
              </span>
            </div>
            <div>
              <span className="font-bold text-black">Date Range:</span>{" "}
              <span className="font-medium text-slate-800">
                {fromDate ? formatDateStr(fromDate) : "Beginning"} to{" "}
                {toDate ? formatDateStr(toDate) : "End"}
              </span>
            </div>
          </div>
        </caption>

        {/* 2. THEAD: Strict Column Headers ONLY (Repeats on EVERY printed page) */}
        <thead>
          <tr className="bg-slate-100 font-bold border border-black">
            <th colSpan={3} className="py-2 text-center border border-black">
              Receipt
            </th>
            <th colSpan={3} className="py-2 text-center border border-black">
              Payment
            </th>
          </tr>

          <tr className="bg-slate-50 font-bold border border-black">
            <th className="py-2 w-12 text-center border border-black">Sl</th>
            <th className="py-2 text-left px-2 border border-black">
              Ledger Name
            </th>
            <th className="py-2 w-32 text-right px-2 border border-black">
              Amount
            </th>
            <th className="py-2 w-12 text-center border border-black">Sl</th>
            <th className="py-2 text-left px-2 border border-black">
              Ledger Name
            </th>
            <th className="py-2 w-32 text-right px-2 border border-black">
              Amount
            </th>
          </tr>
        </thead>

        {/* 3. TBODY: Table Data */}
        <tbody>
          {maxRows === 0 ? (
            <tr className="border border-black">
              <td
                colSpan={6}
                className="py-6 text-center text-slate-400 font-medium border border-black"
              >
                No receipts or payments found for this period.
              </td>
            </tr>
          ) : (
            Array.from({ length: maxRows }).map((_, index) => {
              const receipt = receipts[index];
              const payment = payments[index];

              return (
                <tr key={index} className="border border-black">
                  {/* Receipt */}
                  <td className="py-2 text-center font-mono text-xs border border-black">
                    {receipt ? index + 1 : ""}
                  </td>
                  <td className="py-2 text-left px-2 text-slate-800 border border-black">
                    {receipt ? receipt.Receipt_Ledger_Name : ""}
                  </td>
                  <td className="py-2 text-right px-2 font-mono font-medium border border-black">
                    {receipt ? formatCurrency(receipt.Receipt_Amount) : ""}
                  </td>

                  {/* Payment */}
                  <td className="py-2 text-center font-mono text-xs border border-black">
                    {payment ? index + 1 : ""}
                  </td>
                  <td className="py-2 text-left px-2 text-slate-800 border border-black">
                    {payment ? payment.Payment_Ledger_Name : ""}
                  </td>
                  <td className="py-2 text-right px-2 font-mono font-medium border border-black">
                    {payment ? formatCurrency(payment.Payment_Amount) : ""}
                  </td>
                </tr>
              );
            })
          )}

          {/* Sub Total Row */}
          <tr className="bg-slate-50 font-bold border border-black">
            <td
              colSpan={2}
              className="py-2 text-right px-2 border border-black"
            >
              Sub Total
            </td>
            <td className="py-2 text-right px-2 font-mono border border-black">
              {formatCurrency(subTotalReceipts)}
            </td>
            <td
              colSpan={2}
              className="py-2 text-right px-2 border border-black"
            >
              Sub Total
            </td>
            <td className="py-2 text-right px-2 font-mono border border-black">
              {formatCurrency(subTotalPayments)}
            </td>
          </tr>

          {/* Opening / Closing Balance Row */}
          <tr className="border border-black">
            <td
              colSpan={2}
              className="py-2 text-right px-2 font-medium text-slate-600 border border-black"
            >
              Opening Balance
            </td>
            <td className="py-2 text-right px-2 font-mono text-slate-700 border border-black">
              {formatCurrency(openingBalance)}
            </td>
            <td
              colSpan={2}
              className="py-2 text-right px-2 font-medium text-slate-600 border border-black"
            >
              Closing Balance
            </td>
            <td className="py-2 text-right px-2 font-mono text-slate-700 border border-black">
              {formatCurrency(closingBalance)}
            </td>
          </tr>

          {/* Grand Total Row */}
          <tr className="bg-slate-100 text-black font-extrabold border border-black">
            <td
              colSpan={2}
              className="py-2 text-right px-2 uppercase tracking-wide text-xs border border-black"
            >
              Grand Total
            </td>
            <td className="py-2 text-right px-2 font-mono text-sm border border-black">
              {formatCurrency(grandTotalReceipts)}
            </td>
            <td
              colSpan={2}
              className="py-2 text-right px-2 uppercase tracking-wide text-xs border border-black"
            >
              Grand Total
            </td>
            <td className="py-2 text-right px-2 font-mono text-sm border border-black">
              {formatCurrency(grandTotalPayments)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CashAccountPrint;
