"use client";

import {
  DemandAmounts,
  DemandCoRow,
  DemandEmiRow,
  DemandGroupRow,
  DemandMemberRow,
  DemandSummary,
} from "@/container/loan-entry/demand-generation/DemandGenerationType";
import { DemandColumn, formatDemandAmount } from "./DemandGenerationTable";

const sum = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + (pick(row) || 0), 0);

const totalsOf = (
  rows: DemandAmounts[],
  summary: DemandSummary | null,
): DemandAmounts => ({
  currentDemand: summary?.currentDemand ?? sum(rows, (row) => row.currentDemand),
  arrearDemand: summary?.arrearDemand ?? sum(rows, (row) => row.arrearDemand),
  totalDemand: summary?.totalDemand ?? sum(rows, (row) => row.totalDemand),
  prnDue: sum(rows, (row) => row.prnDue),
  intDue: sum(rows, (row) => row.intDue),
  outstanding: summary?.outstanding ?? sum(rows, (row) => row.outstanding),
  prnOutstanding:
    summary?.prnOutstanding ?? sum(rows, (row) => row.prnOutstanding),
  intOutstanding:
    summary?.intOutstanding ?? sum(rows, (row) => row.intOutstanding),
});

const amountColumn = <T,>(
  key: string,
  header: string,
  value: (row: T) => number,
  footer?: number,
  strong = false,
): DemandColumn<T> => ({
  key,
  header,
  align: "right",
  render: (row) => (
    <span className={strong ? "font-bold text-primary" : "font-semibold"}>
      {formatDemandAmount(value(row))}
    </span>
  ),
  footer: footer === undefined ? undefined : formatDemandAmount(footer),
});

const slColumn = <T,>(count: number): DemandColumn<T> => ({
  key: "sl",
  header: "Sl",
  align: "center",
  render: (_row, index) => index + 1,
  footer: `Total (${count})`,
});

export const formatCollectionDay = (day: string, date: string) => {
  if (day && date) return `${day} (${date})`;
  return day || date || "—";
};

const demandColumns = <T extends DemandAmounts>(
  totals: DemandAmounts,
): DemandColumn<T>[] => [
  amountColumn<T>("current", "Current", (row) => row.currentDemand, totals.currentDemand),
  amountColumn<T>("arrear", "Arrear", (row) => row.arrearDemand, totals.arrearDemand),
  amountColumn<T>("total", "Total Demand", (row) => row.totalDemand, totals.totalDemand, true),
];

const outstandingColumns = <T extends DemandAmounts>(
  totals: DemandAmounts,
): DemandColumn<T>[] => [
  amountColumn<T>("prnOs", "Prn O/S", (row) => row.prnOutstanding, totals.prnOutstanding),
  amountColumn<T>("intOs", "Int O/S", (row) => row.intOutstanding, totals.intOutstanding),
  amountColumn<T>("outstanding", "Outstanding", (row) => row.outstanding, totals.outstanding),
];

export const coColumns = (
  rows: DemandCoRow[],
  summary: DemandSummary | null,
): DemandColumn<DemandCoRow>[] => {
  const totals = totalsOf(rows, summary);
  return [
    slColumn(rows.length),
    {
      key: "co",
      header: "Sahayika",
      render: (row) => (
        <span className="font-semibold text-primary">{row.coName}</span>
      ),
    },
    {
      key: "groups",
      header: "Groups",
      align: "center",
      render: (row) => row.groupCount,
      footer: sum(rows, (row) => row.groupCount),
    },
    {
      key: "members",
      header: "Members",
      align: "center",
      render: (row) => row.memberCount,
      footer: sum(rows, (row) => row.memberCount),
    },
    {
      key: "loans",
      header: "Loans",
      align: "center",
      render: (row) => row.accountCount,
      footer: sum(rows, (row) => row.accountCount),
    },
    ...demandColumns<DemandCoRow>(totals),
    amountColumn<DemandCoRow>("prnDue", "Prn Due", (row) => row.prnDue, totals.prnDue),
    amountColumn<DemandCoRow>("intDue", "Int Due", (row) => row.intDue, totals.intDue),
    amountColumn<DemandCoRow>("outstanding", "Outstanding", (row) => row.outstanding, totals.outstanding),
  ];
};

