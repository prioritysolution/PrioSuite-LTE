"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMemberListAPI,
  searchMemberAPI,
} from "@/container/manage-profile/member-profile/MemberProfileApi";
import { useGlobalContext } from "@/context/GlobalContext";
import getCookieData from "@/lib/getCookieData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mem_no: string) => void;
  isPending: boolean;
}

const normalizeKey = (key: string) =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const looksLikeMember = (item: any) => {
  if (!item || typeof item !== "object") return false;
  const keys = Object.keys(item).map(normalizeKey);
  return keys.some((key) =>
    [
      "memberid",
      "memid",
      "memberno",
      "memno",
      "membershipno",
      "membername",
      "memname",
      "membercode",
      "memcode",
    ].includes(key),
  );
};

const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.List,
    res?.Members,
    res?.data?.Members,
    res?.data,
    res,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || !candidate.length) continue;
    if (looksLikeMember(candidate[0])) return candidate;
  }

  // Deep scan for a member-looking array
  const walk = (node: any, depth = 0): any[] => {
    if (depth > 5 || node == null) return [];
    if (Array.isArray(node)) {
      if (node.length && looksLikeMember(node[0])) return node;
      return [];
    }
    if (typeof node !== "object") return [];
    for (const value of Object.values(node)) {
      const found = walk(value, depth + 1);
      if (found.length) return found;
    }
    return [];
  };

  return walk(res);
};

const pickValue = (row: any, keys: string[]) => {
  if (!row || typeof row !== "object") return "";

  for (const key of keys) {
    const direct = row[key];
    if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
      return String(direct).trim();
    }
  }

  const wanted = keys.map(normalizeKey);
  for (const key of Object.keys(row)) {
    if (!wanted.includes(normalizeKey(key))) continue;
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
};

const mapMemberRow = (member: any) => {
  const memberNo = pickValue(member, [
    "Member_No",
    "Mem_No",
    "member_no",
    "mem_no",
    "Membership_No",
    "MemNo",
    "MemberNo",
    "Mem_Code",
    "Member_Code",
    "Client_No",
    "Acc_No",
  ]);

  const memberName = pickValue(member, [
    "Member_Name",
    "Mem_Name",
    "member_name",
    "mem_name",
    "Full_Name",
    "Client_Name",
    "Name",
  ]);

  const areaName = pickValue(member, [
    "Area_Name",
    "Area",
    "Vill_Name",
    "Village",
    "area_name",
    "Grp_Area",
  ]);

  const status = pickValue(member, [
    "Mem_Status",
    "Status_Name",
    "Status",
    "mem_status",
    "Member_Status",
    "Active_Status",
  ]);

  const memberId =
    member?.Member_Id ??
    member?.Mem_Id ??
    member?.mem_id ??
    member?.Id ??
    member?.id;

  return {
    ...member,
    Member_Id: memberId,
    Member_No: memberNo,
    Member_Name: memberName,
    Area_Name: areaName,
    Mem_Status: status,
    selectValue: memberNo || (memberId != null ? String(memberId) : ""),
  };
};

