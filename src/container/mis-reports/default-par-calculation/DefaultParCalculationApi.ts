import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import { portfolioLabel } from "@/container/mis-reports/loan-portfolio/LoanPortfolioApi";
import type { DefaultParCalculationData, ParAgingBucket, ParPrintColumn, ParQuery, ParRecord, ParView } from "./DefaultParCalculationType";

const obj = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid PAR response.");
  return value as Record<string, unknown>;
};
const num = (value: unknown, field = "value") => {
  if ((typeof value !== "number" && typeof value !== "string") || (typeof value === "string" && value.trim() === "") || !Number.isFinite(Number(value))) throw new Error(`Invalid PAR amount or count: ${field}.`);
  return Number(value);
};
const optionalNum = (value: unknown, field = "value") => value === null ? null : num(value, field);
const str = (value: unknown) => value == null ? "" : String(value);
const record = (value: unknown): ParRecord => ({ ...obj(value) } as ParRecord);
const metrics = ["Borrower_Count", "Loan_Amount", "Outstanding", "Overdue_Amount", "PAR_Amount", "Village_Count", "Loan_Count", "Outstanding_1_30", "Outstanding_31_60", "Outstanding_61_90", "Outstanding_91_180", "Outstanding_181_364", "Outstanding_365_Plus"];

export const mapDefaultParCalculation = (response: unknown, query: ParQuery): DefaultParCalculationData => {
  const body = obj(response); const details = obj(body.details); const summary = record(details.Summary); const totals = record(details.Totals);
  const organisation = obj(details.Organisation); const rawPage = obj(details.Pagination); const calc = obj(details.Calculation);
  const view = str(details.View) as ParView;
  if (view !== query.view || !Array.isArray(details.Rows) || !Array.isArray(details.Print_Columns) || !Array.isArray(details.Aging_Buckets) || !Array.isArray(details.Data_Quality_Warnings)) throw new Error("Incomplete PAR response.");
  const columns: ParPrintColumn[] = details.Print_Columns.map((item: unknown) => { const col = obj(item); return { Number: num(col.Number), Field: str(col.Field), Label: str(col.Label), Format: str(col.Format) }; }).sort((a: ParPrintColumn, b: ParPrintColumn) => a.Number - b.Number);
  if (columns.length !== 14 || columns.some((col, i) => col.Number !== i + 1 || !col.Field || !col.Label)) throw new Error("The server did not return the complete PAR report columns.");
  const buckets: ParAgingBucket[] = details.Aging_Buckets.map((item: unknown) => {
    const bucket = obj(item);
    if (typeof bucket.Included_In_PAR !== "boolean") throw new Error("Invalid PAR aging metadata.");
    return { Code: str(bucket.Code), Label: str(bucket.Label), Min_Days: optionalNum(bucket.Min_Days), Max_Days: optionalNum(bucket.Max_Days), Included_In_PAR: bucket.Included_In_PAR, Outstanding_Field: str(bucket.Outstanding_Field), Overdue_Field: str(bucket.Overdue_Field), Loan_Count_Field: str(bucket.Loan_Count_Field) };
  });
  const expectedBuckets = ["Current", "Due_Today", "1_30", "31_60", "61_90", "91_180", "181_364", "365_Plus", "Unknown"];
  if (buckets.length !== 9 || expectedBuckets.some((code) => !buckets.some((bucket) => bucket.Code === code)) || buckets.some((bucket) => !bucket.Label || !bucket.Outstanding_Field || !bucket.Overdue_Field || !bucket.Loan_Count_Field)) throw new Error("Incomplete PAR aging metadata.");
  const normalizeMetrics = (target: ParRecord, prefix: string) => {
    for (const field of metrics) target[field] = num(target[field], `${prefix}.${field}`);
    for (const field of ["PAR_Pct", "Overdue_Pct"]) target[field] = optionalNum(target[field], `${prefix}.${field}`);
    for (const bucket of buckets) for (const field of [bucket.Outstanding_Field, bucket.Overdue_Field, bucket.Loan_Count_Field]) target[field] = num(target[field], `${prefix}.${field}`);
    for (const col of columns.slice(2)) target[col.Field] = col.Field.endsWith("_Pct") ? optionalNum(target[col.Field], `${prefix}.${col.Field}`) : num(target[col.Field], `${prefix}.${col.Field}`);
  };
  normalizeMetrics(summary, "Summary"); normalizeMetrics(totals, "Totals");
  const rows = details.Rows.map((item: unknown) => {
    const row = record(item); row.Sl_No = num(row.Sl_No, "Rows.Sl_No"); normalizeMetrics(row, "Rows");
    if (row.Days_Overdue !== null && row.Days_Overdue !== undefined) row.Days_Overdue = num(row.Days_Overdue, "Rows.Days_Overdue");
    return row;
  });
  const pagination = { current_page: num(rawPage.current_page), per_page: num(rawPage.per_page), total: num(rawPage.total), last_page: num(rawPage.last_page), from: optionalNum(rawPage.from), to: optionalNum(rawPage.to), has_more_pages: rawPage.has_more_pages };
  if (typeof pagination.has_more_pages !== "boolean" || pagination.current_page !== query.page || pagination.per_page !== query.perPage || pagination.total < 0 || pagination.last_page < 1 || !Number.isInteger(pagination.last_page) || rows.length > pagination.per_page) throw new Error("Invalid PAR pagination.");
  const calculation = { asOf: str(calc.As_Of_Date), thresholdDays: num(calc.PAR_Threshold_Days), thresholdOperator: str(calc.Threshold_Operator), parBasis: str(calc.PAR_Basis), outstandingBasis: str(calc.Outstanding_Basis), overdueBasis: str(calc.Overdue_Basis), borrowerBasis: str(calc.Borrower_Basis), agingBasis: str(calc.Aging_Basis) };
  if (calculation.asOf !== query.toDate || calculation.thresholdDays !== 30 || calculation.thresholdOperator !== ">" || calculation.parBasis !== "full_outstanding_of_loans_over_30_days_past_due" || calculation.outstandingBasis !== "principal_plus_contractual_interest") throw new Error("Unexpected PAR calculation basis. Please check the API configuration.");
  return { view, query, organisation: { name: str(organisation.Org_Name), address: str(organisation.Org_Address) }, summary, totals, rows, columns, buckets, warnings: details.Data_Quality_Warnings.map(str), pagination: { ...pagination, has_more_pages: pagination.has_more_pages }, calculation };
};