export const groupColumns = (
  rows: DemandGroupRow[],
  summary: DemandSummary | null,
  demandDate: string,
): DemandColumn<DemandGroupRow>[] => {
  const totals = totalsOf(rows, summary);
  return [
    slColumn(rows.length),
    {
      key: "group",
      header: "Group",
      render: (row) => (
        <div>
          <p className="font-semibold text-primary">{row.groupName || "—"}</p>
          {row.groupNo ? (
            <p className="text-xs text-gray-500">No. {row.groupNo}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "collDay",
      header: "Collection Day",
      render: (row) => {
        const shifted = !!row.collDayDate && row.collDayDate !== demandDate;
        return (
          <span className={shifted ? "font-semibold text-amber-700" : undefined}>
            {formatCollectionDay(row.collectionDay, row.collDayDate)}
          </span>
        );
      },
    },
    {
      key: "members",
      header: "Members",
      align: "center",
      render: (row) => row.memberCount,
      footer: sum(rows, (row) => row.memberCount),
    },
    {
      key: "loans",
      header: "Loans",
      align: "center",
      render: (row) => row.accountCount,
      footer: sum(rows, (row) => row.accountCount),
    },
    ...demandColumns<DemandGroupRow>(totals),
    ...outstandingColumns<DemandGroupRow>(totals),
  ];
};

export const memberColumns = (
  rows: DemandMemberRow[],
  summary: DemandSummary | null,
): DemandColumn<DemandMemberRow>[] => {
  const totals = totalsOf(rows, summary);
  const showGroup = rows.some((row) => row.groupName || row.groupNo);
  return [
    slColumn(rows.length),
    ...(showGroup
      ? [
          {
            key: "group",
            header: "Group",
            render: (row: DemandMemberRow) => (
              <div>
                <p className="font-semibold text-gray-800">{row.groupName || "—"}</p>
                {row.groupNo ? (
                  <p className="text-xs text-gray-500">No. {row.groupNo}</p>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
    {
      key: "member",
      header: "Member",
      render: (row) => (
        <div>
          <p className="font-semibold text-primary">{row.memberName || "—"}</p>
          <p className="text-xs text-gray-500">
            {[row.memberNo, row.guardianName].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "account",
      header: "Loan A/c",
      render: (row) => (
        <div>
          <p>{row.accountLabel || "—"}</p>
          {row.loanCycle ? (
            <p className="text-xs text-gray-500">Cycle {row.loanCycle}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "emi",
      header: "EMI (Prn + Int)",
      align: "right",
      render: (row) => (
        <div>
          <p className="font-semibold">{formatDemandAmount(row.instlAmount)}</p>
          {row.emiPrincipal || row.emiInterest ? (
            <p className="text-xs text-gray-500">
              {formatDemandAmount(row.emiPrincipal)} + {formatDemandAmount(row.emiInterest)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "emiPaid",
      header: "EMIs Paid / Total",
      align: "center",
      render: (row) => (row.totalEmi ? `${row.paidEmi} / ${row.totalEmi}` : "—"),
    },
    {
      key: "dueEmi",
      header: "Due EMIs",
      align: "center",
      render: (row) => row.dueEmi || "—",
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => row.dueDate || "—",
    },
    ...demandColumns<DemandMemberRow>(totals),
    ...outstandingColumns<DemandMemberRow>(totals),
  ];
};

export const emiColumns = (
  rows: DemandEmiRow[],
): DemandColumn<DemandEmiRow>[] => [
  {
    key: "emiNo",
    header: "EMI No",
    align: "center",
    render: (row) => row.emiNo || "—",
    footer: `Total (${rows.length})`,
  },
  {
    key: "dueDate",
    header: "Due Date",
    render: (row) => row.dueDate || "—",
  },
  amountColumn<DemandEmiRow>("opening", "Opening Prn", (row) => row.openingPrincipal),
  amountColumn<DemandEmiRow>("emi", "EMI", (row) => row.emiAmount),
  amountColumn<DemandEmiRow>("principal", "Principal", (row) => row.emiPrincipal),
  amountColumn<DemandEmiRow>("interest", "Interest", (row) => row.emiInterest),
  amountColumn<DemandEmiRow>("paid", "Paid", (row) => row.paidAmount, sum(rows, (row) => row.paidAmount)),
  amountColumn<DemandEmiRow>("prnDue", "Prn Due", (row) => row.prnDue, sum(rows, (row) => row.prnDue)),
  amountColumn<DemandEmiRow>("intDue", "Int Due", (row) => row.intDue, sum(rows, (row) => row.intDue)),
  amountColumn<DemandEmiRow>("emiDue", "EMI Due", (row) => row.emiDue, sum(rows, (row) => row.emiDue), true),
  amountColumn<DemandEmiRow>("closing", "Closing Prn", (row) => row.closingPrincipal),
  {
    key: "type",
    header: "Type",
    align: "center",
    render: (row) => (
      <span
        className={
          /arrear/i.test(row.demandType)
            ? "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"
            : "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
        }
      >
        {row.demandType || "—"}
      </span>
    ),
  },
];
