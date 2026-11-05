"use client";

import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatPortfolioValue, portfolioLabel } from "@/container/mis-reports/loan-portfolio/LoanPortfolioApi";
import type { LoanPortfolioData, PortfolioRecord } from "@/container/mis-reports/loan-portfolio/LoanPortfolioType";

const fields = [
  ["Village_Count", "Villages"], ["Active_Loanee_Count", "Active loans"], ["Period_Disbursement", "Disbursed (period)"],
  ["Existing_Disbursement", "Existing disbursed"], ["Total_Outstanding", "Total outstanding"],
  ["Cumulative_Realisable", "Realisable"], ["Total_Collection", "Collection"], ["Collection_Pct", "Collection %"],
  ["Default_Amount", "Default"], ["Closing_Outstanding", "Closing outstanding"],
] as const;

const LoanPortfolioTable = ({ report, loading, onPageChange, onPerPageChange }: {
  report: LoanPortfolioData; loading: boolean; onPageChange: (page: number) => void; onPerPageChange: (perPage: number) => void;
}) => {
  const columns: ColumnDef<PortfolioRecord>[] = [
    { accessorKey: "Sl_No", header: "No." },
    { id: "group", header: report.view === "member" ? "Member / loan" : report.view === "branch_summary" ? "Branch" : report.view === "group" ? "Group" : report.view === "village" ? "Village" : "Sahayika / branch", cell: ({ row }) => portfolioLabel(row.original, report.view) },
    ...fields.map(([field, header]): ColumnDef<PortfolioRecord> => ({ accessorKey: field, header, cell: ({ getValue }) => <span className="block whitespace-nowrap text-right tabular-nums">{formatPortfolioValue(getValue(), field)}</span> })),
  ];
  return <DataTable columns={columns} data={report.rows} serverPagination={{ page: report.pagination.current_page, pageSize: report.pagination.per_page, pageCount: report.pagination.last_page, loading, onPageChange, onPageSizeChange: onPerPageChange }} />;
};
export default LoanPortfolioTable;
