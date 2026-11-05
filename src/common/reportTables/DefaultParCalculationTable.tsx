"use client";

import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatParValue, parLabel } from "@/container/mis-reports/default-par-calculation/DefaultParCalculationApi";
import type { DefaultParCalculationData, ParRecord } from "@/container/mis-reports/default-par-calculation/DefaultParCalculationType";

const DefaultParCalculationTable = ({ report, loading, onPageChange, onPerPageChange }: {
  report: DefaultParCalculationData; loading: boolean; onPageChange: (page: number) => void; onPerPageChange: (size: number) => void;
}) => {
  const columns: ColumnDef<ParRecord>[] = report.columns.map((col): ColumnDef<ParRecord> => ({
    accessorKey: col.Field,
    header: col.Number === 2 ? "Grouping" : col.Label,
    cell: ({ row }) => <span className={`block whitespace-nowrap tabular-nums ${col.Number > 2 ? "text-right" : ""}`}>{col.Number === 2 ? parLabel(row.original, report.view) : formatParValue(row.original[col.Field], col.Field)}</span>,
  }));
  const extra = report.view === "member"
    ? [["Oldest_Due_Date", "Oldest unpaid due"], ["Days_Overdue", "Days overdue"], ["Aging_Bucket", "Aging bucket"]]
    : [["Oldest_Unpaid_Due_Date", "Oldest unpaid due"], ["Max_Days_Overdue", "Max days overdue"]];
  for (const [field, header] of extra) columns.push({ accessorKey: field, header, cell: ({ getValue }) => formatParValue(getValue(), field) });
  return <DataTable columns={columns} data={report.rows} serverPagination={{ page: report.pagination.current_page, pageSize: report.pagination.per_page, pageCount: report.pagination.last_page, loading, onPageChange, onPageSizeChange: onPerPageChange }} />;
};
export default DefaultParCalculationTable;
