"use client";

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { formatDisplayDateTime } from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import { RectifyHistoryBase } from "@/container/rectify/collection-repayment/CollectionRectifyType";

interface RectifyHistoryListProps<T extends RectifyHistoryBase> {
  history: T[];
  heading?: (row: T) => ReactNode;
  emptyText?: string;
}

const RectifyHistoryList = <T extends RectifyHistoryBase>({
  history,
  heading,
  emptyText = "This collection has not been corrected before.",
}: RectifyHistoryListProps<T>) => {
  if (history.length === 0) {
    return (
      <p className="rounded-lg border border-gray-100 bg-slate-50/60 px-4 py-3 text-sm text-gray-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((row) => (
        <article
          key={row.rectifyId}
          className="rounded-xl border border-gray-100 bg-white p-4 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {heading && <div className="min-w-0">{heading(row)}</div>}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {formatDisplayDateTime(row.rectifiedOn) || "—"}
              {row.rectifiedBy ? ` · ${row.rectifiedBy}` : ""}
            </p>
          </div>
          {row.reason && (
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-500">Reason: </span>
              {row.reason}
            </p>
          )}
          {row.changes.length > 0 && (
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {row.changes.map((change) => (
                <div
                  key={change.label}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <dt className="text-[11px] font-semibold uppercase text-gray-400">
                    {change.label}
                  </dt>
                  <dd className="flex flex-wrap items-center gap-1.5 font-medium">
                    <span className="text-gray-500 line-through decoration-gray-300">
                      {change.oldValue}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-primary">{change.newValue}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </article>
      ))}
    </div>
  );
};

export default RectifyHistoryList;
