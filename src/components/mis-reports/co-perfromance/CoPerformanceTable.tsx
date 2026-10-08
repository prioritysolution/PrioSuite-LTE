"use client";

import React, { useMemo, useState } from "react";
import {
  formatAmount,
  formatPct,
} from "@/container/mis-reports/co-perfromance/CoPerformanceApi";
import {
  PerfRow,
  PerfSummary,
} from "@/container/mis-reports/co-perfromance/CoPerformanceType";

export const gradeClass = (grade: string | null) => {
  if (grade === "A") return "bg-emerald-50 text-emerald-700";
  if (grade === "B") return "bg-lime-50 text-lime-700";
  if (grade === "C") return "bg-amber-50 text-amber-800";
  if (grade === "D") return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-500";
};

export const collClass = (value: number | null) => {
  if (value === null) return "text-gray-400";
  if (value >= 95) return "text-emerald-700";
  if (value >= 85) return "text-lime-700";
  if (value >= 70) return "text-amber-700";
  return "text-red-600";
};

export const parClass = (value: number | null) => {
  if (value === null) return "text-gray-400";
  if (value <= 5) return "text-emerald-700";
  if (value <= 10) return "text-amber-700";
  return "text-red-600";
};

export const isQuietRow = (row: PerfRow) =>
  !row.activeLoanCount &&
  !row.disbAmount &&
  !row.outstanding &&
  !row.netDemand &&
  !row.collAmount;

const num = (value: number) => (
  <td className="px-2 py-2 text-right tabular-nums whitespace-nowrap">{value || "-"}</td>
);
const amt = (value: number) => (
  <td className="px-2 py-2 text-right tabular-nums whitespace-nowrap">{formatAmount(value)}</td>
);

