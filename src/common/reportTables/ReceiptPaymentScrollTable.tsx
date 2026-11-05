"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  ReceiptPaymentDailyRow,
  ReceiptPaymentPagination,
  ReceiptPaymentTransactionRow,
} from "@/container/mis-reports/receipt-payment-scroll/ReceiptPaymentScrollType";

const money = (value: unknown) => {
  const num = Number(value) || 0;
  if (!num) return "-";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (value: unknown) => {
  const str = String(value || "");
  const [year, month, day] = str.split("-");
  return year && month && day ? `${day}-${month}-${year}` : str || "-";
};

const transactionColumns: ColumnDef<ReceiptPaymentTransactionRow>[] = [
  {
    accessorKey: "vouDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">
        {formatDate(row.original.vouDate || row.original.date)}
      </span>
    ),
  },
  {
    accessorKey: "voucherNo",
    header: "Voucher No.",
    cell: ({ getValue }) => (
      <span className="font-semibold text-gray-900">{String(getValue() || "-")}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = String(row.original.type || row.original.voucherType || "Receipt");
      const isReceipt = type.toLowerCase() === "receipt";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isReceipt
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {type}
        </span>
      );
    },
  },
  {
    accessorKey: "coName",
    header: "Sahayika",
    cell: ({ row }) => (
      <span className="text-gray-700">{row.original.coName || row.original.sahayikaName || "-"}</span>
    ),
  },
  {
    accessorKey: "particulars",
    header: "Particulars",
    cell: ({ getValue }) => <span className="text-gray-800">{String(getValue() || "-")}</span>,
  },
  {
    accessorKey: "accountName",
    header: "Account",
    cell: ({ getValue }) => (
      <span className="text-gray-600 text-xs">{String(getValue() || "-")}</span>
    ),
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ getValue }) => {
      const mode = String(getValue() || "Cash");
      const isCash = mode.toLowerCase() === "cash";
      return (
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
            isCash ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700"
          }`}
        >
          {mode}
        </span>
      );
    },
  },
  {
    accessorKey: "receiptAmount",
    header: "Receipt",
    cell: ({ getValue }) => {
      const val = Number(getValue()) || 0;
      return (
        <span
          className={`block text-right tabular-nums ${
            val > 0 ? "font-semibold text-blue-700" : "text-gray-400"
          }`}
        >
          {money(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "paymentAmount",
    header: "Payment",
    cell: ({ getValue }) => {
      const val = Number(getValue()) || 0;
      return (
        <span
          className={`block text-right tabular-nums ${
            val > 0 ? "font-semibold text-amber-700" : "text-gray-400"
          }`}
        >
          {money(val)}
        </span>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="block text-right font-bold tabular-nums text-gray-900">
        {money(row.original.balance ?? row.original.runningBalance)}
      </span>
    ),
  },
];

const dailyColumns: ColumnDef<ReceiptPaymentDailyRow>[] = [
  {
    accessorKey: "dayNo",
    header: "Day",
    cell: ({ getValue }) => <span className="font-semibold text-gray-900">{String(getValue())}</span>,
  },
  {
    accessorKey: "vouDate",
    header: "Date",
    cell: ({ getValue }) => <span className="font-medium whitespace-nowrap">{formatDate(getValue())}</span>,
  },
  {
    accessorKey: "receiptLoanPrincipal",
    header: "Principal (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "receiptInterest",
    header: "Interest (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "receiptProcessingCharge",
    header: "Proc. Charge (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "receiptAmount",
    header: "Receipt Total (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right font-bold tabular-nums text-blue-700">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "paymentLoan",
    header: "Loan Pay (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "paymentHouseRent",
    header: "Rent (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "paymentSalary",
    header: "Salary (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "paymentTravelling",
    header: "Travelling (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "paymentHO",
    header: "H.O. Pay (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right tabular-nums text-slate-800">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "paymentAmount",
    header: "Payment Total (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right font-bold tabular-nums text-amber-700">{money(getValue())}</span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Cash in Hand (₹)",
    cell: ({ getValue }) => (
      <span className="block text-right font-extrabold tabular-nums text-emerald-800">
        {money(getValue())}
      </span>
    ),
  },
];

interface ReportPaginationProps {
  pagination: ReceiptPaymentPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

interface ReceiptPaymentScrollTableProps extends ReportPaginationProps {
  rows: ReceiptPaymentTransactionRow[];
}

export const ReceiptPaymentScrollTable = ({ rows, pagination, loading, onPageChange, onPerPageChange }: ReceiptPaymentScrollTableProps) => {
  return <DataTable columns={transactionColumns} data={rows} serverPagination={{ page: pagination.currentPage, pageSize: pagination.perPage, pageCount: pagination.lastPage, loading, onPageChange, onPageSizeChange: onPerPageChange }} />;
};

interface ReceiptPaymentDailyTableProps extends ReportPaginationProps {
  rows: ReceiptPaymentDailyRow[];
}

export const ReceiptPaymentDailyTable = ({ rows, pagination, loading, onPageChange, onPerPageChange }: ReceiptPaymentDailyTableProps) => {
  return <DataTable columns={dailyColumns} data={rows} serverPagination={{ page: pagination.currentPage, pageSize: pagination.perPage, pageCount: pagination.lastPage, loading, onPageChange, onPageSizeChange: onPerPageChange }} />;
};

export default ReceiptPaymentScrollTable;
