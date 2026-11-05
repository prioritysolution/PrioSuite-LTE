"use client";

import React from "react";
import type { MonthlyStatementData, StatementSidePairRow } from "@/container/mis-reports/monthly-statement-of-accounts/MonthlyStatementType";

interface MonthlyStatementPrintProps {
  printRef: React.RefObject<HTMLDivElement | null>;
  report: MonthlyStatementData | null;
}

const fmt = (val: number | undefined | null) => {
  if (val === undefined || val === null || val === 0) return "";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const colors = {
  receiptHeader: "#FFFFFF",
  receiptSub: "#FFFFFF",
  paymentHeader: "#FFFFFF",
  paymentSub: "#FFFFFF",
  categoryRow: "#FFFFFF",
  totalRow: "#FFFFFF",
};

export const MonthlyStatementPrint = ({ printRef, report }: MonthlyStatementPrintProps) => {
  if (!report) return null;
  const { summary, pairedRows } = report;

  // Ensure there are at least 24 rows so that receipts and payments align with the physical sheet
  const rowsToRender: StatementSidePairRow[] = [...pairedRows];
  while (rowsToRender.length < 24) {
    rowsToRender.push({});
  }

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
            size: A4 portrait;
            margin: 6mm 6mm 6mm 6mm;
          }
          .stmt-print-wrapper {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          .stmt-print-table {
            width: 100%;
            border-collapse: collapse !important;
            font-size: 8.5px !important;
            line-height: 1.15;
          }
          .stmt-print-table th,
          .stmt-print-table td {
            border: 1px solid #000 !important;
            padding: 2.5px 3px !important;
            box-sizing: border-box;
          }
          .stmt-print-wrapper * {
            color: #000 !important;
          }
          .stmt-print-table,
          .stmt-print-table thead,
          .stmt-print-table tbody,
          .stmt-print-table tfoot,
          .stmt-print-table tr,
          .stmt-print-table th,
          .stmt-print-table td {
            background: #fff !important;
          }
          .stmt-print-table thead {
            display: table-header-group;
          }
          .stmt-print-table tr {
            page-break-inside: avoid;
          }
        }
      `,
        }}
      />

      <div className="stmt-print-wrapper text-black">
        {/* Header Block matching the physical sheet */}
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h1
            style={{
              fontSize: "15px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
              padding: 0,
            }}
          >
            {report.organizationName}
          </h1>
          <h2
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "1px",
              margin: "1px 0",
              padding: 0,
            }}
          >
            {report.organizationAddress}
          </h2>
          <h3
            style={{
              fontSize: "11.5px",
              fontWeight: 800,
              textDecoration: "underline",
              letterSpacing: "0.5px",
              margin: "1px 0 6px 0",
              padding: 0,
            }}
          >
            MONTHLY STATEMENT OF ACCOUNTS
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: "9px",
              fontWeight: 600,
              paddingTop: "2px",
              borderBottom: "1px solid transparent",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <span>Br. Off. Name: </span>
              <span
                style={{
                  fontFamily: "cursive, serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderBottom: "1px dotted #000",
                  padding: "0 6px",
                }}
              >
                {summary.branchName}
              </span>
            </div>

            <div style={{ textAlign: "center" }}>
              <span>Period: </span>
              <span
                style={{
                  fontFamily: "cursive, serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderBottom: "1px dotted #000",
                  padding: "0 6px",
                }}
              >
                {summary.periodText || `${summary.fromDate} to ${summary.toDate}`}
              </span>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontFamily: "cursive, serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderBottom: "1px dotted #000",
                  padding: "0 4px",
                }}
              >
                FY: {report.financialYear.from} – {report.financialYear.to}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Sided Balance Sheet / Statement Table */}
        <table className="stmt-print-table">
          <thead>
            {/* Top Level Headers: RECEIPTS and PAYMENTS */}
            <tr>
              <th
                colSpan={4}
                style={{
                  backgroundColor: colors.receiptHeader,
                  fontSize: "9.5px",
                  fontWeight: 800,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                  padding: "3px",
                  borderRight: "2px solid #000",
                }}
              >
                RECEIPTS
              </th>
              <th
                colSpan={4}
                style={{
                  backgroundColor: colors.paymentHeader,
                  fontSize: "9.5px",
                  fontWeight: 800,
                  textAlign: "center",
                  letterSpacing: "0.5px",
                  padding: "3px",
                }}
              >
                PAYMENTS
              </th>
            </tr>

            {/* Sub-headers for each side */}
            <tr style={{ fontSize: "7.5px", fontWeight: 700, textAlign: "center" }}>
              <th style={{ backgroundColor: colors.receiptSub, width: "24%", textAlign: "left" }}>
                Particulars
              </th>
              <th style={{ backgroundColor: colors.receiptSub, width: "9%" }}>
                Up to Previous<br />Period Rs
              </th>
              <th style={{ backgroundColor: colors.receiptSub, width: "9%" }}>
                This Period<br />Rs
              </th>
              <th style={{ backgroundColor: colors.receiptSub, width: "8%", borderRight: "2px solid #000" }}>
                Cumulative<br />Rs
              </th>

              <th style={{ backgroundColor: colors.paymentSub, width: "24%", textAlign: "left" }}>
                Particulars
              </th>
              <th style={{ backgroundColor: colors.paymentSub, width: "9%" }}>
                Up to Previous<br />Period Rs
              </th>
              <th style={{ backgroundColor: colors.paymentSub, width: "9%" }}>
                This Period<br />Rs
              </th>
              <th style={{ backgroundColor: colors.paymentSub, width: "8%" }}>
                Cumulative<br />Rs
              </th>
            </tr>
          </thead>

          <tbody>
            {rowsToRender.map((pair, idx) => {
              const rec = pair.receipt;
              const pay = pair.payment;

              return (
                <tr key={`pair-${idx}`} style={{ height: "18px" }}>
                  {/* Receipts Particulars */}
                  <td
                    style={{
                      textAlign: "left",
                      fontWeight: rec?.isHeader ? 700 : 400,
                      paddingLeft: rec?.isSubItem ? "12px" : "3px",
                      backgroundColor: rec?.isHeader ? colors.categoryRow : "#FFFFFF",
                      textDecoration: rec?.isHeader ? "underline" : "none",
                    }}
                  >
                    {rec ? rec.label : ""}
                  </td>
                  {/* Receipts Up to Previous */}
                  <td
                    style={{
                      textAlign: "right",
                      backgroundColor: rec?.isHeader ? colors.categoryRow : "#FFFFFF",
                    }}
                  >
                    {rec && !rec.isHeader ? fmt(rec.previousMonth) : ""}
                  </td>
                  {/* Receipts This Month */}
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: rec && rec.currentMonth > 0 ? 600 : 400,
                      fontFamily: rec && rec.currentMonth > 0 ? "cursive, Arial, sans-serif" : "inherit",
                      fontSize: rec && rec.currentMonth > 0 ? "9px" : "8px",
                      backgroundColor: rec?.isHeader ? colors.categoryRow : "#FFFFFF",
                    }}
                  >
                    {rec && !rec.isHeader ? fmt(rec.currentMonth) : ""}
                  </td>
                  {/* Receipts Cumulative */}
                  <td
                    style={{
                      textAlign: "right",
                      borderRight: "2px solid #000",
                      backgroundColor: rec?.isHeader ? colors.categoryRow : "#FFFFFF",
                    }}
                  >
                    {rec && !rec.isHeader ? fmt(rec.cumulative) : ""}
                  </td>

                  {/* Payments Particulars */}
                  <td
                    style={{
                      textAlign: "left",
                      fontWeight: pay?.isHeader ? 700 : 400,
                      paddingLeft: pay?.isSubItem ? "12px" : "3px",
                      backgroundColor: pay?.isHeader ? colors.categoryRow : "#FFFFFF",
                      textDecoration: pay?.isHeader ? "underline" : "none",
                    }}
                  >
                    {pay ? pay.label : ""}
                  </td>
                  {/* Payments Up to Previous */}
                  <td
                    style={{
                      textAlign: "right",
                      backgroundColor: pay?.isHeader ? colors.categoryRow : "#FFFFFF",
                    }}
                  >
                    {pay && !pay.isHeader ? fmt(pay.previousMonth) : ""}
                  </td>
                  {/* Payments This Month */}
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: pay && pay.currentMonth > 0 ? 600 : 400,
                      fontFamily: pay && pay.currentMonth > 0 ? "cursive, Arial, sans-serif" : "inherit",
                      fontSize: pay && pay.currentMonth > 0 ? "9px" : "8px",
                      backgroundColor: pay?.isHeader ? colors.categoryRow : "#FFFFFF",
                    }}
                  >
                    {pay && !pay.isHeader ? fmt(pay.currentMonth) : ""}
                  </td>
                  {/* Payments Cumulative */}
                  <td
                    style={{
                      textAlign: "right",
                      backgroundColor: pay?.isHeader ? colors.categoryRow : "#FFFFFF",
                    }}
                  >
                    {pay && !pay.isHeader ? fmt(pay.cumulative) : ""}
                  </td>
                </tr>
              );
            })}

            {/* TOTAL Row */}
            <tr
              style={{
                backgroundColor: colors.totalRow,
                fontWeight: 800,
                fontSize: "9px",
                borderTop: "2px solid #000",
                borderBottom: "2px solid #000",
              }}
            >
              <td style={{ textAlign: "center", letterSpacing: "1px", backgroundColor: colors.totalRow }}>
                TOTAL
              </td>
              <td style={{ textAlign: "right", backgroundColor: colors.totalRow }}>
                {fmt(summary.totalReceiptsPrevious)}
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontFamily: "cursive, Arial, sans-serif",
                  fontSize: "11px",
                  fontWeight: 800,
                  backgroundColor: colors.totalRow,
                }}
              >
                {fmt(summary.totalReceiptsCurrent)}
              </td>
              <td
                style={{
                  textAlign: "right",
                  borderRight: "2px solid #000",
                  backgroundColor: colors.totalRow,
                }}
              >
                {fmt(summary.totalReceiptsCumulative)}
              </td>

              <td style={{ textAlign: "center", letterSpacing: "1px", backgroundColor: colors.totalRow }}>
                TOTAL
              </td>
              <td style={{ textAlign: "right", backgroundColor: colors.totalRow }}>
                {fmt(summary.totalPaymentsPrevious)}
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontFamily: "cursive, Arial, sans-serif",
                  fontSize: "11px",
                  fontWeight: 800,
                  backgroundColor: colors.totalRow,
                }}
              >
                {fmt(summary.totalPaymentsCurrent)}
              </td>
              <td style={{ textAlign: "right", backgroundColor: colors.totalRow }}>
                {fmt(summary.totalPaymentsCumulative)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "8px", fontSize: "9px" }}>
          <p>Status: {summary.status} · Difference: {fmt(summary.reconciliationDifference) || "0.00"}</p>
          {report.warnings.map((warning, index) => <p key={index}>{warning}</p>)}
        </div>

        {/* Bottom Signatures Block matching the physical sheet */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "24px",
            paddingTop: "6px",
            fontSize: "10px",
            fontWeight: 700,
          }}
        >
          <div style={{ textAlign: "left", minWidth: "220px" }}>
            <p style={{ margin: 0, padding: 0 }}>Signature of the Manager:</p>
            <p
              style={{
                fontFamily: "cursive, serif",
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
                margin: "12px 0 0 20px",
                padding: 0,
              }}
            >
              {summary.managerName || ""}
            </p>
          </div>

          <div style={{ textAlign: "right", minWidth: "220px" }}>
            <p style={{ margin: 0, padding: 0 }}>Checked by Accountant:</p>
            <div
              style={{
                height: "28px",
                borderBottom: "1px dotted #000",
                width: "180px",
                marginLeft: "auto",
                marginTop: "4px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatementPrint;

