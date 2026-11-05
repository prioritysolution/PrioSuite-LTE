"use client";

import type { RefObject } from "react";
import type { DefaultParCalculationData } from "@/container/mis-reports/default-par-calculation/DefaultParCalculationType";
import { formatParValue, parLabel } from "@/container/mis-reports/default-par-calculation/DefaultParCalculationApi";

const DefaultParCalculationPrint = ({ printRef, report }: { printRef: RefObject<HTMLDivElement | null>; report: DefaultParCalculationData | null }) => {
  if (!report) return null;
  const extra = report.view === "member" ? [["Oldest_Due_Date", "Oldest unpaid due"], ["Days_Overdue", "Days overdue"], ["Aging_Bucket", "Aging bucket"]] : [["Oldest_Unpaid_Due_Date", "Oldest unpaid due"], ["Max_Days_Overdue", "Maximum days overdue"]];
  return <div ref={printRef} className="hidden print:block" style={{ color: "black", fontFamily: "Arial, sans-serif" }}>
    <style>{`@page { size: A3 landscape; margin: 7mm; } @media print { .par-print-table { width: 100%; border-collapse: collapse; font-size: 7px; table-layout: fixed; } .par-print-table th, .par-print-table td { border: 1px solid #555; padding: 3px; overflow-wrap: anywhere; } .par-print-table thead { display: table-header-group; } .par-print-table tr { break-inside: avoid; } }`}</style>
    <h2 style={{ textAlign: "center", margin: 2 }}>{report.organisation.name}</h2><p style={{ textAlign: "center", margin: 2 }}>{report.organisation.address}</p>
    <h3 style={{ textAlign: "center", margin: 4 }}>Default PAR Calculation</h3>
    <p>Branch: {String(report.summary.Branch_Name ?? "")} {report.summary.Branch_Code ? `(${report.summary.Branch_Code})` : ""} · {String(report.summary.Month_Name ?? "")} · {report.query.fromDate} to {report.query.toDate} · As of {report.calculation.asOf} · View: {report.view}</p>
    <p>PAR &gt;30 days is the full outstanding of affected loans; overdue is unpaid installments. Outstanding includes principal and contractual interest.</p>
    {report.warnings.map((warning, index) => <p key={index}>{warning}</p>)}
    <table className="par-print-table"><thead><tr><th>Grouping</th>{report.columns.map((col) => <th key={col.Field}>{col.Number}. {col.Label}</th>)}{extra.map(([field, label]) => <th key={field}>{label}</th>)}</tr></thead>
      <tbody>{report.rows.map((row, index) => <tr key={`${row.Sl_No}-${index}`}><td>{parLabel(row, report.view)}</td>{report.columns.map((col) => <td key={col.Field} style={{ textAlign: col.Number > 2 ? "right" : "left" }}>{formatParValue(row[col.Field], col.Field)}</td>)}{extra.map(([field]) => <td key={field}>{formatParValue(row[field], field)}</td>)}</tr>)}</tbody>
      <tfoot><tr><th>Total</th>{report.columns.map((col) => <th key={col.Field}>{col.Number <= 2 ? "" : formatParValue(report.totals[col.Field], col.Field)}</th>)}{extra.map(([field]) => <th key={field} />)}</tr></tfoot>
    </table>
    <h4>Aging totals</h4><table className="par-print-table"><thead><tr><th>Bucket</th><th>Included in PAR</th><th>Outstanding</th><th>Overdue installments</th><th>Loan accounts</th></tr></thead><tbody>{report.buckets.map((bucket) => <tr key={bucket.Code}><td>{bucket.Label}</td><td>{bucket.Included_In_PAR ? "Yes" : bucket.Code === "Unknown" ? "Unclassified" : "No"}</td><td>{formatParValue(report.totals[bucket.Outstanding_Field], bucket.Outstanding_Field)}</td><td>{formatParValue(report.totals[bucket.Overdue_Field], bucket.Overdue_Field)}</td><td>{formatParValue(report.totals[bucket.Loan_Count_Field], bucket.Loan_Count_Field)}</td></tr>)}</tbody></table>
    <p style={{ marginTop: 18 }}>Signature of the Branch Manager: ____________________　　Signature of the MIS Manager: ____________________</p>
  </div>;
};
export default DefaultParCalculationPrint;