export const getDefaultParCalculation = async (query: ParQuery) => mapDefaultParCalculation(await doGetApiCall({ url: endPoints.getDefaultParCalculation(query) }), query);
const stableTotals = (value: ParRecord) => JSON.stringify(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
export const fetchAllParRows = async (query: ParQuery, expected: DefaultParCalculationData): Promise<DefaultParCalculationData> => {
  const first = await getDefaultParCalculation({ ...query, page: 1, perPage: 500 });
  if (first.pagination.total !== expected.pagination.total || stableTotals(first.totals) !== stableTotals(expected.totals)) throw new Error("The report changed since it was loaded. Refresh it before exporting.");
  const rows = [...first.rows]; let current = first;
  while (current.pagination.has_more_pages) {
    const page = current.pagination.current_page + 1;
    if (page > first.pagination.last_page) throw new Error("Invalid export pagination.");
    current = await getDefaultParCalculation({ ...query, page, perPage: 500 });
    if (current.pagination.total !== first.pagination.total || current.pagination.last_page !== first.pagination.last_page || stableTotals(current.totals) !== stableTotals(first.totals) || !current.rows.length) throw new Error("The report changed while exporting. Please try again.");
    rows.push(...current.rows);
  }
  if (rows.length !== first.pagination.total || new Set(rows.map((row) => row.Sl_No)).size !== rows.length) throw new Error("The export did not receive every report row. Please try again.");
  return { ...first, rows };
};
export const parLabel = (row: ParRecord, view: ParView) => portfolioLabel(row, view);
export const formatParValue = (value: unknown, field: string) => {
  if (value === null || value === undefined) return field.endsWith("_Pct") ? "N/A" : "–";
  if (typeof value !== "number") return String(value);
  if (field.endsWith("_Pct")) return `${value.toFixed(2)}%`;
  const count = field.endsWith("_Count") || field.startsWith("Loan_Count_") || field === "Sl_No" || field === "Days_Overdue" || field === "Max_Days_Overdue";
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: count ? 0 : 2, maximumFractionDigits: count ? 0 : 2 }).format(value);
};
