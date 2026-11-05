"use client";

import React from "react";
import type {
  MonthReportGroup,
  ReceiptPaymentScrollData,
} from "@/container/mis-reports/receipt-payment-scroll/ReceiptPaymentScrollType";

interface ReceiptPaymentScrollPrintProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  report: ReceiptPaymentScrollData | null;
}

const fmt = (val: number | undefined | null) => {
  if (!val || val === 0) return "";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(val);
};

const fmtTotal = (val: number | undefined | null) => {
  if (!val || val === 0) return "-";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(val);
};

const scrollColors = {
  dateHeader: "#FFFFFF",
  receiptLoanHeader: "#FFFFFF",
  receiptLoanSub: "#FFFFFF",
  receiptLoanTotal: "#FFFFFF",
  procHeader: "#FFFFFF",
  procTotal: "#FFFFFF",
  hoRecHeader: "#FFFFFF",
  hoRecTotal: "#FFFFFF",
  miscRecHeader: "#FFFFFF",
  miscRecTotal: "#FFFFFF",
  receiptTotalHeader: "#FFFFFF",
  receiptTotalFinal: "#FFFFFF",
  paymentHeader: "#FFFFFF",
  paymentSub: "#FFFFFF",
  paymentColTotal: "#FFFFFF",
  paymentTotalFinal: "#FFFFFF",
  cashHeader: "#FFFFFF",
  cashTotal: "#FFFFFF",
};

