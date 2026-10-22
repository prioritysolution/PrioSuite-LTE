"use client";

import { Eye, Loader2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DatePicker } from "@/common/formFields/DatePicker";
import DropdownField from "@/common/formFields/DropdownField";
import {
  formatDisplayDateTime,
  LOG_RESULT_OPTIONS,
} from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import {
  LoanRectifyLogProps,
  LoanRectifyLogRow,
} from "@/container/rectify/loan-issue/LoanRectifyType";
import FilterCard, { ResultCard } from "../collection-repayment/FilterCard";
import LogDetailsDialog from "../collection-repayment/LogDetailsDialog";
import LogResultBadge from "../collection-repayment/LogResultBadge";

const loanText = (row: LoanRectifyLogRow) =>
  [row.memberName, row.accountLabel ? `Acct ${row.accountLabel}` : ""]
    .filter(Boolean)
    .join(" / ") || "—";

const LoanLogTab = ({
  form,
  rows,
  loading,
  onSearch,
  onReset,
  onView,
  ...detailsProps
}: LoanRectifyLogProps) => (
  <div className="form-sections">
    <FilterCard
      form={form}
      title="Activity Log"
      loading={loading}
      onSearch={onSearch}
      onReset={onReset}
    >
      <DatePicker
        control={form.control}
        name="fromDate"
        label="From Date"
        placeholder="Select date"
      />
      <DatePicker
        control={form.control}
        name="toDate"
        label="To Date"
        placeholder="Select date"
      />
      <DropdownField
        control={form.control}
        name="result"
        label="Result"
        className="space-y-0"
        options={LOG_RESULT_OPTIONS}
        optionLabelKey="label"
        optionValueKey="value"
        disableSorting
        placeholder="All Results"
      />
    </FilterCard>

    <ResultCard
      title="Save Attempts"
      icon={<ScrollText size={18} />}
      count={rows.length}
      countLabel={["attempt", "attempts"]}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40 rounded-xl border border-gray-100 bg-slate-50/40">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-semibold">Loading activity log</span>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-xl border border-gray-100 bg-slate-50/40">
          <p className="text-sm font-medium text-gray-500">
            No save attempts found for this search.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-100">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="min-w-[130px] font-bold text-primary">
                      When
                    </TableHead>
                    <TableHead className="min-w-[110px] font-bold text-primary">
                      Result
                    </TableHead>
                    <TableHead className="min-w-[140px] font-bold text-primary">
                      User
                    </TableHead>
                    <TableHead className="min-w-[130px] font-bold text-primary">
                      Voucher
                    </TableHead>
                    <TableHead className="min-w-[220px] font-bold text-primary">
                      Loan
                    </TableHead>
                    <TableHead className="min-w-[220px] font-bold text-primary">
                      Message
                    </TableHead>
                    <TableHead className="w-24 text-center font-bold text-primary">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.logId}>
                      <TableCell className="whitespace-nowrap text-gray-700">
                        {formatDisplayDateTime(row.createdOn) || "—"}
                      </TableCell>
                      <TableCell>
                        <LogResultBadge result={row.result} name={row.resultName} />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-800">{row.userName || "—"}</p>
                        {row.branchName && (
                          <p className="text-xs text-gray-400 mt-0.5">{row.branchName}</p>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-800 whitespace-nowrap">
                        {row.voucherNo || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="text-gray-700">{loanText(row)}</p>
                        {row.groupName && (
                          <p className="text-xs text-gray-400 mt-0.5">{row.groupName}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {row.message || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onView(row.logId)}
                          className="h-9 px-3 font-semibold text-primary border-primary/20 hover:bg-primary/5"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
            {rows.map((row) => (
              <article
                key={row.logId}
                className="rounded-xl border border-gray-100 bg-white p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {formatDisplayDateTime(row.createdOn) || "—"}
                    </p>
                    <LogResultBadge result={row.result} name={row.resultName} />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onView(row.logId)}
                    className="h-9 px-3 font-semibold text-primary border-primary/20 hover:bg-primary/5 shrink-0"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
                <p className="font-semibold text-gray-800">
                  {row.voucherNo || "—"}
                  {row.userName ? (
                    <span className="ml-2 text-xs font-medium text-gray-400">
                      {row.userName}
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-gray-700">{loanText(row)}</p>
                {row.message && <p className="text-sm text-gray-600">{row.message}</p>}
              </article>
            ))}
          </div>
        </>
      )}
    </ResultCard>

    <LogDetailsDialog
      {...detailsProps}
      subject={{
        label: "Loan Account",
        value: detailsProps.details?.log.accountLabel ?? "",
      }}
    />
  </div>
);

export default LoanLogTab;
