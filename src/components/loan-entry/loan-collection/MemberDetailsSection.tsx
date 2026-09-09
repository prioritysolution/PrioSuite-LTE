"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
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

export interface MemberRow {
  Member_Id: string | number;
  Member_No: string;
  Member_Name: string;
  Guardian_Name?: string;
  Area_Name?: string;
  Loan_Date?: string;
  Loan_Amount?: string | number;
  Installment_Amt?: string | number;
  Current_Balance?: string | number;
  raw: any;
}

interface MemberDetailsSectionProps {
  members: any[];
  selectedMemberId: string | number;
  isLoading?: boolean;
  hasGroup: boolean;
  onToggleCollection: (memberId: string | number, checked: boolean) => void;
}

const formatMoney = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value: unknown) => {
  if (!value) return "—";
  try {
    const d = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(d.getTime())) return String(value);
    return format(d, "d MMM, yyyy");
  } catch {
    return String(value);
  }
};

const pick = (row: any, keys: string[]) => {
  for (const key of keys) {
    const val = row?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

export const MemberDetailsSection = ({
  members,
  selectedMemberId,
  isLoading,
  hasGroup,
  onToggleCollection,
}: MemberDetailsSectionProps) => {
  const rows: MemberRow[] = useMemo(() => {
    return (members || []).map((item) => {
      const id = pick(item, ["Member_Id", "Mem_Id", "mem_id"]);
      const no = String(
        pick(item, [
          "Member_No",
          "Mem_No",
          "mem_no",
          "Member_Code",
          "Mem_Code",
          "Acc_No",
        ]) || "",
      );
      const name = String(
        pick(item, ["Member_Name", "Mem_Name", "mem_name"]) || "",
      );
      return {
        Member_Id: id,
        Member_No: no,
        Member_Name: name,
        Guardian_Name: String(
          pick(item, ["FatHusb_Name", "Guardian_Name", "Gurdain_Name"]) || "",
        ),
        Area_Name: String(pick(item, ["Area_Name", "Area", "Vill_Name"]) || ""),
        Loan_Date: pick(item, ["Loan_Date", "loan_date", "Disb_Date"]) || "",
        Loan_Amount: pick(item, [
          "Loan_Amount",
          "Sanc_Amount",
          "Disb_Amount",
        ]),
        Installment_Amt: pick(item, [
          "Installment_Amt",
          "Inst_Amount",
          "Inst_Amt",
        ]),
        Current_Balance: pick(item, [
          "Outs_Amount",
          "Outstanding_Balance",
          "Curr_Balance",
          "Current_Balance",
          "Curr_Bal",
          "Realisable_Amt",
          "Resilable_Amt",
          "Balance",
        ]),
        raw: item,
      };
    });
  }, [members]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg">
              Member Details
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Select any one member for collection using the Collection
              checkbox
            </p>
          </div>
        </div>
        {hasGroup && (
          <span className="text-sm font-semibold text-gray-700">
            {rows.length} {rows.length === 1 ? "member" : "members"}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {!hasGroup ? (
          <div className="flex items-center justify-center h-[160px] rounded-xl border border-dashed border-gray-200 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              Select a group to load member details.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-[220px] rounded-xl border border-gray-100 bg-slate-50/50 gap-3 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
              Loading Members...
            </span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-[160px] rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              No members found for this group.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
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
                      <TableHead className="w-[120px] text-center font-bold text-primary">
                        Collection
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => {
                      const hasValidId =
                        row.Member_Id !== "" &&
                        row.Member_Id !== null &&
                        row.Member_Id !== undefined;
                      const isChecked =
                        hasValidId &&
                        selectedMemberId !== "" &&
                        selectedMemberId != null &&
                        String(selectedMemberId) === String(row.Member_Id);
                      return (
                        <TableRow
                          key={
                            hasValidId
                              ? String(row.Member_Id)
                              : `member-row-${index}`
                          }
                          className={cn(
                            isChecked && "bg-primary/5",
                            hasValidId
                              ? "cursor-pointer"
                              : "cursor-not-allowed opacity-60",
                          )}
                          onClick={() => {
                            if (!hasValidId) return;
                            // Clicking another row selects that member (exclusive)
                            onToggleCollection(row.Member_Id, true);
                          }}
                        >
                          <TableCell className="text-center text-gray-500 font-semibold">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-gray-800">
                            {row.Member_No || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate">
                                {row.Member_Name || "—"}
                              </p>
                              {(row.Guardian_Name || row.Area_Name) && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                  {[row.Guardian_Name, row.Area_Name]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-gray-700">
                            {formatDate(row.Loan_Date)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-800 whitespace-nowrap">
                            {formatMoney(row.Loan_Amount)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-800 whitespace-nowrap">
                            {formatMoney(row.Installment_Amt)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary whitespace-nowrap">
                            {formatMoney(row.Current_Balance)}
                          </TableCell>
                          <TableCell
                            className="text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <label
                              className={cn(
                                "inline-flex items-center justify-center gap-2 select-none",
                                hasValidId
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed",
                              )}
                            >
                              <input
                                type="checkbox"
                                name="loan-collection-member"
                                checked={isChecked}
                                disabled={!hasValidId}
                                onChange={(e) => {
                                  if (!hasValidId) return;
                                  onToggleCollection(
                                    row.Member_Id,
                                    e.target.checked,
                                  );
                                }}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className="text-xs font-semibold text-gray-600">
                                Collect
                              </span>
                            </label>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {rows.map((row, index) => {
                const hasValidId =
                  row.Member_Id !== "" &&
                  row.Member_Id !== null &&
                  row.Member_Id !== undefined;
                const isChecked =
                  hasValidId &&
                  selectedMemberId !== "" &&
                  selectedMemberId != null &&
                  String(selectedMemberId) === String(row.Member_Id);
                return (
                  <div
                    key={
                      hasValidId
                        ? String(row.Member_Id)
                        : `member-card-${index}`
                    }
                    className={cn(
                      "rounded-xl border p-4 shadow-sm transition-colors",
                      isChecked
                        ? "border-primary/30 bg-primary/5"
                        : "border-gray-100 bg-white",
                      hasValidId ? "cursor-pointer" : "opacity-60",
                    )}
                    onClick={() => {
                      if (!hasValidId) return;
                      onToggleCollection(row.Member_Id, true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">
                          #{index + 1} · {row.Member_No || "—"}
                        </p>
                        <p className="font-semibold text-primary truncate">
                          {row.Member_Name || "—"}
                        </p>
                      </div>
                      <label
                        className={cn(
                          "inline-flex items-center gap-2 select-none shrink-0",
                          hasValidId
                            ? "cursor-pointer"
                            : "cursor-not-allowed",
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          name="loan-collection-member-mobile"
                          checked={isChecked}
                          disabled={!hasValidId}
                          onChange={(e) => {
                            if (!hasValidId) return;
                            onToggleCollection(
                              row.Member_Id,
                              e.target.checked,
                            );
                          }}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-xs font-semibold text-gray-600">
                          Collect
                        </span>
                      </label>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Loan Date</p>
                        <p className="font-medium text-gray-800">
                          {formatDate(row.Loan_Date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Loan Amount</p>
                        <p className="font-semibold text-gray-800">
                          {formatMoney(row.Loan_Amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Installment</p>
                        <p className="font-medium text-gray-800">
                          {formatMoney(row.Installment_Amt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Balance</p>
                        <p className="font-semibold text-primary">
                          {formatMoney(row.Current_Balance)}
                        </p>
                      </div>
                    </div>
                  </div>
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
