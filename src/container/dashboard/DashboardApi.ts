import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  DashboardBranchItem,
  DashboardPayload,
  DashboardStats,
} from "./DashboardType";

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};

const pick = (item: any, keys: string[]) => {
  if (!item || typeof item !== "object") return "";
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  const wanted = keys.map((k) => k.toLowerCase());
  for (const key of Object.keys(item)) {
    if (!wanted.includes(key.toLowerCase())) continue;
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

const LOAN_KEYS = [
  "Loan_Issue_Amt",
  "loan_issue_amt",
  "Issue_Amount",
  "issue_amount",
];

const COLLECTION_KEYS = [
  "Loan_Collection_Amt",
  "loan_collection_amt",
  "Collection_Amount",
  "collection_amount",
];

const OUTSTANDING_KEYS = [
  "Loan_Outstanding_Amt",
  "loan_outstanding_amt",
  "Outstanding_Amount",
  "outstanding_amount",
];

const BORROWER_KEYS = [
  "Total_Member",
  "total_member",
  "No_Member",
  "no_member",
  "Total_Active_Borrowers",
  "active_borrowers",
];

const emptyStats = (): DashboardStats => ({
  totalLoanIssue: 0,
  totalCollection: 0,
  totalOutstanding: 0,
  totalActiveBorrowers: 0,
});

const mapRowToStats = (row: any): DashboardStats => {
  if (!row || typeof row !== "object") return emptyStats();

  return {
    totalLoanIssue: toNumber(pick(row, LOAN_KEYS)),
    totalCollection: toNumber(pick(row, COLLECTION_KEYS)),
    totalOutstanding: toNumber(pick(row, OUTSTANDING_KEYS)),
    totalActiveBorrowers: toNumber(pick(row, BORROWER_KEYS)),
  };
};

const mapBranchItem = (branch: any): DashboardBranchItem | null => {
  if (!branch || typeof branch !== "object") return null;

  const branchId = toNumber(
    pick(branch, ["branch_id", "Branch_Id", "BranchId"]),
  );
  const branchCode = String(
    pick(branch, ["branch_code", "Branch_Code", "BranchCode"]) || "",
  );
  const branchName = String(
    pick(branch, ["branch_name", "Branch_Name", "BranchName"]) || "Branch",
  );
  const isHead =
    toNumber(pick(branch, ["is_head", "Is_Head", "IsHead"])) === 1;

  const dashRows = Array.isArray(branch.dashboard) ? branch.dashboard : [];
  const statsRow = dashRows[0] || branch;

  return {
    branchId,
    branchCode,
    branchName: /branch/i.test(branchName) ? branchName : `${branchName} Branch`,
    isHead,
    stats: mapRowToStats(statsRow),
  };
};

const parseBranches = (res: any): DashboardBranchItem[] => {
  const details = res?.details || res?.data?.details || [];
  if (!Array.isArray(details)) return [];

  return details
    .map((branch) => mapBranchItem(branch))
    .filter((item): item is DashboardBranchItem => !!item && !!item.branchId);
};

/**
 * Head office (Is_Head == 1):
 *   - Call GetDashboard (expands to all sub-branches)
 *   - summary cards + branch-wise loop
 *
 * Sub branch (Is_Head != 1):
 *   - Call GetDashboard_item (single branch only)
 *   - only that branch's cards
 */
export const fetchDashboardStats = async (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
): Promise<DashboardPayload> => {
  // First hit branch-aware API; then decide head vs sub from response / fallback item API.
  let response = await doGetApiCall({
    url: endPoints.getDashboard(orgId, branchId, fromDate, toDate),
  });

  let message = String(response?.message || response?.data?.message || "");
  if (/error/i.test(message) && !/data found/i.test(message)) {
    throw new Error(message || "Failed to load dashboard data.");
  }

  let branches = parseBranches(response);
  const current =
    branches.find((b) => String(b.branchId) === String(branchId)) || null;

  // If logged-in branch is NOT head, use single-branch API so only that branch shows.
  if (current && !current.isHead) {
    response = await doGetApiCall({
      url: endPoints.getDashboardItem(orgId, branchId, fromDate, toDate),
    });
    message = String(response?.message || response?.data?.message || "");
    if (/error/i.test(message) && !/data found/i.test(message)) {
      throw new Error(message || "Failed to load dashboard data.");
    }
    branches = parseBranches(response);

    // GetDashboard_item may return summary-only or details with one branch
    if (branches.length === 0) {
      const summary = response?.summary || response?.data?.summary;
      const stats = summary ? mapRowToStats(summary) : emptyStats();
      return {
        isHeadView: false,
        summary: stats,
        branches: [
          {
            branchId,
            branchCode: "",
            branchName: "Branch",
            isHead: false,
            stats,
          },
        ],
      };
    }

    const only = branches.find((b) => String(b.branchId) === String(branchId));
    const list = only ? [only] : branches.slice(0, 1);
    return {
      isHeadView: false,
      summary: list[0].stats,
      branches: list,
    };
  }

  // Head office view — use summary + all branch rows
  const summaryBlock = response?.summary || response?.data?.summary;
  const summary = summaryBlock
    ? mapRowToStats(summaryBlock)
    : branches.reduce(
        (acc, b) => ({
          totalLoanIssue: acc.totalLoanIssue + b.stats.totalLoanIssue,
          totalCollection: acc.totalCollection + b.stats.totalCollection,
          totalOutstanding: acc.totalOutstanding + b.stats.totalOutstanding,
          totalActiveBorrowers:
            acc.totalActiveBorrowers + b.stats.totalActiveBorrowers,
        }),
        emptyStats(),
      );

  // If we couldn't detect head from details, treat multi-branch payload as head view
  const isHeadView =
    current?.isHead === true ||
    branches.some((b) => b.isHead) ||
    branches.length > 1;

  if (!isHeadView && branches.length === 1) {
    return {
      isHeadView: false,
      summary: branches[0].stats,
      branches,
    };
  }

  return {
    isHeadView: true,
    summary,
    branches,
  };
};
