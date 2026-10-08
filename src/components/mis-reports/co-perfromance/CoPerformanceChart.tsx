"use client";

import React from "react";
import { formatAmount, formatPct } from "@/container/mis-reports/co-perfromance/CoPerformanceApi";
import { MonthRow } from "@/container/mis-reports/co-perfromance/CoPerformanceType";

const CoPerformanceChart = ({ rows }: { rows: MonthRow[] }) => {
  const width = Math.max(rows.length * 72, 640);
  const height = 280;
  const pad = { top: 16, bottom: 36 };
  const innerH = height - pad.top - pad.bottom;
  const maxBar = Math.max(1, ...rows.map((row) => Math.max(row.disbAmount, row.demandAmount, row.collAmount)));
  const maxPct = Math.max(100, ...rows.map((row) => row.collVsDuePct || 0));
  const line = rows
    .map((row, index) => {
      const x = 28 + index * 72;
      const y = pad.top + innerH - ((row.collVsDuePct || 0) / maxPct) * innerH;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-indigo-500" /> Disbursed</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-sky-500" /> Demand</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-emerald-500" /> Collection</span>
        <span className="inline-flex items-center gap-1"><span className="h-0.5 w-4 bg-amber-600" /> Coll. vs due %</span>
      </div>
      <div className="overflow-x-auto">
        <svg width={width} height={height} role="img" aria-label="Month-wise CO performance">
          {rows.map((row, index) => {
            const x = index * 72;
            const bar = (value: number, offset: number, color: string) => {
              const h = (value / maxBar) * innerH;
              return (
                <rect x={x + offset} y={pad.top + innerH - h} width={14} height={h} className={color}>
                  <title>{formatAmount(value)}</title>
                </rect>
              );
            };
            return (
              <g key={row.monthKey || row.monthName}>
                {bar(row.disbAmount, 8, "fill-indigo-500")}
                {bar(row.demandAmount, 24, "fill-sky-500")}
                {bar(row.collAmount, 40, "fill-emerald-500")}
                <text x={x + 32} y={height - 12} textAnchor="middle" className="fill-gray-500 text-[10px]">
                  {row.monthName || row.monthKey}
                </text>
              </g>
            );
          })}
          <path d={line} fill="none" className="stroke-amber-600" strokeWidth={1.5} />
        </svg>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Collection vs due can exceed 100% when arrears or advances are collected. A longer period, such as this financial year, shows a clearer trend.
      </p>
      <div className="mt-2 text-xs text-gray-500">
        {rows.map((row) => `${row.monthName}: ${formatPct(row.collVsDuePct)}`).join(" · ")}
      </div>
    </div>
  );
};

export default CoPerformanceChart;
