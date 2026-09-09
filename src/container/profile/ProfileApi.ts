import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getBranchListAPI = async (orgId: number) => {
  return await doGetApiCall({ url: endPoints.getBranchList(orgId) });
};

/** Signed-in profile — sub-branch list for head office (Is_Head = 1). */
export const getProfileAPI = async () => {
  return await doGetApiCall({ url: endPoints.getProfile });
};

export type UpdateProfilePayload = Record<string, string | number>;

/** Update signed-in profile (PUT, falls back to POST if method not allowed). */
export const updateProfileAPI = async (payload: UpdateProfilePayload) => {
  try {
    return await doPutApiCall({
      url: endPoints.updateProfile,
      bodyData: payload,
    });
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 405 || status === 404) {
      return await doPostApiCall({
        url: endPoints.updateProfile,
        bodyData: payload,
      });
    }
    throw err;
  }
};

const pick = (item: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!item || typeof item !== "object") return "";
  for (const key of keys) {
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  const wanted = keys.map((k) => k.toLowerCase());
  for (const key of Object.keys(item)) {
    if (!wanted.includes(key.toLowerCase())) continue;
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val).trim();
    }
  }
  return "";
};

const extractList = (res: unknown): Record<string, unknown>[] => {
  if (!res || typeof res !== "object") return [];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.Data)) return r.Data as Record<string, unknown>[];
  if (Array.isArray(r.details)) return r.details as Record<string, unknown>[];
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[];
  const nested = r.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    if (Array.isArray(d.Data)) return d.Data as Record<string, unknown>[];
    if (Array.isArray(d.details)) return d.details as Record<string, unknown>[];
  }
  return [];
};

/**
 * GetProfile may nest branches under Data / details / branches / sub_branches.
 * Prefer the first non-empty array that looks like branch rows.
 */
const extractProfileBranchList = (res: unknown): Record<string, unknown>[] => {
  if (!res || typeof res !== "object") return [];
  const r = res as Record<string, unknown>;

  const look = (value: unknown): Record<string, unknown>[] => {
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (first && typeof first === "object") {
        const row = first as Record<string, unknown>;
        const hasBranchKey = Object.keys(row).some((k) =>
          /branch/i.test(k),
        );
        if (hasBranchKey) return value as Record<string, unknown>[];
      }
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      const nestedKeys = [
        "branches",
        "Branches",
        "sub_branches",
        "Sub_Branches",
        "subBranches",
        "branch_list",
        "Branch_List",
        "details",
        "Details",
        "Data",
        "data",
      ];
      for (const key of nestedKeys) {
        const found = look(obj[key]);
        if (found.length) return found;
      }
    }
    return [];
  };

  for (const key of [
    "details",
    "Details",
    "Data",
    "data",
    "branches",
    "Branches",
    "sub_branches",
    "Sub_Branches",
  ]) {
    const found = look(r[key]);
    if (found.length) return found;
  }

  return extractList(res);
};

export type BranchMasterDetails = {
  branch_id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_mobile: string;
  branch_mail: string;
  is_head: string;
  is_active: string;
};

export type ProfileBranchRow = {
  branch_id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string;
  branch_mobile: string;
  branch_mail: string;
  is_head: boolean;
  is_active: string;
};

const flagLabel = (raw: string) => {
  if (raw === "1") return "Yes";
  if (raw === "0") return "No";
  return raw || "—";
};

const activeLabel = (raw: string) => {
  if (raw === "1") return "Active";
  if (raw === "0") return "Inactive";
  return raw || "—";
};

export const isHeadFlag = (value: unknown) => {
  const raw = String(value ?? "").trim().toLowerCase();
  return raw === "1" || raw === "yes" || raw === "true" || raw === "y";
};

const mapBranchRow = (row: Record<string, unknown>): ProfileBranchRow | null => {
  const branch_id = pick(row, ["Branch_Id", "branch_id", "BranchId"]);
  if (!branch_id) return null;

  const isHeadRaw = pick(row, ["Is_Head", "is_head", "IsHead"]);
  return {
    branch_id,
    branch_code: pick(row, ["Branch_Code", "branch_code", "BranchCode"]),
    branch_name: pick(row, ["Branch_Name", "branch_name", "BranchName"]),
    branch_address: pick(row, [
      "Branch_Address",
      "branch_address",
      "Branch_Add",
      "Brn_Add",
      "Address",
    ]),
    branch_mobile: pick(row, [
      "Branch_Mobile",
      "branch_mobile",
      "Branch_Phone",
      "Mobile",
    ]),
    branch_mail: pick(row, [
      "Branch_Mail",
      "branch_mail",
      "Branch_Email",
      "Email",
    ]),
    is_head: isHeadFlag(isHeadRaw),
    is_active: activeLabel(pick(row, ["Is_Active", "is_active", "IsActive"])),
  };
};

/** All org branches from GetBranchList (mst_org_branch). */
export const resolveOrgBranches = (res: unknown): ProfileBranchRow[] => {
  return extractList(res)
    .map((row) => mapBranchRow(row))
    .filter((row): row is ProfileBranchRow => !!row);
};

/** Sub-branches only (Is_Head != 1) from GetBranchList. */
export const resolveSubBranches = (res: unknown): ProfileBranchRow[] => {
  return resolveOrgBranches(res).filter((row) => !row.is_head);
};

/**
 * Sub-branches from GetProfile.
 * If the payload already excludes head, keep all mapped rows;
 * otherwise drop Is_Head = 1 rows.
 */
export const resolveSubBranchesFromProfile = (
  res: unknown,
): ProfileBranchRow[] => {
  const rows = extractProfileBranchList(res)
    .map((row) => mapBranchRow(row))
    .filter((row): row is ProfileBranchRow => !!row);

  if (!rows.length) return [];

  const hasHeadFlag = rows.some((row) => row.is_head);
  if (hasHeadFlag) return rows.filter((row) => !row.is_head);
  return rows;
};

/** Match mst_org_branch row for the signed-in org + branch (connection). */
export const resolveBranchDetails = (
  res: unknown,
  branchId: number | string,
): BranchMasterDetails | null => {
  const list = extractList(res);
  if (!list.length) return null;

  const match =
    list.find(
      (b) =>
        String(pick(b, ["Branch_Id", "branch_id", "BranchId"])) ===
        String(branchId),
    ) || null;

  if (!match) return null;

  return {
    branch_id: pick(match, ["Branch_Id", "branch_id", "BranchId"]),
    branch_code: pick(match, ["Branch_Code", "branch_code", "BranchCode"]),
    branch_name: pick(match, ["Branch_Name", "branch_name", "BranchName"]),
    branch_address: pick(match, [
      "Branch_Address",
      "branch_address",
      "Branch_Add",
      "Brn_Add",
    ]),
    branch_mobile: pick(match, [
      "Branch_Mobile",
      "branch_mobile",
      "Branch_Phone",
      "Mobile",
    ]),
    branch_mail: pick(match, [
      "Branch_Mail",
      "branch_mail",
      "Branch_Email",
      "Email",
    ]),
    is_head: flagLabel(pick(match, ["Is_Head", "is_head", "IsHead"])),
    is_active: activeLabel(pick(match, ["Is_Active", "is_active", "IsActive"])),
  };
};