const ReceiptPaymentScrollPrint = ({ printRef, report }: ReceiptPaymentScrollPrintProps) => {
  if (!report) return null;
  const { summary, monthGroups, dailyRows, totals } = report;

  const groupsToRender: MonthReportGroup[] =
    monthGroups && monthGroups.length > 0
      ? monthGroups
      : [
          {
            monthKey: `${summary.year}-${summary.monthName}`,
            monthName: summary.monthName,
            year: summary.year,
            daysCount: dailyRows.length || 31,
            days: dailyRows,
            totals,
          },
        ];

  return (
    <div ref={printRef} className="hidden print:block bg-white text-black p-0 m-0 w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
          }
          @page {
            size: A4 landscape;
            margin: 4mm 5mm 5mm 5mm;
          }
          .month-sheet-page {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box;
            page-break-after: always !important;
            break-after: page !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .month-sheet-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .scroll-print-table {
            width: 100%;
            border-collapse: collapse !important;
            font-size: 8px !important;
            line-height: 1.1;
            page-break-inside: auto;
          }
          .scroll-print-table th,
          .scroll-print-table td {
            border: 1px solid #000 !important;
            padding: 1.5px 2px !important;
            box-sizing: border-box;
          }
          .month-sheet-page * {
            color: #000 !important;
          }
          .scroll-print-table,
          .scroll-print-table thead,
          .scroll-print-table tbody,
          .scroll-print-table tfoot,
          .scroll-print-table tr,
          .scroll-print-table th,
          .scroll-print-table td {
            background: #fff !important;
          }
          .scroll-print-table thead {
            display: table-header-group;
          }
          .scroll-print-table tfoot {
            display: table-footer-group;
          }
          .scroll-print-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `,
        }}
      />

      {groupsToRender.map((group, groupIdx) => (
        <div
          key={group.monthKey}
          className="month-sheet-page font-sans text-black"
          style={{
            pageBreakAfter: groupIdx < groupsToRender.length - 1 ? "always" : "auto",
            breakAfter: groupIdx < groupsToRender.length - 1 ? "page" : "auto",
            marginBottom: groupIdx < groupsToRender.length - 1 ? "24px" : "0",
          }}
        >
          {/* Top Header Block matching the physical ledger sheet */}
          <div className="mb-2 flex items-start justify-between border-b-2 border-black pb-2">
            {/* Top Left */}
            <div className="w-[52%] space-y-1">
              <h2 className="text-[13px] font-bold tracking-tight text-black">
                Receipt and Payments Scroll of the branch
              </h2>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="font-bold">BRANCH CODE</span>
                <span className="inline-block border border-black px-2 py-0.5 text-center font-bold tracking-wider">
                  {summary.branchCode || "01"}
                </span>
                <span className="ml-2 font-bold">Branch Name:</span>
                <span className="border-b border-dotted border-black px-2 font-semibold">
                  {summary.branchName}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="font-bold">Manager/C.O. Name:</span>
                <span className="border-b border-dotted border-black px-2 font-semibold">
                  {summary.managerCoName}
                </span>
              </div>
            </div>

            {/* Top Right */}
            <div className="w-[48%] text-right space-y-0.5">
              <h1 className="text-[15px] font-black uppercase tracking-wider text-black">
                {summary.companyName || "SWANIRVAR FINANCE COMPANY Pvt. Ltd."}
              </h1>
              <p className="text-[10px] text-gray-800">
                Corporate Office: {summary.corporateOffice || "4 no. ward , Panskura, Purba Medinipur"}
              </p>
              <p className="text-[11px] font-medium pt-0.5">
                For The Month of:{" "}
                <span className="border-b border-dotted border-black px-2 font-bold underline">
                  {group.monthName}
                </span>{" "}
                <span className="font-bold">{group.year}</span>
              </p>
            </div>
          </div>

          {/* Ledger Table with distinct light section colors */}
          <table className="scroll-print-table">
            <thead>
              {/* Header Row 1 */}
              <tr className="font-bold text-center">
                <th
                  rowSpan={2}
                  style={{ backgroundColor: scrollColors.dateHeader }}
                  className="w-[32px] text-center font-bold"
                >
                  Date
                </th>
                <th
                  colSpan={2}
                  style={{ backgroundColor: scrollColors.receiptLoanHeader }}
                  className="text-center font-bold"
                >
                  Loan
                </th>
                <th
                  rowSpan={2}
                  style={{ backgroundColor: scrollColors.procHeader }}
                  className="w-[48px] text-center font-bold leading-tight"
                >
                  Proce. Charge
                </th>
                <th
                  rowSpan={2}
                  style={{ backgroundColor: scrollColors.hoRecHeader }}
                  className="w-[38px] text-center font-bold"
                >
                  H.O.
                </th>
                <th
                  rowSpan={2}
                  style={{ backgroundColor: scrollColors.miscRecHeader }}
                  className="w-[38px] text-center font-bold"
                >
                  Misc.
                </th>
                <th
                  rowSpan={2}
                  style={{ backgroundColor: scrollColors.receiptTotalHeader }}
                  className="w-[54px] text-center font-bold"
                >
                  TOTAL
                </th>
                <th
                  colSpan={9}
                  style={{ backgroundColor: scrollColors.paymentHeader }}
                  className="text-center font-black tracking-widest"
                >
                  PAYMENTS
                </th>
                <th
                  rowSpan={2}
                  style={{ backgroundColor: scrollColors.cashHeader }}
                  className="w-[56px] text-center font-bold leading-tight"
                >
                  Cash in Hand
                </th>
              </tr>
              {/* Header Row 2 */}
              <tr className="font-semibold text-center text-[8px]">
                <th style={{ backgroundColor: scrollColors.receiptLoanSub }} className="w-[48px] text-right font-bold">
                  Principal
                </th>
                <th style={{ backgroundColor: scrollColors.receiptLoanSub }} className="w-[42px] text-right font-bold">
                  Interest
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[48px] text-right font-bold">
                  Loan
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[42px] text-right font-bold">
                  Houserent
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[42px] text-right font-bold">
                  Electric Bill
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[42px] text-right font-bold">
                  Salary
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[40px] text-right font-bold">
                  Travelling
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[42px] text-right font-bold">
                  Loan loss
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[42px] text-right font-bold">
                  H.O.
                </th>
                <th style={{ backgroundColor: scrollColors.paymentSub }} className="w-[44px] text-right font-bold">
                  Miscellenious
                </th>
                <th style={{ backgroundColor: scrollColors.paymentColTotal }} className="w-[54px] text-right font-bold">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {group.days.map((row) => {
                const hasActivity = row.receiptTotal > 0 || row.paymentTotal > 0;
                return (
                  <tr key={`${group.monthKey}-${row.day}`} className="text-black bg-white">
                    <td className="text-center font-bold">{row.day}</td>
                    <td className="text-right">{fmt(row.loanPrincipal)}</td>
                    <td className="text-right">{fmt(row.loanInterest)}</td>
                    <td className="text-right">{fmt(row.proceCharge)}</td>
                    <td className="text-right">{fmt(row.hoReceipt)}</td>
                    <td className="text-right">{fmt(row.miscReceipt)}</td>
                    <td className="text-right font-bold" style={{ backgroundColor: "#FFFFFF" }}>
                      {fmt(row.receiptTotal)}
                    </td>
                    <td className="text-right">{fmt(row.loanPayment)}</td>
                    <td className="text-right">{fmt(row.houserent)}</td>
                    <td className="text-right">{fmt(row.electricBill)}</td>
                    <td className="text-right">{fmt(row.salary)}</td>
                    <td className="text-right">{fmt(row.travelling)}</td>
                    <td className="text-right">{fmt(row.loanLoss)}</td>
                    <td className="text-right">{fmt(row.hoPayment)}</td>
                    <td className="text-right">{fmt(row.miscPayment)}</td>
                    <td className="text-right font-bold" style={{ backgroundColor: "#FFFFFF" }}>
                      {fmt(row.paymentTotal)}
                    </td>
                    <td
                      className="text-right font-semibold"
                      style={{ backgroundColor: "#FFFFFF" }}
                    >
                      {hasActivity ? fmt(row.cashInHand) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {/* Total Row with distinct light background colors per section */}
              <tr className="font-black text-black">
                <td style={{ backgroundColor: scrollColors.dateHeader }} className="text-center font-black">
                  TOTAL:
                </td>
                <td style={{ backgroundColor: scrollColors.receiptLoanTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.loanPrincipal)}
                </td>
                <td style={{ backgroundColor: scrollColors.receiptLoanTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.loanInterest)}
                </td>
                <td style={{ backgroundColor: scrollColors.procTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.proceCharge)}
                </td>
                <td style={{ backgroundColor: scrollColors.hoRecTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.hoReceipt)}
                </td>
                <td style={{ backgroundColor: scrollColors.miscRecTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.miscReceipt)}
                </td>
                <td style={{ backgroundColor: scrollColors.receiptTotalFinal }} className="text-right font-black">
                  {fmtTotal(group.totals.receiptTotal)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.loanPayment)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.houserent)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.electricBill)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.salary)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.travelling)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.loanLoss)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.hoPayment)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentColTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.miscPayment)}
                </td>
                <td style={{ backgroundColor: scrollColors.paymentTotalFinal }} className="text-right font-black">
                  {fmtTotal(group.totals.paymentTotal)}
                </td>
                <td style={{ backgroundColor: scrollColors.cashTotal }} className="text-right font-black">
                  {fmtTotal(group.totals.closingCashInHand)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Bottom Signatures Block matching physical ledger sheet */}
          <div className="mt-5 flex items-end justify-between px-4 text-[11px] font-bold">
            <div className="text-left">
              <div className="h-8 w-44 border-b border-black"></div>
              <p className="mt-1">Signature of the C.O./M.O.</p>
            </div>
            <div className="text-right">
              <div className="h-8 w-44 border-b border-black ml-auto"></div>
              <p className="mt-1">Signature of the Branch Manager</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReceiptPaymentScrollPrint;
