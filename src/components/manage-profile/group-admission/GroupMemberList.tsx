/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { Loader2, Search, Users, X } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import { getGroupMemberListAPI } from "@/container/manage-profile/group-admission/GroupAdmissionApi";
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

interface Props {
  groupId: number | string;
}

interface GroupMemberRow {
  key: string;
  memberNo: string;
  memberName: string;
  guardianName: string;
  area: string;
  mobile: string;
  admissionDate: string;
  status: string;
}

const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const pickValue = (row: any, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return isValid(date) ? format(date, "dd-MM-yyyy") : value;
};

const toStatusLabel = (value: string) => {
  if (value === "1") return "Active";
  if (value === "0") return "Inactive";
  return value;
};

// Rows can repeat per loan account, so they are de-duplicated per member.
const toMemberRows = (list: any[]): GroupMemberRow[] => {
  const seen = new Set<string>();
  const rows: GroupMemberRow[] = [];
  list.forEach((item, index) => {
    const memberId = pickValue(item, ["Member_Id", "Mem_Id", "member_id"]);
    const memberNo = pickValue(item, ["Member_No", "Mem_No", "member_no"]);
    const key = memberId || memberNo || `row-${index}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({
      key,
      memberNo,
      memberName: pickValue(item, ["Member_Name", "Mem_Name", "member_name"]),
      guardianName: pickValue(item, [
        "FatHusb_Name",
        "Guardian_Name",
        "Gurdain_Name",
      ]),
      area: pickValue(item, ["Area_Name", "Area", "Vill_Name", "area_name"]),
      mobile: pickValue(item, [
        "Mobile_No",
        "Mob_No",
        "Mobile",
        "Phone_No",
        "Contact_No",
      ]),
      admissionDate: formatDate(
        pickValue(item, ["Adm_Date", "Admission_Date", "Join_Date"]),
      ),
      status: toStatusLabel(
        pickValue(item, ["Mem_Status", "Status_Name", "Member_Status", "Status"]),
      ),
    });
  });
  return rows;
};

const StatusBadge = ({ status }: { status: string }) => {
  if (!status) return <span className="text-gray-400">—</span>;
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap",
        isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
      )}
    >
      {status}
    </span>
  );
};

type OptionalColumn = "guardianName" | "area" | "mobile" | "admissionDate" | "status";

const OPTIONAL_COLUMNS: { key: OptionalColumn; label: string }[] = [
  { key: "guardianName", label: "Guardian Name" },
  { key: "area", label: "Area" },
  { key: "mobile", label: "Mobile No" },
  { key: "admissionDate", label: "Admission Date" },
  { key: "status", label: "Status" },
];

export const GroupMemberList = ({ groupId }: Props) => {
  const { user } = useGlobalContext();
  const orgId = user?.org_id as number;
  const [search, setSearch] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["groupAdmissionGroupMembers", orgId, groupId],
    queryFn: () => getGroupMemberListAPI(orgId, groupId),
    enabled: !!orgId && !!groupId,
  });

  const members = useMemo(() => toMemberRows(extractList(data)), [data]);

  // Only show optional columns the API actually returned data for.
  const visibleColumns = useMemo(
    () =>
      OPTIONAL_COLUMNS.filter((column) =>
        members.some((member) => member[column.key]),
      ),
    [members],
  );

  const query = search.trim().toLowerCase();
  const filteredMembers = useMemo(() => {
    if (!query) return members;
    return members.filter((member) =>
      [member.memberNo, member.memberName, member.guardianName, member.mobile]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [members, query]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-primary text-lg">
              Group Members
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Members connected to this group
            </p>
          </div>
        </div>

        {members.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Search member name / no..."
                aria-label="Search members"
                autoComplete="off"
                className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:text-right">
              {query && `${filteredMembers.length} of `}
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {isFetching && members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[160px] rounded-xl border border-gray-100 bg-slate-50/50 gap-3 text-primary">
            <Loader2 className="h-7 w-7 animate-spin" />
            <span className="text-sm font-semibold">Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center h-[140px] rounded-xl border border-dashed border-gray-200 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              No members are connected to this group yet.
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex items-center justify-center h-[140px] rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">
              No members match &quot;{search.trim()}&quot;.
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
                      <TableHead className="min-w-[180px] font-bold text-primary">
                        Member Name
                      </TableHead>
                      {visibleColumns.map((column) => (
                        <TableHead
                          key={column.key}
                          className="min-w-[120px] font-bold text-primary"
                        >
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member, index) => (
                      <TableRow key={member.key}>
                        <TableCell className="text-center text-gray-500 font-semibold">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">
                          {member.memberNo || "—"}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {member.memberName || "—"}
                        </TableCell>
                        {visibleColumns.map((column) => (
                          <TableCell
                            key={column.key}
                            className="text-gray-700 whitespace-nowrap"
                          >
                            {column.key === "status" ? (
                              <StatusBadge status={member.status} />
                            ) : (
                              member[column.key] || "—"
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              {isFetching && (
                <div
                  className="flex items-center justify-center gap-2 border-t border-gray-100 py-2 text-xs font-medium text-primary"
                  aria-live="polite"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Refreshing...
                </div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredMembers.map((member, index) => (
                <div
                  key={member.key}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">
                        #{index + 1} · {member.memberNo || "—"}
                      </p>
                      <p className="font-semibold text-primary truncate">
                        {member.memberName || "—"}
                      </p>
                    </div>
                    {member.status && <StatusBadge status={member.status} />}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    {visibleColumns
                      .filter((column) => column.key !== "status")
                      .map((column) => (
                        <div key={column.key} className="min-w-0">
                          <p className="text-xs text-gray-400">{column.label}</p>
                          <p className="font-medium text-gray-800 break-words">
                            {member[column.key] || "—"}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupMemberList;
