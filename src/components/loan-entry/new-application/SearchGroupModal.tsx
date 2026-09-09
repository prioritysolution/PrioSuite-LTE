/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getGroupListAPI,
  searchGroupAPI,
} from "@/container/loan-entry/new-application/NewApplicationApi";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (group_no: string) => void;
  initialKeyword?: string;
  branchId?: number;
}

const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const pickValue = (row: any, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "";
};

export const SearchGroupModal = ({
  isOpen,
  onClose,
  onSelect,
  initialKeyword = "",
  branchId: branchIdProp,
}: Props) => {
  const { user } = useGlobalContext();
  const [keyword, setKeyword] = useState(initialKeyword);

  const orgId = user?.org_id as number;
  const branchId = Number(branchIdProp || user?.branch_id || 0);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["loanEntrySearchGroup", orgId, branchId],
    queryFn: async () => {
      const searchKeyword = keyword.trim();

      if (searchKeyword) {
        try {
          const searched = await searchGroupAPI(orgId, searchKeyword, branchId);
          const searchedList = extractList(searched);
          if (searchedList.length > 0) {
            return searched;
          }
        } catch {
          // Fall back to GetGroupList if SearchGroup is unavailable.
        }
      }

      return await getGroupListAPI(orgId, branchId);
    },
    enabled: isOpen && !!orgId && !!branchId,
  });

  useEffect(() => {
    if (isOpen) {
      setKeyword(initialKeyword || "");
    } else {
      setKeyword("");
    }
  }, [isOpen, initialKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !branchId) return;
    refetch();
  };

  const groupList = extractList(data).map((group: any) => ({
    ...group,
    Group_Id: group?.Group_Id ?? group?.Grp_Id ?? group?.grp_id,
    Group_No: pickValue(group, ["Group_No", "Grp_No", "grp_no"]),
    Group_Name: pickValue(group, ["Group_Name", "Grp_Name", "grp_name"]),
    Area: pickValue(group, ["Area", "Area_Name", "area_name", "Vill_Name"]),
  }));

  const searchValue = keyword.trim().toLowerCase();
  const filteredList = !searchValue
    ? groupList
    : groupList.filter(
        (group) =>
          group.Group_No?.toLowerCase().includes(searchValue) ||
          group.Group_Name?.toLowerCase().includes(searchValue) ||
          group.Area?.toLowerCase().includes(searchValue),
      );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-0 shadow-2xl rounded-xl font-sans">
        <DialogHeader className="bg-primary px-6 py-5">
          <DialogTitle className="text-[20px] font-semibold text-primary-foreground tracking-wide">
            Search Group
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 bg-white space-y-6">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by Group No or Name..."
              className="h-11 bg-slate-50 border-gray-200 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              disabled={isFetching || !orgId || !branchId}
              className="h-11 px-6 bg-primary"
            >
              {isFetching ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
            </Button>
          </form>

          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-primary font-semibold text-[13px] uppercase sticky top-0 z-20">
                  <tr className="bg-slate-100">
                    <th className="px-4 py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Group No
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Group Name
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Area
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 text-right whitespace-nowrap bg-slate-100">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isFetching ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <Loader2
                          className="animate-spin mx-auto text-primary"
                          size={24}
                        />
                      </td>
                    </tr>
                  ) : filteredList.length > 0 ? (
                    filteredList.map((group: any) => (
                      <tr
                        key={group.Group_Id || group.Group_No}
                        className="hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <td className="px-4 py-3.5 font-bold text-gray-800">
                          {group.Group_No || "-"}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-primary">
                          {group.Group_Name || "-"}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 font-medium">
                          {group.Area || "N/A"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onSelect(String(group.Group_No))}
                            className="h-8 px-4 text-xs font-bold bg-secondary text-primary hover:bg-secondary/80"
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-12 text-center text-gray-500 font-medium"
                      >
                        {keyword.trim()
                          ? "No groups found for this search."
                          : "Search to display group results."}
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
