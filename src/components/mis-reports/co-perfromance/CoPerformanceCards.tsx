"use client";

import React from "react";
import { formatMoney, formatPct } from "@/container/mis-reports/co-perfromance/CoPerformanceApi";
import { PerfRow } from "@/container/mis-reports/co-perfromance/CoPerformanceType";
import { collClass, gradeClass, isQuietRow, parClass } from "./CoPerformanceTable";

const medal = (rank: number | null) => {
  if (rank === 1) return "bg-amber-400 text-white";
  if (rank === 2) return "bg-slate-400 text-white";
  if (rank === 3) return "bg-orange-700 text-white";
  return "bg-gray-100 text-gray-600";
};

const CoPerformanceCards = ({
  rows,
  canDrill,
  onDrill,
}: {
  rows: PerfRow[];
  canDrill: boolean;
  onDrill: (row: PerfRow) => void;
}) => (
  <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
    {rows.map((row) => (
      <button
        key={`${row.branchId}-${row.keyId}`}
        type="button"
        disabled={!canDrill}
        onClick={() => canDrill && onDrill(row)}
        className={`rounded-xl border border-gray-100 p-4 text-left shadow-sm ${
          isQuietRow(row) ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900">{row.keyName}</p>
            <p className="text-xs text-gray-500">{row.keyCode || row.branchName}</p>
          </div>
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${medal(row.perfRank)}`}>
            {row.perfRank ?? "–"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-2xl font-bold ${collClass(row.collPct)}`}>{formatPct(row.collPct)}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${gradeClass(row.grade)}`}>
            {row.grade || "–"}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>
            <p>Outstanding</p>
            <p className="font-semibold text-gray-900">{formatMoney(row.outstanding)}</p>
          </div>
          <div>
            <p>Disbursed</p>
            <p className="font-semibold text-gray-900">{formatMoney(row.disbAmount)}</p>
          </div>
          <div>
            <p className={parClass(row.parPct)}>PAR</p>
            <p className={`font-semibold ${parClass(row.parPct)}`}>{formatPct(row.parPct)}</p>
          </div>
        </div>
      </button>
    ))}
  </div>
);

export default CoPerformanceCards;
