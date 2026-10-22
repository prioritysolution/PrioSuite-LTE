"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDisplayDateTime } from "@/container/rectify/collection-repayment/CollectionRectifyApi";
import {
  KeyValue,
  RectifyLogBase,
  RectifyLogDetailsOf,
} from "@/container/rectify/collection-repayment/CollectionRectifyType";
import LogResultBadge from "./LogResultBadge";

interface LogDetailsDialogProps {
  detailsOpen: boolean;
  detailsLoading: boolean;
  details: RectifyLogDetailsOf<RectifyLogBase> | null;
  onCloseDetails: () => void;
  subject?: { label: string; value: string };
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h4 className="text-sm font-bold uppercase tracking-wide text-primary">
    {children}
  </h4>
);

const Fact = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 break-words">
      {value || "—"}
    </p>
  </div>
);

const KeyValueTable = ({ rows }: { rows: KeyValue[] }) =>
  rows.length === 0 ? (
    <p className="rounded-lg border border-gray-100 bg-slate-50/60 px-4 py-3 text-sm text-gray-500">
      Nothing recorded.
    </p>
  ) : (
    <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100">
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-1 gap-1 px-4 py-2 text-sm sm:grid-cols-[200px_1fr]"
        >
          <dt className="font-semibold text-gray-500 break-all">{row.key}</dt>
          <dd className="text-gray-800 break-all">{row.value}</dd>
        </div>
      ))}
    </dl>
  );

const LogDetailsDialog = ({
  detailsOpen,
  detailsLoading,
  details,
  onCloseDetails,
  subject,
}: LogDetailsDialogProps) => {
  const log = details?.log;

  return (
    <Dialog
      open={detailsOpen}
      onOpenChange={(open) => {
        if (!open) onCloseDetails();
      }}
    >
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto border border-gray-100 shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-3 text-xl font-bold text-primary">
            Save Attempt {log ? `#${log.logId}` : ""}
            {log && <LogResultBadge result={log.result} name={log.resultName} />}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {log?.message || "Before and after data of one Save click."}
          </DialogDescription>
        </DialogHeader>

        {detailsLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-3 text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-semibold">Loading log entry</span>
            </div>
          </div>
        ) : !details || !log ? (
          <div className="flex items-center justify-center h-32 rounded-xl border border-gray-100 bg-slate-50/40">
            <p className="text-sm font-medium text-gray-500">Log entry not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-slate-50/60 p-4 md:grid-cols-4">
              <Fact label="When" value={formatDisplayDateTime(log.createdOn)} />
              <Fact label="User" value={log.userName} />
              <Fact label="Branch" value={log.branchName} />
              <Fact label="IP Address" value={log.ipAddress} />
              <Fact label="Voucher" value={log.voucherNo} />
              {subject && <Fact label={subject.label} value={subject.value} />}
              <Fact
                label="Duration"
                value={log.durationMs ? `${log.durationMs} ms` : ""}
              />
              <Fact label="Error No" value={String(log.errorNo)} />
              {log.rectifyId > 0 && (
                <Fact label="Correction" value={`#${log.rectifyId}`} />
              )}
              {log.changeCount > 0 && (
                <Fact label="Records Changed" value={String(log.changeCount)} />
              )}
              {log.reason && (
                <div className="col-span-2 md:col-span-4">
                  <Fact label="Reason" value={log.reason} />
                </div>
              )}
            </div>

            <section className="space-y-3">
              <SectionTitle>Values Sent</SectionTitle>
              <KeyValueTable rows={details.request} />
            </section>

            <section className="space-y-3">
              <SectionTitle>Response</SectionTitle>
              <KeyValueTable rows={details.response} />
            </section>

            <section className="space-y-3">
              <SectionTitle>Changes</SectionTitle>
              {details.changes.length === 0 ? (
                <p className="rounded-lg border border-gray-100 bg-slate-50/60 px-4 py-3 text-sm text-gray-500">
                  Nothing was changed by this attempt.
                </p>
              ) : (
                <div className="space-y-3">
                  {details.changes.map((change) => (
                    <article
                      key={`${change.seqNo}-${change.tableName}-${change.recordId}`}
                      className="rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-primary/5 px-4 py-2.5">
                        <p className="font-semibold text-primary">{change.title}</p>
                        <p className="text-xs text-gray-400">
                          {change.tableName}
                          {change.recordId ? ` · #${change.recordId}` : ""}
                        </p>
                      </div>
                      {change.diffs.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">
                          No values differ.
                        </p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          <div className="hidden sm:grid grid-cols-[180px_1fr_1fr] gap-3 px-4 py-2 text-[11px] font-bold uppercase text-gray-400">
                            <span>Field</span>
                            <span>Before</span>
                            <span>After</span>
                          </div>
                          {change.diffs.map((diff) => (
                            <div
                              key={diff.label}
                              className="grid grid-cols-1 gap-1 px-4 py-2 text-sm sm:grid-cols-[180px_1fr_1fr] sm:gap-3"
                            >
                              <span className="font-semibold text-gray-500 break-all">
                                {diff.label}
                              </span>
                              <span className="text-gray-500 break-all">
                                {diff.oldValue}
                              </span>
                              <span className="font-medium text-primary break-all">
                                {diff.newValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCloseDetails}
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailsDialog;
