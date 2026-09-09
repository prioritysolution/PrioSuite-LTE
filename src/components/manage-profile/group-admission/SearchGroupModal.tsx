"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getGroupListAPI,
  searchGroupAPI,
} from "@/container/manage-profile/group-admission/GroupAdmissionApi";
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

export const SearchGroupModal = ({ isOpen, onClose, onSelect }: Props) => {
  const { user } = useGlobalContext();
  const [keyword, setKeyword] = useState("");

  const orgId = user?.org_id as number;
  const branchId = user?.branch_id as number;

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["searchGroupModal", orgId, branchId],
    queryFn: async () => {
      try {
        const searched = await searchGroupAPI(orgId, keyword.trim(), branchId);
        const searchedList = extractList(searched);
        if (searchedList.length > 0) {
          return searched;
        }
      } catch {
        // Fall back to GetGroupList if SearchGroup is unavailable.
      }

      return await getGroupListAPI(orgId, branchId);
    },
    enabled: isOpen && !!orgId,
  });

  useEffect(() => {
    if (!isOpen) {
      setKeyword("");
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
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
      <DialogContent className="w-[calc(100%-1.25rem)] sm:max-w-[750px] max-h-[min(92dvh,900px)] p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-xl font-sans flex flex-col [&_[data-slot=dialog-close]]:text-primary-foreground [&_[data-slot=dialog-close]]:hover:text-primary-foreground/80 [&_[data-slot=dialog-close]]:top-3.5 [&_[data-slot=dialog-close]]:right-3.5 sm:[&_[data-slot=dialog-close]]:top-4 sm:[&_[data-slot=dialog-close]]:right-4">
        <DialogHeader className="bg-primary px-4 py-4 sm:px-6 sm:py-5 shrink-0 pr-12">
          <DialogTitle className="text-base sm:text-[20px] font-semibold text-primary-foreground tracking-wide text-left">
            Search Group for Edit
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6 flex-1 min-h-0 flex flex-col overflow-hidden">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by Group No or Name..."
              className="h-10 sm:h-11 min-w-0 flex-1 bg-slate-50 border-gray-200 focus-visible:ring-primary"
            />
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
              <table className="w-full min-w-[480px] text-sm text-left border-collapse">
                <thead className="text-primary font-semibold text-[12px] sm:text-[13px] uppercase sticky top-0 z-20">
                  <tr className="bg-slate-100">
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Group No
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Group Name
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 whitespace-nowrap bg-slate-100">
                      Area
                    </th>
                    <th className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 text-right whitespace-nowrap bg-slate-100">
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
                        <td className="px-3 sm:px-4 py-3 sm:py-3.5 font-bold text-gray-800 whitespace-nowrap">
                          {group.Group_No || "-"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-3.5 font-semibold text-primary">
                          {group.Group_Name || "-"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-gray-600 font-medium whitespace-nowrap">
                          {group.Area || "N/A"}
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-right whitespace-nowrap">
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
                          : "No groups found."}
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
