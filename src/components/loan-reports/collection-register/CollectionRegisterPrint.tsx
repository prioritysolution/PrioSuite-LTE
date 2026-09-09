import React, { useEffect, useState } from "react";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";
import { CollectionRegisterRow } from "@/container/loan-reports/collection-register/CollectionRegisterType";

interface CollectionRegisterPrintProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  mappedList: CollectionRegisterRow[];
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branchName: string;
  branchAddress?: string;
}

const CollectionRegisterPrint = ({
  printRef,
  mappedList,
  fromDate,
  toDate,
  branchName,
  branchAddress = "",
}: CollectionRegisterPrintProps) => {
  const [userName, setUserName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(getCookieData("priobank-lite-User_Name") || "");
      setOrgName(getCookieData("priobank-lite-org_name") || "");
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

  const formatDateStr = (dateVal: any) => {
    if (!dateVal) return "-";
    const dateObj = dateVal instanceof Date ? dateVal : new Date(dateVal);
    if (isNaN(dateObj.getTime())) return "-";
    return format(dateObj, "d MMM, yyyy");
  };

  const formatAmount = (value: string | number) => {
    if (value === "" || value === null || value === undefined) return "-";
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const displayAddress = (branchAddress || "").trim();
  const colSpan = 9;

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
              colSpan={colSpan}
              style={{ border: "none" }}
              className="font-bold text-xl tracking-wider uppercase text-black py-0.5"
            >
              {orgName}
            </td>
          </tr>
          <tr style={{ border: "none" }}>
            <td
              colSpan={colSpan}
              style={{ border: "none" }}
              className="font-semibold text-sm uppercase text-slate-700 py-0.5"
            >
              {branchName}
            </td>
          </tr>
          {displayAddress ? (
            <tr style={{ border: "none" }}>
              <td
                colSpan={colSpan}
                style={{ border: "none" }}
                className="text-[12px] font-medium text-slate-700 py-0.5 leading-relaxed"
              >
                {displayAddress}
              </td>
            </tr>
          ) : null}
          <tr style={{ border: "none" }}>
            <td
              colSpan={colSpan}
              style={{ border: "none" }}
              className="font-bold text-md tracking-widest underline uppercase text-black pt-2 pb-3"
            >
              COLLECTION REGISTER
            </td>
          </tr>

          <tr
            className="bg-slate-50/40 text-[13px]"
            style={{ border: "1px solid black" }}
          >
            <td
              colSpan={4}
              className="p-3 text-left"
              style={{
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                borderTop: "1px solid black",
                borderLeft: "1px solid black",
              }}
            >
              <span className="font-bold text-black">Branch Name:</span>{" "}
              <span className="font-medium text-slate-800">
                {branchName || "N/A"}
              </span>
            </td>
            <td
              colSpan={5}
              className="p-3 text-right"
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
            <td
              colSpan={colSpan}
              style={{ border: "none", height: "16px" }}
            ></td>
          </tr>

          <tr className="bg-slate-100 font-bold border-b border-black">
            <th className="border border-black p-2 w-[40px]">Sl.</th>
            <th className="border border-black p-2">Collection Date</th>
            <th className="border border-black p-2 text-left">Group Name</th>
            <th className="border border-black p-2 text-left">Member Name</th>
            <th className="border border-black p-2 text-right">Principal</th>
            <th className="border border-black p-2 text-right">Interest</th>
            <th className="border border-black p-2 text-right">
              Collection Amount
            </th>
            <th className="border border-black p-2 text-right">Outs. Balance</th>
            <th className="border border-black p-2 text-left">Under CO</th>
          </tr>
        </thead>
        <tbody>
          {mappedList.map((row) => (
            <tr key={row.sl} className="border-b border-black">
              <td className="border border-black p-2">{row.sl}</td>
              <td className="border border-black p-2">
                {formatDateStr(row.issueDate)}
              </td>
              <td className="border border-black p-2 text-left">
                {row.groupName || "-"}
              </td>
              <td className="border border-black p-2 text-left">
                {row.memberName || "-"}
              </td>
              <td className="border border-black p-2 text-right">
                {formatAmount(row.principal)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatAmount(row.interest)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatAmount(row.collectionAmount)}
              </td>
              <td className="border border-black p-2 text-right">
                {formatAmount(row.outstandingBalance)}
              </td>
              <td className="border border-black p-2 text-left">
                {row.underCo || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between text-[11px] text-slate-600">
        <span>Printed by: {userName || "-"}</span>
        <span>
          {currentDate} {currentTime}
        </span>
      </div>
    </div>
  );
};

export default CollectionRegisterPrint;