export const SearchMemberModal = ({
  isOpen,
  onClose,
  onSelect,
  isPending,
}: Props) => {
  const { user } = useGlobalContext();
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const orgId =
    Number(user?.org_id) || Number(getCookieData("priobank-lite-org_id")) || 0;
  const branchId =
    Number(user?.branch_id) ||
    Number(getCookieData("priobank-lite-branch_id")) ||
    0;

  const searchTerm = submittedKeyword.trim();

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["searchMemberModal", orgId, branchId, searchTerm],
    queryFn: async () => {
      if (searchTerm) {
        try {
          const searched = await searchMemberAPI(
            orgId,
            searchTerm,
            branchId,
            1,
          );
          const searchedList = extractList(searched);
          if (searchedList.length > 0) return searchedList;
        } catch {
          // Fall through to member list + local filter.
        }
      }

      try {
        return extractList(await getMemberListAPI(orgId, branchId));
      } catch {
        return [];
      }
    },
    enabled: isOpen && !!orgId,
  });

  useEffect(() => {
    if (!isOpen) {
      setKeyword("");
      setSubmittedKeyword("");
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setSubmittedKeyword(keyword.trim());
    // If keyword unchanged, force refetch
    if (keyword.trim() === submittedKeyword.trim()) {
      refetch();
    }
  };

  const membersList = useMemo(
    () =>
      (Array.isArray(data) ? data : extractList(data))
        .map(mapMemberRow)
        .filter(
          (member) =>
            member.Member_No || member.Member_Name || member.Member_Id,
        ),
    [data],
  );

  // Live client-side filter while typing (dynamic)
  const liveFilter = keyword.trim().toLowerCase();
  const filteredList = useMemo(() => {
    if (!liveFilter) return membersList;
    return membersList.filter((member) => {
      const haystack = [
        member.Member_No,
        member.Member_Name,
        member.Area_Name,
        member.Mem_Status,
        member.selectValue,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(liveFilter);
    });
  }, [membersList, liveFilter]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-[calc(100%-1.25rem)] sm:max-w-[750px] max-h-[min(92dvh,900px)] p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-xl font-sans flex flex-col [&_[data-slot=dialog-close]]:text-primary-foreground [&_[data-slot=dialog-close]]:hover:text-primary-foreground/80 [&_[data-slot=dialog-close]]:top-3.5 [&_[data-slot=dialog-close]]:right-3.5 sm:[&_[data-slot=dialog-close]]:top-4 sm:[&_[data-slot=dialog-close]]:right-4">
        <DialogHeader className="bg-primary px-4 py-4 sm:px-6 sm:py-5 shrink-0 pr-12">
          <DialogTitle className="text-base sm:text-[20px] font-semibold text-primary-foreground tracking-wide text-left">
            Search Member
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6 flex-1 min-h-0 flex flex-col overflow-hidden">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <div className="relative flex-1 min-w-0">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by Member No or Name..."
                className="h-10 sm:h-11 pr-9 bg-slate-50 border-gray-200 focus-visible:ring-primary"
              />
              {keyword ? (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setSubmittedKeyword("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              ) : null}
            </div>
            <Button
              type="submit"
              disabled={isFetching || !orgId}
              className="h-10 sm:h-11 w-10 sm:w-auto sm:px-6 bg-primary shrink-0"
              aria-label="Search"
            >
              {isFetching ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
            </Button>
          </form>
          <div className="border border-gray-100 rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 max-h-[min(55dvh,350px)] sm:max-h-[350px] overflow-auto custom-scrollbar">
              <table className="w-full min-w-[560px] text-sm text-left border-collapse">
                <thead className="text-primary font-semibold text-[12px] sm:text-[13px] uppercase sticky top-0 z-20">
                  <tr className="bg-slate-100">
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Member No
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Member Name
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Area
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 text-right whitespace-nowrap bg-slate-100">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isFetching ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <Loader2
                          className="animate-spin mx-auto text-primary"
                          size={24}
                        />
                      </td>
                    </tr>
                  ) : filteredList.length > 0 ? (
                    filteredList.map((member: any, index: number) => {
                      const statusText = member.Mem_Status || "Unknown";
                      const isActive =
                        String(statusText).toLowerCase() === "active" ||
                        String(statusText) === "1";

                      return (
                        <tr
                          key={
                            member.Member_Id ||
                            member.Member_No ||
                            member.selectValue ||
                            index
                          }
                          className="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <td className="px-3 sm:px-4 py-3 sm:py-3.5 font-bold text-gray-800 whitespace-nowrap">
                            {member.Member_No || "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-3.5 font-semibold text-primary">
                            {member.Member_Name || "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-gray-600 font-medium whitespace-nowrap">
                            {member.Area_Name || "N/A"}
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {statusText}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-right whitespace-nowrap">
                            <Button
                              type="button"
                              size="sm"
                              disabled={isPending || !member.selectValue}
                              onClick={() =>
                                onSelect(String(member.selectValue))
                              }
                              className="h-8 px-4 text-xs font-bold bg-secondary text-primary hover:bg-secondary/80"
                            >
                              Select
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-gray-500 font-medium"
                      >
                        {keyword.trim()
                          ? "No members found for this search."
                          : "No members found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
