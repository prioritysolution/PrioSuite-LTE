import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import type { LoanPortfolioData, PortfolioQuery, PortfolioRecord, PortfolioView, PrintColumn } from "./LoanPortfolioType";

const obj = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid portfolio response.");
  return value as Record<string, unknown>;
};
const num = (value: unknown, field = "value"): number => {
  if ((typeof value !== "number" && typeof value !== "string") || (typeof value === "string" && value.trim() === "") || !Number.isFinite(Number(value))) throw new Error(`Invalid portfolio amount or count: ${field}.`);
  return Number(value);
};
const nullableNum = (value: unknown) => value === null ? null : num(value);
const str = (value: unknown) => value == null ? "" : String(value);
const record = (value: unknown): PortfolioRecord => obj(value) as PortfolioRecord;
const fields = ["Active_Loanee_Count", "Period_Disbursement", "Total_Outstanding", "Cumulative_Realisable", "Total_Collection", "Default_Amount", "Closing_Outstanding", "Existing_Disbursement", "Village_Count"];

export const mapLoanPortfolio = (response: unknown, query: PortfolioQuery): LoanPortfolioData => {
  const body = obj(response);
  const details = obj(body.details);
  const summary = record(details.Summary);
  const totals = record(details.Totals);
  const organisation = obj(details.Organisation);
  const rawPage = obj(details.Pagination);
  const view = str(details.View) as PortfolioView;
  if (view !== query.view || !Array.isArray(details.Rows) || !Array.isArray(details.Print_Columns) || !Array.isArray(details.Data_Quality_Warnings)) throw new Error("Incomplete portfolio response.");
  const columns: PrintColumn[] = details.Print_Columns.map((value: unknown) => {
    const col = obj(value);
    return { Number: num(col.Number), Field: str(col.Field), Label: str(col.Label), Group: str(col.Group), Format: str(col.Format) };
  }).sort((a: PrintColumn, b: PrintColumn) => a.Number - b.Number);
  if (columns.length !== 25 || columns.some((col, i) => col.Number !== i + 1 || !col.Field || !col.Label)) throw new Error("The server did not return the complete print columns.");
  for (const col of columns.slice(2)) totals[col.Field] = num(totals[col.Field], `Totals.${col.Field}`);
  const rows = details.Rows.map(record);
  for (const field of fields) { summary[field] = num(summary[field], `Summary.${field}`); totals[field] = num(totals[field], `Totals.${field}`); }
  summary.Collection_Pct = nullableNum(summary.Collection_Pct);
  totals.Collection_Pct = nullableNum(totals.Collection_Pct);
  for (const row of rows) {
    row.Sl_No = num(row.Sl_No, "Rows.Sl_No");
    for (const field of fields) row[field] = num(row[field], `Rows.${field}`);
    row.Collection_Pct = nullableNum(row.Collection_Pct);
    for (const col of columns) {
      if (!(col.Field in row)) throw new Error("A portfolio row is missing a print column.");
      if (col.Number > 2) row[col.Field] = num(row[col.Field], `Rows.${col.Field}`);
    }
  }
  const pagination = {
    current_page: num(rawPage.current_page), per_page: num(rawPage.per_page), total: num(rawPage.total),
    last_page: num(rawPage.last_page), from: nullableNum(rawPage.from), to: nullableNum(rawPage.to),
    has_more_pages: rawPage.has_more_pages,
  };
  if (typeof pagination.has_more_pages !== "boolean" || pagination.current_page !== query.page || pagination.per_page !== query.perPage || pagination.total < 0 || pagination.last_page < 1 || !Number.isInteger(pagination.last_page) || rows.length > pagination.per_page) throw new Error("Invalid portfolio pagination.");
  return { view, query, organisation: { name: str(organisation.Org_Name), address: str(organisation.Org_Address) }, summary, totals, rows, columns, warnings: details.Data_Quality_Warnings.map(str), pagination: { ...pagination, has_more_pages: pagination.has_more_pages } };
};

export const getLoanPortfolio = async (query: PortfolioQuery): Promise<LoanPortfolioData> => {
  const response = await doGetApiCall({ url: endPoints.getLoanPortfolioAnalysis(query) });
  return mapLoanPortfolio(response, query);
};

const stableTotals = (totals: PortfolioRecord) => JSON.stringify(Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)));
export const fetchAllPortfolioRows = async (query: PortfolioQuery, expected: LoanPortfolioData): Promise<LoanPortfolioData> => {
  const first = await getLoanPortfolio({ ...query, page: 1, perPage: 500 });
  if (first.pagination.total !== expected.pagination.total || stableTotals(first.totals) !== stableTotals(expected.totals)) throw new Error("The report changed since it was loaded. Refresh it before exporting.");
  const rows = [...first.rows];
  let current = first;
  while (current.pagination.has_more_pages) {
    const nextPage = current.pagination.current_page + 1;
    if (nextPage > first.pagination.last_page) throw new Error("Invalid export pagination.");
    current = await getLoanPortfolio({ ...query, page: nextPage, perPage: 500 });
    if (current.pagination.total !== first.pagination.total || current.pagination.last_page !== first.pagination.last_page || stableTotals(current.totals) !== stableTotals(first.totals) || current.rows.length === 0) throw new Error("The report changed while exporting. Please try again.");
    rows.push(...current.rows);
  }
  if (rows.length !== first.pagination.total || new Set(rows.map((row) => row.Sl_No)).size !== rows.length) throw new Error("The export did not receive every report row. Please try again.");
  return { ...first, rows };
};

export const portfolioLabel = (row: PortfolioRecord, view: PortfolioView): string => {
  const label = (key: string) => str(row[key]);
  if (view === "branch_summary") return label("Branch_Name") || "Not assigned";
  if (view === "group") return [label("Group_Name") || "Not assigned", label("Group_No"), label("Branch_Name"), label("CO_Name")].filter(Boolean).join(" · ");
  if (view === "village") return [label("Village_Name") || "Not assigned", label("Branch_Name"), label("CO_Name")].filter(Boolean).join(" · ");
  if (view === "member") return [label("Member_Name") || "Not assigned", label("Member_No"), label("Account_No")].filter(Boolean).join(" · ");
  return [label("CO_Name") || "Not assigned", view === "branch" ? label("Branch_Name") : ""].filter(Boolean).join(" · ");
};

export const formatPortfolioValue = (value: unknown, field: string) => {
  if (value === null || value === undefined) return "–";
  if (typeof value !== "number") return String(value);
  if (field.endsWith("_Pct")) return `${value.toFixed(2)}%`;
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: field.endsWith("_Count") || field === "Sl_No" ? 0 : 2, maximumFractionDigits: field.endsWith("_Count") || field === "Sl_No" ? 0 : 2 }).format(value);
};
