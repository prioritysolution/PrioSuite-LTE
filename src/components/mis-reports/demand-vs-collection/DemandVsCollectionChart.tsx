"use client";

import React from "react";
import { formatAmount, formatApiDate } from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionApi";
import { DateRow } from "@/container/mis-reports/demand-vs-collection/DemandVsCollectionType";

const DemandVsCollectionChart = ({ rows }: { rows: DateRow[] }) => {
  const width = Math.max(rows.length * 36, 640);
  const height = 280;
  const pad = { top: 16, right: 12, bottom: 48, left: 8 };
  const innerH = height - pad.top - pad.bottom;
  const maxBar = Math.max(
    1,
    ...rows.map((row) => Math.max(row.demandAmount, row.collAmount)),
  );
  const maxLine = Math.max(
    1,
    ...rows.map((row) => Math.max(row.cumDemand, row.cumCollection)),
  );
  const line = (key: "cumDemand" | "cumCollection") =>
    rows
      .map((row, index) => {
        const x = pad.left + index * 36 + 18;
        const y = pad.top + innerH - (row[key] / maxLine) * innerH;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm bg-sky-500" /> Demand
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-3 rounded-sm bg-emerald-500" /> Collection
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-4 bg-sky-800" /> Cumulative demand
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-0.5 w-4 bg-emerald-800" /> Cumulative collection
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg width={width} height={height} role="img" aria-label="Demand versus collection by date">
          {rows.map((row, index) => {
            const x = pad.left + index * 36;
            const demandH = (row.demandAmount / maxBar) * innerH;
            const collH = (row.collAmount / maxBar) * innerH;
            return (
              <g key={row.transDate}>
                <rect
                  x={x + 4}
                  y={pad.top + innerH - demandH}
                  width={12}
                  height={demandH}
                  className="fill-sky-500"
                >
                  <title>{`Demand ${formatAmount(row.demandAmount)}`}</title>
                </rect>
                <rect
                  x={x + 18}
                  y={pad.top + innerH - collH}
                  width={12}
                  height={collH}
                  className="fill-emerald-500"
                >
                  <title>{`Collection ${formatAmount(row.collAmount)}`}</title>
                </rect>
                <text
                  x={x + 16}
                  y={height - 28}
                  textAnchor="end"
                  transform={`rotate(-45 ${x + 16} ${height - 28})`}
                  className="fill-gray-500 text-[9px]"
                >
                  {formatApiDate(row.transDate).slice(0, 5)}
                </text>
              </g>
            );
          })}
          <path d={line("cumDemand")} fill="none" className="stroke-sky-800" strokeWidth={1.5} />
          <path d={line("cumCollection")} fill="none" className="stroke-emerald-800" strokeWidth={1.5} />
        </svg>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Date-wise demand shows installments due on each day; arrears are not included.
      </p>
    </div>
  );
};

export default DemandVsCollectionChart;
