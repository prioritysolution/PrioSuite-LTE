import { portfolioLabel } from "@/container/mis-reports/loan-portfolio/LoanPortfolioApi";
import type { LoanPortfolioData } from "@/container/mis-reports/loan-portfolio/LoanPortfolioType";

const html = (value: unknown) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const csv = (value: unknown) => {
  if (typeof value === "number") return String(value);
  const raw = String(value ?? "");
  const safe = /^[\s]*[=+@\-\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
};
const download = (content: string, type: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
};
const filename = (report: LoanPortfolioData, extension: string) => `loan-portfolio-${report.view}-${report.query.fromDate}-${report.query.toDate}.${extension}`;

export const exportLoanPortfolioCsv = (report: LoanPortfolioData) => {
  const rows: unknown[][] = [
    [report.organisation.name], [report.organisation.address], ["Loan Portfolio Analysis"],
    ["Branch", report.summary.Branch_Name, "Branch code", report.summary.Branch_Code, "Period", report.summary.Month_Name, "From", report.query.fromDate, "To", report.query.toDate, "View", report.view],
    ...report.warnings.map((warning) => ["Data quality warning", warning]),
    ["Grouping", ...report.columns.map((col) => `${col.Number}. ${col.Group ? `${col.Group}: ` : ""}${col.Label}`)],
    ...report.rows.map((row) => [portfolioLabel(row, report.view), ...report.columns.map((col) => row[col.Field])]),
    ["Total", ...report.columns.map((col) => col.Number <= 2 ? "" : report.totals[col.Field])],
  ];
  download(`\uFEFF${rows.map((row) => row.map(csv).join(",")).join("\r\n")}`, "text/csv;charset=utf-8", filename(report, "csv"));
};

export const exportLoanPortfolioExcel = (report: LoanPortfolioData) => {
  const cell = (value: unknown) => typeof value === "number" ? `<td style="mso-number-format:'0.00';text-align:right">${value}</td>` : `<td>${html(value)}</td>`;
  const span = report.columns.length + 1;
  const content = `<html><head><meta charset="UTF-8"><style>table{border-collapse:collapse;font-family:Arial;font-size:10px}td,th{border:1px solid #777;padding:4px}th{background:#e2e8f0}</style></head><body><table>
    <tr><th colspan="${span}">${html(report.organisation.name)}</th></tr><tr><td colspan="${span}">${html(report.organisation.address)}</td></tr>
    <tr><th colspan="${span}">Loan Portfolio Analysis · ${html(report.summary.Branch_Name)} ${html(report.summary.Branch_Code)} · ${html(report.summary.Month_Name)} · ${html(report.query.fromDate)} to ${html(report.query.toDate)} · ${html(report.view)}</th></tr>
    ${report.warnings.map((warning) => `<tr><td colspan="${span}">${html(warning)}</td></tr>`).join("")}
    <tr><th>Grouping</th>${report.columns.map((col) => `<th>${col.Number}. ${html(col.Group ? `${col.Group}: ` : "")}${html(col.Label)}</th>`).join("")}</tr>
    ${report.rows.map((row) => `<tr>${cell(portfolioLabel(row, report.view))}${report.columns.map((col) => cell(row[col.Field])).join("")}</tr>`).join("")}
    <tr><th>Total</th>${report.columns.map((col) => cell(col.Number <= 2 ? "" : report.totals[col.Field])).join("")}</tr>
    </table></body></html>`;
  download(content, "application/vnd.ms-excel;charset=utf-8", filename(report, "xls"));
};
