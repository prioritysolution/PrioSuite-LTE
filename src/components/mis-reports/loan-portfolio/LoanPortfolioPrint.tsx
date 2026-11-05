"use client";

import type { RefObject } from "react";
import type { LoanPortfolioData } from "@/container/mis-reports/loan-portfolio/LoanPortfolioType";
import { formatPortfolioValue, portfolioLabel } from "@/container/mis-reports/loan-portfolio/LoanPortfolioApi";

const LoanPortfolioPrint = ({ printRef, report }: { printRef: RefObject<HTMLDivElement | null>; report: LoanPortfolioData | null }) => {
  if (!report) return null;
  return <div ref={printRef} className="hidden print:block" style={{ color: "black", fontFamily: "Arial, sans-serif" }}>
    <style>{`@page { size: A3 landscape; margin: 6mm; } @media print { .portfolio-print-table { width: 100%; border-collapse: collapse; font-size: 6px; table-layout: fixed; } .portfolio-print-table th, .portfolio-print-table td { border: 1px solid #555; padding: 2px; overflow-wrap: anywhere; } .portfolio-print-table thead { display: table-header-group; } .portfolio-print-table tr { break-inside: avoid; } }`}</style>
    <h2 style={{ textAlign: "center", margin: 2 }}>{report.organisation.name}</h2>
    <p style={{ textAlign: "center", margin: 2 }}>{report.organisation.address}</p>
    <h3 style={{ textAlign: "center", margin: 4 }}>Loan Portfolio Analysis</h3>
    <p>Branch: {String(report.summary.Branch_Name ?? "")} {report.summary.Branch_Code ? `(${report.summary.Branch_Code})` : ""} · {String(report.summary.Month_Name ?? "")} · Period: {report.query.fromDate} to {report.query.toDate} · View: {report.view}</p>
    {report.warnings.map((warning, index) => <p key={index}>{warning}</p>)}
    <table className="portfolio-print-table">
      <thead><tr><th>Grouping</th>{report.columns.map((col) => <th key={col.Field}>{col.Number}. {col.Group ? `${col.Group}: ` : ""}{col.Label}</th>)}</tr></thead>
      <tbody>{report.rows.map((row, index) => <tr key={`${row.Sl_No}-${index}`}><td>{portfolioLabel(row, report.view)}</td>{report.columns.map((col) => <td key={col.Field} style={{ textAlign: col.Number > 2 ? "right" : "left" }}>{formatPortfolioValue(row[col.Field], col.Field)}</td>)}</tr>)}</tbody>
      <tfoot><tr><th>Total</th>{report.columns.map((col) => <th key={col.Field}>{col.Number <= 2 ? "" : formatPortfolioValue(report.totals[col.Field], col.Field)}</th>)}</tr></tfoot>
    </table>
    <p style={{ marginTop: 18 }}>Signature of the Branch Manager: ____________________　　Signature of the MIS Manager: ____________________</p>
  </div>;
};
export default LoanPortfolioPrint;
