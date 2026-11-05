# MIS Reports Source Audit

## Evidence reviewed

- The four existing MIS routes and their container, hook, type, table, and presentation files.
- The confirmed frontend endpoint `GET /Org/MisReport/MonthlyStatementOfAccounts`.
- Existing branch and Sahayika endpoint helpers:
  - `Org/ProcessMaster/GetBranchList`
  - `Org/ProcessLoan/GetSahayikaList`
- The supplied development specification in the attached task text.

The named `MIS_REPORTS_IMPLEMENTATION_SPEC.md`, `CODEX_PROMPT_MIS_REPORTS.md`, and
`Swanirvar Finance Company (3).pdf` were not present in the repository or its
parent folder during this audit. The attached specification identifies the PDF
layout and explicitly states that backend contracts and accounting policies are
not confirmed by the frontend.

## Current source mapping

| Report | Confirmed source | Current status |
|---|---|---|
| Monthly Statement of Accounts | `Org/MisReport/MonthlyStatementOfAccounts` | Implemented against the real endpoint; no mock fallback |
| Receipt & Payment Scroll | None in frontend | Existing UI is mock-only; backend contract required |
| Loan Portfolio | None in frontend | Existing UI is mock-only; backend contract required |
| Default & PAR Calculation | None in frontend | Existing UI is mock-only; aging policy and backend contract required |

The repository does not contain backend controllers, database migrations, or
schema definitions for the MIS reports. No table names, stored procedures, or
financial classifications have been inferred.

## Monthly Statement mapping

The frontend adapter accepts the confirmed endpoint's side-by-side response:

- `details.Receipts` / `details.receipts`
- `details.Payments` / `details.payments`
- `details.Summary` / `details.summary`

Each line is mapped from backend fields for label, category, previous-month
amount, current-month amount, and cumulative amount. The adapter also reads
backend reconciliation status and difference when supplied. If the endpoint
does not return supported Receipts/Payments data, the UI shows an explicit
error instead of fabricating ledger rows or balances.

## Finance approval required

The following must be confirmed by the finance owner/backend contract before
the remaining reports or additional monthly-statement classifications are
activated:

- Transaction-code to statement-line mappings.
- Cash versus bank treatment and internal Head Office transfer handling.
- Opening and closing balance semantics and financial-year cutoffs.
- Reversal, correction, waiver, reschedule, payoff, and duplicate-event rules.
- PAR threshold, DPD bucket source, partial-payment treatment, borrower
  de-duplication, and DBR/CTR/RR formulas.