const CoPerformanceTable = ({
  summary,
  rows,
  grouped,
  nameHeader,
  canDrill,
  onDrill,
}: {
  summary: PerfSummary;
  rows: PerfRow[];
  grouped: boolean;
  nameHeader: string;
  canDrill: boolean;
  onDrill: (row: PerfRow) => void;
}) => {
  const [hideQuiet, setHideQuiet] = useState(false);
  const [more, setMore] = useState(false);
  const [sortKey, setSortKey] = useState<string>("perfRank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const visible = useMemo(() => {
    const list = hideQuiet ? rows.filter((row) => !isQuietRow(row) && row.isActive !== 0) : [...rows];
    return list.sort((a, b) => {
      const left = sortKey === "name" ? a.keyName : (a as any)[sortKey];
      const right = sortKey === "name" ? b.keyName : (b as any)[sortKey];
      const aNull = left === null || left === undefined;
      const bNull = right === null || right === undefined;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      if (left < right) return sortDir === "asc" ? -1 : 1;
      if (left > right) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [hideQuiet, rows, sortDir, sortKey]);

  const toggle = (key: string) => {
    if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  const head = (label: string, key: string) => (
    <button type="button" className="font-semibold" onClick={() => toggle(key)}>
      {label}
    </button>
  );

  const sections = grouped
    ? visible.reduce<{ branch: string; rows: PerfRow[] }[]>((acc, row) => {
        const last = acc[acc.length - 1];
        if (!last || last.branch !== row.branchName) {
          acc.push({ branch: row.branchName || "Branch", rows: [row] });
        } else last.rows.push(row);
        return acc;
      }, [])
    : [{ branch: "", rows: visible }];

  const renderRow = (row: PerfRow) => (
    <tr
      key={`${row.branchId}-${row.keyId}-${row.keyName}`}
      className={`border-b border-gray-100 ${isQuietRow(row) ? "text-gray-400" : ""} ${
        canDrill ? "cursor-pointer hover:bg-primary/5" : ""
      }`}
      onClick={() => canDrill && onDrill(row)}
    >
      <td className="px-2 py-2">{row.perfRank ?? "-"}</td>
      <td className="px-2 py-2" title={row.contactNumber || undefined}>
        <div className="font-medium">{row.keyName}</div>
        <div className="text-xs text-gray-500">
          {row.keyCode}
          {row.collectionDay ? ` · ${row.collectionDay}` : ""}
        </div>
      </td>
      {num(row.activeGroupCount)}
      {num(row.activeMemberCount)}
      {num(row.activeLoanCount)}
      {amt(row.disbAmount)}
      {amt(row.outstanding)}
      {amt(row.netDemand)}
      {amt(row.collAmount)}
      <td className={`px-2 py-2 text-right font-semibold ${collClass(row.collPct)}`}>
        {formatPct(row.collPct)}
      </td>
      {amt(row.overdueAmount)}
      <td className={`px-2 py-2 text-right font-semibold ${parClass(row.parPct)}`}>
        {formatPct(row.parPct)}
      </td>
      <td className="px-2 py-2 text-center">
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${gradeClass(row.grade)}`}>
          {row.grade || "–"}
        </span>
      </td>
      {more && (
        <>
          {num(row.newGroupCount)}
          {num(row.newMemberCount)}
          {num(row.closedLoanCount)}
          {amt(row.openingOutstanding)}
          {amt(row.arrearDemand)}
          {amt(row.currentDemand)}
          {amt(row.collAdvance)}
          {amt(row.par0_30)}
          {amt(row.par31_60)}
          {amt(row.par61_90)}
          {amt(row.parAbove90)}
        </>
      )}
    </tr>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-2 text-xs">
        <label className="inline-flex items-center gap-2 font-medium text-gray-600">
          <input type="checkbox" checked={hideQuiet} onChange={(event) => setHideQuiet(event.target.checked)} />
          Hide inactive Sahayika
        </label>
        <button type="button" className="font-semibold text-primary" onClick={() => setMore((open) => !open)}>
          {more ? "Hide extra columns" : "More columns"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-xs tracking-wide text-gray-500 uppercase">
              <th className="px-2 py-2 text-left">{head("#", "perfRank")}</th>
              <th className="px-2 py-2 text-left">{head(nameHeader, "name")}</th>
              <th className="px-2 py-2 text-right">{head("Groups", "activeGroupCount")}</th>
              <th className="px-2 py-2 text-right">{head("Members", "activeMemberCount")}</th>
              <th className="px-2 py-2 text-right">{head("Loans", "activeLoanCount")}</th>
              <th className="px-2 py-2 text-right">{head("Disbursed", "disbAmount")}</th>
              <th className="px-2 py-2 text-right">{head("Outstanding", "outstanding")}</th>
              <th className="px-2 py-2 text-right">{head("Net Demand", "netDemand")}</th>
              <th className="px-2 py-2 text-right">{head("Collection", "collAmount")}</th>
              <th className="px-2 py-2 text-right">{head("Coll. %", "collPct")}</th>
              <th className="px-2 py-2 text-right">{head("Overdue", "overdueAmount")}</th>
              <th className="px-2 py-2 text-right">{head("PAR %", "parPct")}</th>
              <th className="px-2 py-2 text-center">{head("Grade", "grade")}</th>
              {more && (
                <>
                  <th className="px-2 py-2 text-right">New Groups</th>
                  <th className="px-2 py-2 text-right">New Members</th>
                  <th className="px-2 py-2 text-right">Closed</th>
                  <th className="px-2 py-2 text-right">Opening OS</th>
                  <th className="px-2 py-2 text-right">Arrear</th>
                  <th className="px-2 py-2 text-right">Current</th>
                  <th className="px-2 py-2 text-right">Advance</th>
                  <th className="px-2 py-2 text-right">PAR 0-30</th>
                  <th className="px-2 py-2 text-right">PAR 31-60</th>
                  <th className="px-2 py-2 text-right">PAR 61-90</th>
                  <th className="px-2 py-2 text-right">PAR &gt;90</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={section.branch || "all"}>
                {grouped && section.branch && (
                  <tr className="bg-gray-50">
                    <td colSpan={more ? 24 : 13} className="px-2 py-1.5 text-xs font-bold tracking-wide text-gray-600 uppercase">
                      {section.branch}
                    </td>
                  </tr>
                )}
                {section.rows.map(renderRow)}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td className="px-2 py-2" />
              <td className="px-2 py-2">Total</td>
              {num(summary.activeGroupCount)}
              {num(summary.activeMemberCount)}
              {num(summary.activeLoanCount)}
              {amt(summary.disbAmount)}
              {amt(summary.outstanding)}
              {amt(summary.netDemand)}
              {amt(summary.collAmount)}
              <td className="px-2 py-2 text-right">{formatPct(summary.collPct)}</td>
              {amt(summary.overdueAmount)}
              <td className="px-2 py-2 text-right">{formatPct(summary.parPct)}</td>
              <td className="px-2 py-2 text-center">{summary.grade || "–"}</td>
              {more && (
                <>
                  {num(summary.newGroupCount)}
                  {num(summary.newMemberCount)}
                  {num(summary.closedLoanCount)}
                  {amt(summary.openingOutstanding)}
                  {amt(summary.arrearDemand)}
                  {amt(summary.currentDemand)}
                  {amt(summary.collAdvance)}
                  {amt(summary.par0_30)}
                  {amt(summary.par31_60)}
                  {amt(summary.par61_90)}
                  {amt(summary.parAbove90)}
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default CoPerformanceTable;
