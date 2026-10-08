"use client";

import { format, isValid } from "date-fns";
import { Loader2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DemandCollectionMember,
  DemandCollectionSummary,
} from "@/container/loan-entry/demand-collection/DemandCollectionType";

interface MemberDetailsSectionProps {
  members: DemandCollectionMember[];
  summary: DemandCollectionSummary | null;
  loading?: boolean;
  saving?: boolean;
  onAmountChange: (accountId: number, amount: string) => void;
}

const formatMoney = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const date = new Date(value);
  if (!isValid(date)) return value || "—";
  return format(date, "dd-MM-yyyy");
};

const AmountBox = ({
  member,
  disabled,
  onAmountChange,
}: {
  member: DemandCollectionMember;
  disabled?: boolean;
  onAmountChange: (accountId: number, amount: string) => void;
}) => (
  <div className="space-y-1">
    <input
      type="number"
      min="0"
      step="0.01"
      inputMode="decimal"
      value={member.payAmount}
      disabled={member.isCollected || disabled}
      onChange={(event) => onAmountChange(member.accountId, event.target.value)}
      className={cn(
        "h-10 w-full min-w-[120px] rounded-md border border-gray-200 bg-white px-3 text-right text-sm font-semibold text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        (member.isCollected || disabled) && "bg-slate-50 text-slate-500",
      )}
    />
    {member.isCollected && member.voucherNo ? (
      <p className="text-[11px] font-medium text-gray-500 text-right">
        {member.voucherNo}
      </p>
    ) : null}
  </div>
);

const MemberDetailsSection = ({
  members,
  summary,
  loading,
  saving,
  onAmountChange,
}: MemberDetailsSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-primary text-lg">
              Member Details
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {summary?.groupName || "Group"}
              {summary?.groupNo ? ` (${summary.groupNo})` : ""}
              {summary?.collectionDay ? ` · ${summary.collectionDay}` : ""}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-700 shrink-0">
          {members.length} {members.length === 1 ? "account" : "accounts"}
        </span>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">
              Total Demand
            </p>
            <p className="font-bold text-primary">
              {formatMoney(summary.totalDemand)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">
              Collected
            </p>
            <p className="font-bold text-gray-800">
              {formatMoney(summary.collAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">
              Pending
            </p>
            <p className="font-bold text-gray-800">
              {formatMoney(summary.pendingDemand)}
            </p>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 rounded-xl border border-gray-100 bg-slate-50/40">
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-semibold">Loading collection details</span>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center h-40 rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              No demand found for this group on this date.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-100">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/5">
                      <TableHead className="w-12 text-center font-bold text-primary">
                        Sl
                      </TableHead>
                      <TableHead className="min-w-[180px] font-bold text-primary">
                        Member
                      </TableHead>
                      <TableHead className="min-w-[120px] font-bold text-primary">
                        Loan Account
                      </TableHead>
                      <TableHead className="min-w-[110px] font-bold text-primary">
                        Loan Date
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Outstanding
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Total Demand
                      </TableHead>
                      <TableHead className="min-w-[140px] text-right font-bold text-primary">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member, index) => (
                      <TableRow
                        key={`${member.accountId}-${member.memberId}`}
                        className={cn(member.isCollected && "bg-slate-50/80")}
                      >
                        <TableCell className="text-center text-gray-500 font-semibold">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-primary">
                            {member.memberName || "—"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[member.memberNo, member.guardianName]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </p>
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">
                          {member.accountLabel || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-gray-700">
                          {member.loanDate ? formatDate(member.loanDate) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-800 whitespace-nowrap">
                          {formatMoney(member.outstanding)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                          {formatMoney(member.totalDemand)}
                        </TableCell>
                        <TableCell>
                          <AmountBox
                            member={member}
                            disabled={saving}
                            onAmountChange={onAmountChange}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {members.map((member, index) => (
                <article
                  key={`${member.accountId}-${member.memberId}`}
                  className={cn(
                    "rounded-xl border p-4 space-y-3",
                    member.isCollected
                      ? "border-gray-100 bg-slate-50"
                      : "border-gray-100 bg-white",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      #{index + 1}
                      {member.memberNo ? ` · ${member.memberNo}` : ""}
                    </p>
                    <h4 className="font-semibold text-primary truncate">
                      {member.memberName || "—"}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {member.guardianName || "—"}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Account
                      </dt>
                      <dd className="font-medium text-gray-700">
                        {member.accountLabel || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Demand
                      </dt>
                      <dd className="font-bold text-primary">
                        {formatMoney(member.totalDemand)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Outstanding
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {formatMoney(member.outstanding)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Loan Date
                      </dt>
                      <dd className="font-medium text-gray-700">
                        {member.loanDate ? formatDate(member.loanDate) : "—"}
                      </dd>
                    </div>
                  </dl>
                  <AmountBox
                    member={member}
                    disabled={saving}
                    onAmountChange={onAmountChange}
                  />
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberDetailsSection;
