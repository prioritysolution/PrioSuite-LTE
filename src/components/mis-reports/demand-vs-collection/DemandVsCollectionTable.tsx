"use client";

import React, { useMemo, useState } from "react";
import {
  formatAmount,
  formatApiDate,
  formatPct,
} from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionApi";
import {
  AmountBlock,
  GroupRow,
  MemberRow,
  ReportSummary,
  ReportView,
} from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionType";

const pctClass = (value: number | null) => {
  if (value === null) return "bg-gray-100 text-gray-500";
  if (value >= 95) return "bg-emerald-50 text-emerald-700";
  if (value >= 80) return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-700";
};

const statusClass = (status: string) => {
  if (status === "Fully Collected") return "bg-emerald-50 text-emerald-700";
  if (status === "Partially Collected") return "bg-amber-50 text-amber-800";
  if (status === "Advance") return "bg-blue-50 text-blue-700";
  return "bg-red-50 text-red-700";
};

const cell = (value: number) => (
  <td className="px-2 py-2 text-right tabular-nums whitespace-nowrap">
    {formatAmount(value)}
  </td>
);

const Pct = ({ value }: { value: number | null }) => (
  <td className="px-2 py-2 text-right">
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pctClass(value)}`}>
      {formatPct(value)}
    </span>
  </td>
);

type SortKey = keyof AmountBlock | "name";

const DemandVsCollectionTable = ({
  view,
  summary,
  rows,
  memberRows,
  onDrill,
}: {
  view: ReportView;
  summary: ReportSummary;
  rows: GroupRow[];
  memberRows: MemberRow[];
  onDrill: (row: GroupRow) => void;
}) => {
  const [sortKey, setSortKey] = useState<SortKey | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<"all" | "overdue" | "none" | "advance">("all");
  const [more, setMore] = useState(false);
  const nameHeader =
    view === "branch" ? "Branch" : view === "group" ? "Group" : view === "member" ? "Member" : "Sahayika";

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const sortedGroups = useMemo(() => {
    const list = [...rows];
    if (!sortKey) return list;
    return list.sort((a, b) => {
      const left = sortKey === "name" ? a.keyName : Number(a[sortKey] ?? 0);
      const right = sortKey === "name" ? b.keyName : Number(b[sortKey] ?? 0);
      if (left < right) return sortDir === "asc" ? -1 : 1;
      if (left > right) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortDir, sortKey]);

  const members = useMemo(() => {
    const text = query.trim().toLowerCase();
    return memberRows.filter((row) => {
      if (chip === "overdue" && row.overdueAmount <= 0) return false;
      if (chip === "none" && row.collStatus !== "Not Collected") return false;
      if (chip === "advance" && row.collStatus !== "Advance") return false;
      if (!text) return true;
      return (
        row.memberName.toLowerCase().includes(text) ||
        row.memberNo.toLowerCase().includes(text) ||
        row.accountNo.toLowerCase().includes(text)
      );
    });
  }, [chip, memberRows, query]);

  const headButton = (label: string, key: SortKey) => (
    <button type="button" className="font-semibold" onClick={() => toggleSort(key)}>
      {label}
    </button>
  );

  return (
    <div>
      {view === "member" && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or member no."
            className="h-9 rounded-md border border-gray-200 px-3 text-sm"
          />
          {(
            [
              ["all", "All"],
              ["overdue", "Overdue only"],
              ["none", "Not Collected"],
              ["advance", "Advance"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChip(id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                chip === id ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-end px-4 pb-2">
        <button
          type="button"
          onClick={() => setMore((open) => !open)}
          className="text-xs font-semibold text-primary"
        >
          {more ? "Hide extra columns" : "More columns"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-2 py-2 text-left" rowSpan={2}>
                {headButton(nameHeader, "name")}
              </th>
              <th className="px-2 py-2 text-center" colSpan={more ? 6 : 4}>
                Demand
              </th>
              <th className="px-2 py-2 text-center" colSpan={more ? 7 : 4}>
                Collection
              </th>
              <th className="px-2 py-2 text-right" rowSpan={2}>
                {headButton("Overdue", "overdueAmount")}
              </th>
              <th className="px-2 py-2 text-right" rowSpan={2}>
                {headButton("Coll. %", "collPct")}
              </th>
              {more && (
                <>
                  <th className="px-2 py-2 text-right" rowSpan={2}>
                    Closing Adv.
                  </th>
                  <th className="px-2 py-2 text-right" rowSpan={2}>
                    Outstanding
                  </th>
                </>
              )}
            </tr>
            <tr className="border-b border-gray-200 text-[11px] tracking-wide text-gray-500 uppercase">
              <th className="px-2 py-1 text-right">{headButton("Arrear", "arrearDemand")}</th>
              <th className="px-2 py-1 text-right">{headButton("Current", "currentDemand")}</th>
              {more && (
                <>
                  <th className="px-2 py-1 text-right">Prn</th>
                  <th className="px-2 py-1 text-right">Int</th>
                </>
              )}
              <th className="px-2 py-1 text-right">{headButton("Adv.", "openingAdvance")}</th>
              <th className="px-2 py-1 text-right">{headButton("Net", "netDemand")}</th>
              <th className="px-2 py-1 text-right">{headButton("Arrear", "collArrear")}</th>
              <th className="px-2 py-1 text-right">{headButton("Current", "collCurrent")}</th>
              <th className="px-2 py-1 text-right">{headButton("Adv.", "collAdvance")}</th>
              <th className="px-2 py-1 text-right">{headButton("Total", "collAmount")}</th>
              {more && (
                <>
                  <th className="px-2 py-1 text-right">Prn</th>
                  <th className="px-2 py-1 text-right">Int</th>
                  <th className="px-2 py-1 text-right">Penal</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {view === "member"
              ? members.map((row) => (
                  <tr key={row.accountId} className="border-b border-gray-100">
                    <td className="px-2 py-2">
                      <div className="font-medium">
                        {row.memberName || "-"}
                        {row.memberNo ? ` (${row.memberNo})` : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        {row.accountNo || row.accountId} · {row.instlCount} instl
                        {row.lastCollDate ? ` · Last ${formatApiDate(row.lastCollDate)}` : ""}
                      </div>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(row.collStatus)}`}>
                        {row.collStatus || "-"}
                      </span>
                    </td>
                    {cell(row.arrearDemand)}
                    {cell(row.currentDemand)}
                    {more && (
                      <>
                        {cell(row.currentPrnDemand)}
                        {cell(row.currentIntDemand)}
                      </>
                    )}
                    {cell(row.openingAdvance)}
                    {cell(row.netDemand)}
                    {cell(row.collArrear)}
                    {cell(row.collCurrent)}
                    {cell(row.collAdvance)}
                    {cell(row.collAmount)}
                    {more && (
                      <>
                        {cell(row.collPrn)}
                        {cell(row.collIntt)}
                        {cell(row.collPenal)}
                      </>
                    )}
                    {cell(row.overdueAmount)}
                    <Pct value={row.collPct} />
                    {more && (
                      <>
                        {cell(row.closingAdvance)}
                        {cell(row.outstanding)}
                      </>
                    )}
                  </tr>
                ))
              : sortedGroups.map((row) => (
                  <tr
                    key={`${row.keyId}-${row.keyName}`}
                    className="cursor-pointer border-b border-gray-100 hover:bg-primary/5"
                    onClick={() => onDrill(row)}
                  >
                    <td className="px-2 py-2 font-medium">
                      {row.keyName}
                      {row.keyCode ? (
                        <span className="ml-1 text-xs text-gray-500">{row.keyCode}</span>
                      ) : null}
                    </td>
                    {cell(row.arrearDemand)}
                    {cell(row.currentDemand)}
                    {more && (
                      <>
                        {cell(row.currentPrnDemand)}
                        {cell(row.currentIntDemand)}
                      </>
                    )}
                    {cell(row.openingAdvance)}
                    {cell(row.netDemand)}
                    {cell(row.collArrear)}
                    {cell(row.collCurrent)}
                    {cell(row.collAdvance)}
                    {cell(row.collAmount)}
                    {more && (
                      <>
                        {cell(row.collPrn)}
                        {cell(row.collIntt)}
                        {cell(row.collPenal)}
                      </>
                    )}
                    {cell(row.overdueAmount)}
                    <Pct value={row.collPct} />
                    {more && (
                      <>
                        {cell(row.closingAdvance)}
                        {cell(row.outstanding)}
                      </>
                    )}
                  </tr>
                ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td className="px-2 py-2">Total</td>
              {cell(summary.arrearDemand)}
              {cell(summary.currentDemand)}
              {more && (
                <>
                  {cell(summary.currentPrnDemand)}
                  {cell(summary.currentIntDemand)}
                </>
              )}
              {cell(summary.openingAdvance)}
              {cell(summary.netDemand)}
              {cell(summary.collArrear)}
              {cell(summary.collCurrent)}
              {cell(summary.collAdvance)}
              {cell(summary.collAmount)}
              {more && (
                <>
                  {cell(summary.collPrn)}
                  {cell(summary.collIntt)}
                  {cell(summary.collPenal)}
                </>
              )}
              {cell(summary.overdueAmount)}
              <Pct value={summary.collPct} />
              {more && (
                <>
                  {cell(summary.closingAdvance)}
                  {cell(summary.outstanding)}
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DemandVsCollectionTable;
