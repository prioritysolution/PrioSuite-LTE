"use client";

import type { RefObject } from "react";
import type { LoanPortfolioData } from "@/container/mis-reports/loan-portfolio/LoanPortfolioType";
import { formatPortfolioValue, portfolioLabel } from "@/container/mis-reports/loan-portfolio/LoanPortfolioApi";

const LoanPortfolioPrint = ({ printRef, report }: { printRef: RefObject<HTMLDivElement | null>; report: LoanPortfolioData | null }) => {
  if (!report) return null;
  return (
    <div
      ref={printRef}
      className="hidden print:block portfolio-print-root"
      style={{ color: "black", fontFamily: "Arial, sans-serif" }}
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 5mm;
        }
        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
            color: #000 !important;
          }
          .portfolio-print-root {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .portfolio-print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 6px !important;
            line-height: 1.15;
            table-layout: fixed;
            margin: 4px 0 !important;
          }
          .portfolio-print-table th,
          .portfolio-print-table td {
            border: 1px solid #555 !important;
            padding: 1.5px 2px !important;
            overflow-wrap: anywhere;
            box-sizing: border-box;
          }
          .portfolio-print-table thead {
            display: table-header-group;
          }
          .portfolio-print-table tfoot {
            display: table-footer-group;
          }
          .portfolio-print-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
      <h2 style={{ textAlign: "center", margin: "2px 0", fontSize: "14px", fontWeight: "bold" }}>
        {report.organisation.name}
      </h2>
      <p style={{ textAlign: "center", margin: "1px 0", fontSize: "10px" }}>
        {report.organisation.address}
      </p>
      <h3 style={{ textAlign: "center", margin: "3px 0", fontSize: "12px", fontWeight: "bold" }}>
        Loan Portfolio Analysis
      </h3>
      <p style={{ margin: "2px 0", fontSize: "9px" }}>
        Branch: {String(report.summary.Branch_Name ?? "")}{" "}
        {report.summary.Branch_Code ? `(${report.summary.Branch_Code})` : ""} ·{" "}
        {String(report.summary.Month_Name ?? "")} · Period: {report.query.fromDate} to {report.query.toDate} · View:{" "}
        {report.view}
      </p>
      {report.warnings.map((warning, index) => (
        <p key={index} style={{ margin: "1px 0", fontSize: "8.5px" }}>
          {warning}
        </p>
      ))}
      <table className="portfolio-print-table">
        <thead>
          <tr>
            <th>Grouping</th>
            {report.columns.map((col) => (
              <th key={col.Field}>
                {col.Number}. {col.Group ? `${col.Group}: ` : ""}
                {col.Label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row, index) => (
            <tr key={`${row.Sl_No}-${index}`}>
              <td>{portfolioLabel(row, report.view)}</td>
              {report.columns.map((col) => (
                <td key={col.Field} style={{ textAlign: col.Number > 2 ? "right" : "left" }}>
                  {formatPortfolioValue(row[col.Field], col.Field)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            {report.columns.map((col) => (
              <th key={col.Field}>
                {col.Number <= 2 ? "" : formatPortfolioValue(report.totals[col.Field], col.Field)}
              </th>
            ))}
          </tr>
        </tfoot>
      </table>
      <p style={{ marginTop: 14, marginBottom: 0, paddingBottom: 0, fontSize: "10px" }}>
        Signature of the Branch Manager: ____________________　　Signature of the MIS Manager: ____________________
      </p>
    </div>
  );
};

export default LoanPortfolioPrint;
