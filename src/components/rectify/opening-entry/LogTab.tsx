"use client";

import { ArrowRight, Eye, Loader2, ScrollText } from "lucide-react";
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
  formatMoney,
  LOG_RESULT_OPTIONS,
} from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import {
  OpeningEntryLogProps,
  OpeningEntryLogRow,
} from "@/container/rectify/opening-entry/OpeningEntryType";
import FilterCard, { ResultCard } from "../collection-repayment/FilterCard";
import LogDetailsDialog from "../collection-repayment/LogDetailsDialog";
import LogResultBadge from "../collection-repayment/LogResultBadge";

const loanText = (row: OpeningEntryLogRow) =>
  [
    row.memberName,
    row.accountLabel ? `Acct ${row.accountLabel}` : "",
    row.loanCycle ? `Cycle ${row.loanCycle}` : "",
  ]
    .filter(Boolean)
    .join(" / ") || "—";

const BalanceChange = ({
  oldValue,
  newValue,
}: {
  oldValue: number;
  newValue: number;
}) => {
  if (!oldValue && !newValue) return <span className="text-gray-500">—</span>;
  if (oldValue === newValue) {
    return <span className="text-gray-700">{formatMoney(newValue)}</span>;
  }
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="text-gray-500">{formatMoney(oldValue)}</span>
      <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
      <span className="font-medium text-primary">{formatMoney(newValue)}</span>
    </span>
  );
};

const OpeningLogTab = ({
  form,
  rows,
  loading,
  onSearch,
  onReset,
  onView,
  ...detailsProps
}: OpeningEntryLogProps) => (
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
        <div className="flex h-40 items-center justify-center rounded-xl border border-gray-100 bg-slate-50/40">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-semibold">Loading activity log</span>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-gray-100 bg-slate-50/40">
          <p className="text-sm font-medium text-gray-500">
            No save attempts found for this search.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-gray-100 lg:block">
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
                    <TableHead className="min-w-[220px] font-bold text-primary">
                      Loan
                    </TableHead>
                    <TableHead className="min-w-[180px] font-bold text-primary">
                      Opening Balance
                    </TableHead>
                    <TableHead className="min-w-[120px] font-bold text-primary">
                      Schedule Rows
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
                        <p className="font-medium text-gray-800">
                          {row.userName || "—"}
                        </p>
                        {row.branchName && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {row.branchName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="text-gray-700">{loanText(row)}</p>
                        {row.groupName && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {row.groupName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <BalanceChange
                          oldValue={row.oldOpeningBalance}
                          newValue={row.newOpeningBalance}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-gray-800">
                        {row.scheduleRowsUpdated || "—"}
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
                          className="h-9 border-primary/20 px-3 font-semibold text-primary hover:bg-primary/5"
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
                className="space-y-3 rounded-xl border border-gray-100 bg-white p-4"
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
                    className="h-9 shrink-0 border-primary/20 px-3 font-semibold text-primary hover:bg-primary/5"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
                <p className="text-sm text-gray-700">{loanText(row)}</p>
                <BalanceChange
                  oldValue={row.oldOpeningBalance}
                  newValue={row.newOpeningBalance}
                />
                {row.scheduleRowsUpdated > 0 && (
                  <p className="text-xs text-gray-500">
                    Schedule rows updated: {row.scheduleRowsUpdated}
                  </p>
                )}
                {row.message && (
                  <p className="text-sm text-gray-600">{row.message}</p>
                )}
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

export default OpeningLogTab;
