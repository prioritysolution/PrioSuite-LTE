"use client";

import { format } from "date-fns";
import { Users } from "lucide-react";
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
import { DemandCollectionMember } from "@/container/loan-entry/demand-collection/DemandCollectionType";

interface MemberDetailsSectionProps {
  members: DemandCollectionMember[];
  hasGroup: boolean;
  selectedMemberIds: number[];
  onToggleMember: (memberId: number, checked: boolean) => void;
}

const formatMoney = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  return format(date, "d MMM, yyyy");
};

const MemberCheckbox = ({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) => (
  <label
    className="inline-flex items-center justify-center gap-2 select-none cursor-pointer"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onToggle();
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      readOnly
      className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer pointer-events-none"
    />
    <span className="text-xs font-semibold text-gray-600">Collect</span>
  </label>
);

const MemberDetailsSection = ({
  members,
  hasGroup,
  selectedMemberIds,
  onToggleMember,
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
              Tick Collect on each member to include in this demand
            </p>
          </div>
        </div>
        {hasGroup && (
          <span className="text-sm font-semibold text-gray-700 shrink-0">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {!hasGroup ? (
          <div className="flex items-center justify-center h-[160px] rounded-xl border border-dashed border-gray-200 bg-slate-50/40 px-4 text-center">
            <p className="text-sm font-medium text-gray-500">
              Select a Sahayika and group to load member details.
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center h-[160px] rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              No members found for this group.
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
                      <TableHead className="min-w-[110px] font-bold text-primary">
                        Member No
                      </TableHead>
                      <TableHead className="min-w-[160px] font-bold text-primary">
                        Member Name
                      </TableHead>
                      <TableHead className="min-w-[120px] font-bold text-primary">
                        Loan Date
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Loan Amount
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Installment
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right font-bold text-primary">
                        Balance
                      </TableHead>
                      <TableHead className="min-w-[110px] text-right font-bold text-primary">
                        Demand
                      </TableHead>
                      <TableHead className="w-[120px] text-center font-bold text-primary">
                        Collection
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member, index) => {
                      const isChecked = selectedMemberIds.includes(
                        member.Member_Id,
                      );
                      return (
                      <TableRow
                        key={member.Member_Id}
                        className={cn(
                          "cursor-pointer",
                          isChecked && "bg-primary/5",
                        )}
                        onClick={() =>
                          onToggleMember(member.Member_Id, !isChecked)
                        }
                      >
                        <TableCell className="text-center text-gray-500 font-semibold">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">
                          {member.Member_No}
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-primary">
                            {member.Member_Name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {member.FatHusb_Name}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-gray-700">
                          {formatDate(member.Loan_Date)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-800 whitespace-nowrap">
                          {formatMoney(member.Loan_Amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-800 whitespace-nowrap">
                          {formatMoney(member.Installment_Amt)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-800 whitespace-nowrap">
                          {formatMoney(member.Outs_Amount)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                          {formatMoney(member.Demand)}
                        </TableCell>
                        <TableCell
                          className="text-center"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MemberCheckbox
                            checked={isChecked}
                            onToggle={() =>
                              onToggleMember(member.Member_Id, !isChecked)
                            }
                          />
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {members.map((member, index) => {
                const isChecked = selectedMemberIds.includes(member.Member_Id);
                return (
                <article
                  key={member.Member_Id}
                  className={cn(
                    "rounded-xl border p-4 space-y-3 cursor-pointer",
                    isChecked
                      ? "border-primary/30 bg-primary/5"
                      : "border-gray-100 bg-white",
                  )}
                  onClick={() => onToggleMember(member.Member_Id, !isChecked)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        #{index + 1} · {member.Member_No}
                      </p>
                      <h4 className="font-semibold text-primary truncate">
                        {member.Member_Name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {member.FatHusb_Name}
                      </p>
                    </div>
                    <div
                      className="shrink-0"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MemberCheckbox
                        checked={isChecked}
                        onToggle={() =>
                          onToggleMember(member.Member_Id, !isChecked)
                        }
                      />
                      <p className="mt-2 text-right text-[11px] font-semibold uppercase text-gray-400">
                        Demand
                      </p>
                      <p className="text-right font-bold text-primary">
                        {formatMoney(member.Demand)}
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Loan Date
                      </dt>
                      <dd className="font-medium text-gray-700">
                        {formatDate(member.Loan_Date)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Loan Amount
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {formatMoney(member.Loan_Amount)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Installment
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {formatMoney(member.Installment_Amt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs font-semibold uppercase">
                        Balance
                      </dt>
                      <dd className="font-semibold text-gray-700">
                        {formatMoney(member.Outs_Amount)}
                      </dd>
                    </div>
                  </dl>
                </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemberDetailsSection;
