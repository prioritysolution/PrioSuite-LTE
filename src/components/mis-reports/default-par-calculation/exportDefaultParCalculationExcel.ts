import { parLabel } from "@/container/mis-reports/default-par-calculation/DefaultParCalculationApi";
import type { DefaultParCalculationData } from "@/container/mis-reports/default-par-calculation/DefaultParCalculationType";

const html = (value: unknown) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const csv = (value: unknown) => {
  if (typeof value === "number") return String(value);
  const raw = String(value ?? ""); const safe = /^[\s]*[=+@\-\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
};
const download = (content: string, type: string, filename: string) => { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); };
const filename = (report: DefaultParCalculationData, extension: string) => `default-par-${report.view}-${report.query.fromDate}-${report.query.toDate}.${extension}`;
const extraFields = (report: DefaultParCalculationData) => report.view === "member" ? [["Oldest_Due_Date", "Oldest unpaid due"], ["Days_Overdue", "Days overdue"], ["Aging_Bucket", "Aging bucket"]] : [["Oldest_Unpaid_Due_Date", "Oldest unpaid due"], ["Max_Days_Overdue", "Maximum days overdue"]];

export const exportDefaultParCalculationCsv = (report: DefaultParCalculationData) => {
  const extra = extraFields(report);
  const rows: unknown[][] = [
    [report.organisation.name], [report.organisation.address], ["Default PAR Calculation"],
    ["Branch", report.summary.Branch_Name, "Branch code", report.summary.Branch_Code, "Period", report.summary.Month_Name, "From", report.query.fromDate, "To", report.query.toDate, "As of", report.calculation.asOf, "View", report.view],
    ["PAR basis", "Full outstanding of loans more than 30 days overdue; outstanding includes principal and contractual interest"],
    ...report.warnings.map((warning) => ["Data quality warning", warning]),
    ["Grouping", ...report.columns.map((col) => `${col.Number}. ${col.Label}`), ...extra.map(([, label]) => label)],
    ...report.rows.map((row) => [parLabel(row, report.view), ...report.columns.map((col) => row[col.Field] ?? (col.Field.endsWith("_Pct") ? "N/A" : "")), ...extra.map(([field]) => row[field])]),
    ["Total", ...report.columns.map((col) => col.Number <= 2 ? "" : report.totals[col.Field] ?? (col.Field.endsWith("_Pct") ? "N/A" : ""))],
    [], ["Aging bucket", "Included in PAR", "Outstanding", "Overdue installments", "Loan accounts"],
    ...report.buckets.map((bucket) => [bucket.Label, bucket.Included_In_PAR ? "Yes" : bucket.Code === "Unknown" ? "Unclassified" : "No", report.totals[bucket.Outstanding_Field], report.totals[bucket.Overdue_Field], report.totals[bucket.Loan_Count_Field]]),
  ];
  download(`\uFEFF${rows.map((row) => row.map(csv).join(",")).join("\r\n")}`, "text/csv;charset=utf-8", filename(report, "csv"));
};

export const exportDefaultParCalculationExcel = (report: DefaultParCalculationData) => {
  const extra = extraFields(report); const span = report.columns.length + extra.length + 1;
  const cell = (value: unknown) => typeof value === "number" ? `<td style="mso-number-format:'0.00';text-align:right">${value}</td>` : `<td>${html(value)}</td>`;
  const content = `<html><head><meta charset="UTF-8"><style>table{border-collapse:collapse;font-family:Arial;font-size:10px}td,th{border:1px solid #777;padding:4px}th{background:#e2e8f0}</style></head><body><table>
    <tr><th colspan="${span}">${html(report.organisation.name)}</th></tr><tr><td colspan="${span}">${html(report.organisation.address)}</td></tr>
    <tr><th colspan="${span}">Default PAR Calculation · ${html(report.summary.Branch_Name)} ${html(report.summary.Branch_Code)} · ${html(report.summary.Month_Name)} · ${html(report.query.fromDate)} to ${html(report.query.toDate)} · as of ${html(report.calculation.asOf)} · ${html(report.view)}</th></tr>
    <tr><td colspan="${span}">PAR &gt;30 days is full outstanding of affected loans; overdue is unpaid installments. Outstanding includes principal and contractual interest.</td></tr>
    ${report.warnings.map((warning) => `<tr><td colspan="${span}">${html(warning)}</td></tr>`).join("")}
    <tr><th>Grouping</th>${report.columns.map((col) => `<th>${col.Number}. ${html(col.Label)}</th>`).join("")}${extra.map(([, label]) => `<th>${html(label)}</th>`).join("")}</tr>
    ${report.rows.map((row) => `<tr>${cell(parLabel(row, report.view))}${report.columns.map((col) => cell(row[col.Field] ?? (col.Field.endsWith("_Pct") ? "N/A" : ""))).join("")}${extra.map(([field]) => cell(row[field])).join("")}</tr>`).join("")}
    <tr><th>Total</th>${report.columns.map((col) => cell(col.Number <= 2 ? "" : report.totals[col.Field] ?? (col.Field.endsWith("_Pct") ? "N/A" : ""))).join("")}${extra.map(() => "<td></td>").join("")}</tr>
    <tr><th>Bucket</th><th>Included in PAR</th><th>Outstanding</th><th>Overdue installments</th><th>Loan accounts</th></tr>
    ${report.buckets.map((bucket) => `<tr>${cell(bucket.Label)}${cell(bucket.Included_In_PAR ? "Yes" : bucket.Code === "Unknown" ? "Unclassified" : "No")}${cell(report.totals[bucket.Outstanding_Field])}${cell(report.totals[bucket.Overdue_Field])}${cell(report.totals[bucket.Loan_Count_Field])}</tr>`).join("")}
    </table></body></html>`;
  download(content, "application/vnd.ms-excel;charset=utf-8", filename(report, "xls"));
};
