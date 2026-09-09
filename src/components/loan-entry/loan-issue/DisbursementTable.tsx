"use client";

import { Eye } from "lucide-react";
import { IDisbursement } from "@/container/loan-entry/loan-issue/LoanIssueType";
import { Button } from "@/components/ui/button";

interface DisbursementTableProps {
  disbursements: IDisbursement[];
  loading: boolean;
  onViewDetails: (disbursement: IDisbursement) => void;
}

const pickValue = (row: IDisbursement, keys: (keyof IDisbursement | string)[]) => {
  for (const key of keys) {
    const value = (row as any)?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "";
};

export function DisbursementTable({
  disbursements,
  loading,
  onViewDetails,
}: DisbursementTableProps) {
  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return "₹ 0.00";

    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);

    return `₹ ${formatted}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm min-w-[1100px]">
          <thead className="bg-primary">
            <tr>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider w-16 text-center">
                Sl
              </th>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                Application Date
              </th>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                Branch
              </th>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                Area
              </th>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider">
                Group Name
              </th>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-center w-36">
                No Of Member
              </th>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-right w-48">
                Application Amount
              </th>
              <th className="px-5 h-12 text-[13px] font-bold text-primary-foreground uppercase tracking-wider text-center w-36">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-gray-500 font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading disbursements...
                  </div>
                </td>
              </tr>
            ) : disbursements.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 h-28 text-center text-gray-500 font-medium"
                >
                  No disbursements found.
                </td>
              </tr>
            ) : (
              disbursements.map((disbursement, index) => {
                const firstLetter = disbursement.Grp_Name.charAt(0).toUpperCase();
                const branchName = pickValue(disbursement, [
                  "Branch_Name",
                  "branch_name",
                ]);
                const areaName = pickValue(disbursement, [
                  "Area_Name",
                  "Area",
                  "area_name",
                  "Vill_Name",
                ]);

                return (
                  <tr
                    key={disbursement.Group_Id || index}
                    className="hover:bg-slate-50/80 transition-colors border-b border-gray-100 group"
                  >
                    <td className="px-5 py-3.5 text-center font-semibold text-gray-600 text-[14px]">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-semibold text-[14px]">
                      {formatDate(disbursement.Loan_Date)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium text-[14px]">
                      {branchName || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium text-[14px]">
                      {areaName || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {firstLetter}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 group-hover:text-primary transition-colors whitespace-normal max-w-[250px]">
                            {disbursement.Grp_Name}
                          </div>
                          {disbursement.Co_Name && (
                            <div className="text-xs text-gray-500 font-medium">
                              CO: {disbursement.Co_Name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/5 text-primary border border-primary/10">
                        {disbursement.No_Member}{" "}
                        {disbursement.No_Member === 1 ? "Member" : "Members"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-gray-800 text-[14px]">
                      {formatCurrency(disbursement.Loan_Amt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(disbursement)}
                          className="text-primary hover:text-primary hover:bg-primary/10 h-8 gap-1.5 px-3 font-semibold text-xs"
                        >
                          <Eye className="size-3.5" />
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
