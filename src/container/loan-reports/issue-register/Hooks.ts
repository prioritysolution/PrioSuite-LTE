"use client";

import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format } from "date-fns";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch } from "@/redux/store";
import { IssueRegisterForm } from "./IssueRegisterType";
import {
  getBranchListAPI,
  getCoListAPI,
  getDisbursementDetailsAPI,
  getGroupListAPI,
  getIssueRegisterAPI,
  getMemberListAPI,
  getSchemeListAPI,
} from "./IssueRegisterApi";
import { setBranchList, setIssueRegisterList } from "./IssueRegisterReducer";

/** Cache lookup lists across searches (GetMemberList alone is ~1MB). */
const LOOKUP_STALE_MS = 5 * 60 * 1000;
const DISB_STALE_MS = 2 * 60 * 1000;
/** Cap disbursement fan-out on large date ranges (unique group + date pairs). */
const MAX_DISBURSEMENT_FETCHES = 80;
const DISBURSEMENT_BATCH_SIZE = 2;
const DISBURSEMENT_BATCH_GAP_MS = 250;

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

const firstFilled = (...values: unknown[]) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

/** Like firstFilled but ignores "-" / "—" placeholders from APIs. */
const firstMeaningful = (...values: unknown[]) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const s = String(value).trim();
    if (!s) continue;
    if (/^[-–—_]+$/.test(s)) continue;
    if (s.toLowerCase() === "n/a" || s.toLowerCase() === "null") continue;
    return value;
  }
  return "";
};

const norm = (value: unknown) => String(value || "").trim().toLowerCase();

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();
  if (!str) return null;

  const native = new Date(str);
  if (!Number.isNaN(native.getTime())) return native;

  const match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const parsed = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

/** Always yyyy-MM-dd for API calls — never fan out dd/MM vs dd-MM retries. */
const toApiDate = (value: unknown) => {
  const parsed = parseDate(value);
  if (parsed) return format(parsed, "yyyy-MM-dd");
  return "";
};

const ISSUE_DATE_KEYS = [
  "Loan_Date",
  "loan_date",
  "Issue_Date",
  "issue_date",
  "Disb_Date",
  "disb_date",
];
const GROUP_NAME_KEYS = ["Grp_Name", "Group_Name", "grp_name", "GroupName"];
const GROUP_ID_KEYS = ["Group_Id", "Grp_Id", "grp_id", "GroupId", "group_id"];
const CO_ID_KEYS = ["CO_Id", "Co_Id", "co_id", "COId", "Sahayika_Id"];
const CO_KEYS = [
  "Co_Name",
  "CO_Name",
  "co_name",
  "Under_CO",
  "Under_Co",
  "Sahayika_Name",
  "Admitted_By",
];
const MEMBER_ID_KEYS = [
  "Member_Id",
  "Mem_Id",
  "mem_id",
  "MemberId",
  "member_id",
];
const MEMBER_NAME_KEYS = [
  "member_name",
  "Member_Name",
  "Mem_Name",
  "mem_name",
  "MemberName",
];
const MEMBER_NO_KEYS = [
  "Member_No",
  "Mem_No",
  "member_no",
  "mem_no",
  "Membership_No",
];
const GUARDIAN_KEYS = [
  "FatHusb_Name",
  "Father_Name",
  "Gurd_Name",
  "Guardian_Name",
  "Gurdain_Name",
  "mem_fname",
  "Father_Husband",
  "FH_Name",
  "Husband_Name",
];
const GUARANTOR_KEYS = [
  "Guaranter_Name",
  "Guarantor_Name",
  "Gurantor_Name",
  "Guranter_Name",
  "Guaranter",
  "Guarantor",
  "Gurantor",
  "Guranter",
  "guaranter_name",
  "guranter_name",
  "guarantor_name",
  "gurantor_name",
  "guaranter",
  "guarantor",
  "Gurr_Name",
  "gurr_name",
  "GurrName",
  "Gurr",
  "gurr",
  "Guar_Name",
  "Guarantar_Name",
  "GuarantorMember",
  "Surety_Name",
  "surety_name",
  "Surety",
  "surety",
  "Guarantor",
];
const SCHEME_KEYS = [
  "Schme_Name",
  "Scheme_Name",
  "scheme_name",
  "Schem_Name",
  "Schm_Name",
  "SchemeName",
  "schemeName",
  "Sch_Name",
  "sch_name",
  "Scheme_Nm",
  "scheme_nm",
  // avoid bare "Scheme" — often collides with numeric Scheme_Id-like values
];
const SCHEME_ID_KEYS = [
  "Scheme_Id",
  "Schem_Id",
  "scheme_id",
  "Schm_Id",
  "Schme_Id",
];
const AREA_KEYS = [
  "Area_Name",
  "Area",
  "Vill_Name",
  "area_name",
  "Vill_Area",
];
const AMOUNT_KEYS = [
  "Loan_Amt",
  "Loan_Amount",
  "loan_amt",
  "loan_amount",
  "Appl_Amt",
  "Sanc_Amount",
];
const ACCOUNT_KEYS = ["Account_Id", "account_id", "Acct_Id", "Acc_Id"];
const ROI_KEYS = ["RoI", "ROI", "roi", "Rate_Of_Interest"];
const CYCLE_KEYS = ["Loan_Cycle", "loan_cycle", "Ln_Cycle", "Cycle"];
const INSTL_NO_KEYS = [
  "Installment_No",
  "Instl_No",
  "Inst_No",
  "No_Of_Installment",
  "inst_no",
];
const INSTL_AMT_KEYS = [
  "Installment_Amt",
  "Instl_Amt",
  "Inst_Amount",
  "inst_amt",
  "Installment_Amount",
];
const REALISABLE_KEYS = [
  "Realisable_Amt",
  "Resilable_Amt",
  "resilable_amount",
  "realisable_amount",
  "Realizable_Amt",
];

const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  // Prefer first non-empty array (empty `details: []` must not hide real `Data`)
  const nonEmpty = candidates.find(
    (item) => Array.isArray(item) && item.length > 0,
  );
  if (nonEmpty) return nonEmpty;
  const empty = candidates.find((item) => Array.isArray(item));
  return Array.isArray(empty) ? empty : [];
};

/** trans_loanappl_member rows — prefer Data over empty details */
const extractDisbursementDetails = (res: any): any[] => {
  const dataList = res?.Data || res?.data?.Data;
  if (Array.isArray(dataList) && dataList.length > 0) return dataList;
  return extractList(res);
};

const pickFuzzy = (
  item: any,
  includeParts: string[],
  excludeParts: string[] = [],
) => {
  if (!item || typeof item !== "object") return "";
  for (const key of Object.keys(item)) {
    const lk = key.toLowerCase();
    if (!includeParts.some((part) => lk.includes(part))) continue;
    if (excludeParts.some((part) => lk.includes(part))) continue;
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

const isBlankish = (value: unknown) => {
  const s = String(value ?? "").trim();
  if (!s) return true;
  return /^[-–—_]+$/.test(s) || s.toLowerCase() === "n/a" || s.toLowerCase() === "null";
};

const pickGuarantorName = (source: any) => {
  if (!source || typeof source !== "object") return "";
  const direct = firstFilled(
    pick(source, GUARANTOR_KEYS),
    pickFuzzy(
      source,
      ["gurr", "guaranter", "guranter", "guarantor", "surety"],
      ["guardian", "gurdain", "gurd_", "father", "husb", "fathusb"],
    ),
  );
  if (!isBlankish(direct)) return String(direct).trim();

  // Last resort: any own key that looks like guarantor (DB column gurr_name etc.)
  for (const key of Object.keys(source)) {
    const lk = key.toLowerCase().replace(/[\s-]+/g, "_");
    if (lk.includes("guardian") || lk.includes("gurdain") || lk.includes("gurd_")) {
      continue;
    }
    if (
      lk === "gurr_name" ||
      lk === "gurrname" ||
      lk.includes("guaranter") ||
      lk.includes("guranter") ||
      lk.includes("guarantor") ||
      lk.includes("gurr_name") ||
      (lk.startsWith("gurr") && lk.includes("name"))
    ) {
      const val = source[key];
      if (!isBlankish(val)) return String(val).trim();
    }
  }
  return "";
};

const mapLoanApplFields = (source: any) => ({
  Account_Id: firstFilled(pick(source, ACCOUNT_KEYS)),
  Scheme_Id: firstFilled(
    pick(source, SCHEME_ID_KEYS),
    pickFuzzy(source, ["scheme_id", "schem_id", "schme_id"]),
  ),
  Schme_Name: firstFilled(
    pick(source, SCHEME_KEYS),
    pickFuzzy(source, ["schme_name", "scheme_name", "schm_name"], ["id"]),
  ),
  RoI: firstFilled(pick(source, ROI_KEYS)),
  Loan_Cycle: firstFilled(pick(source, CYCLE_KEYS)),
  Installment_No: firstFilled(pick(source, INSTL_NO_KEYS)),
  Installment_Amt: firstFilled(pick(source, INSTL_AMT_KEYS)),
  Realisable_Amt: firstFilled(pick(source, REALISABLE_KEYS)),
  Guaranter_Name: pickGuarantorName(source),
  Loan_Amount: firstFilled(pick(source, AMOUNT_KEYS)),
  Member_Name: firstFilled(pick(source, MEMBER_NAME_KEYS)),
  Gurdain_Name: firstFilled(pick(source, GUARDIAN_KEYS)),
  Member_Id: firstFilled(pick(source, MEMBER_ID_KEYS)),
  Member_No: firstFilled(pick(source, MEMBER_NO_KEYS)),
  Co_Name: firstFilled(pick(source, CO_KEYS)),
  Loan_Date: firstFilled(pick(source, ISSUE_DATE_KEYS)),
});

const loanApplRowScore = (row: any) => {
  const mapped = mapLoanApplFields(row);
  let score = 0;
  if (String(firstFilled(mapped.Schme_Name, mapped.Scheme_Id, "")).trim()) score += 4;
  if (!isBlankish(mapped.Guaranter_Name)) score += 8; // prefer rows that still carry guarantor
  if (String(firstFilled(mapped.Installment_Amt, "")).trim()) score += 2;
  if (String(firstFilled(mapped.Member_No, mapped.Member_Id, "")).trim()) score += 1;
  return score;
};

/** Prefer richer row, but never drop Guaranter_Name / Schme_Name from the other. */
const betterRow = (prev: any, next: any) => {
  if (!prev) return next;
  if (!next) return prev;
  const prevScore = loanApplRowScore(prev);
  const nextScore = loanApplRowScore(next);
  const primary = nextScore >= prevScore ? next : prev;
  const secondary = primary === next ? prev : next;
  const primaryMapped = mapLoanApplFields(primary);
  const secondaryMapped = mapLoanApplFields(secondary);
  return {
    ...secondary,
    ...primary,
    Guaranter_Name: firstFilled(
      primaryMapped.Guaranter_Name,
      secondaryMapped.Guaranter_Name,
      pickGuarantorName(primary),
      pickGuarantorName(secondary),
    ),
    Schme_Name: firstFilled(primaryMapped.Schme_Name, secondaryMapped.Schme_Name),
    Scheme_Id: firstFilled(primaryMapped.Scheme_Id, secondaryMapped.Scheme_Id),
    Installment_Amt: firstFilled(
      primaryMapped.Installment_Amt,
      secondaryMapped.Installment_Amt,
    ),
    Realisable_Amt: firstFilled(
      primaryMapped.Realisable_Amt,
      secondaryMapped.Realisable_Amt,
    ),
    Account_Id: firstFilled(primaryMapped.Account_Id, secondaryMapped.Account_Id),
    Member_Id: firstFilled(primaryMapped.Member_Id, secondaryMapped.Member_Id),
    Member_No: firstFilled(primaryMapped.Member_No, secondaryMapped.Member_No),
    Member_Name: firstFilled(primaryMapped.Member_Name, secondaryMapped.Member_Name),
    Loan_Date: firstFilled(primaryMapped.Loan_Date, secondaryMapped.Loan_Date),
  };
};

const indexLoanApplRows = (rows: any[]) => {
  const byAccount = new Map<string, any>();
  const byMemberId = new Map<string, any>();
  const byMemberNo = new Map<string, any>();
  const byMemberName = new Map<string, any>();
  const byMemberNoAndDate = new Map<string, any>();
  const byMemberIdAndDate = new Map<string, any>();
  const byAmount = new Map<string, any>();
  const all: any[] = [];

  rows.forEach((row) => {
    const mapped = { ...row, ...mapLoanApplFields(row) };
    const accountId = String(mapped.Account_Id || "");
    const memberId = String(mapped.Member_Id || "");
    const memberNo = norm(mapped.Member_No);
    const memberName = norm(mapped.Member_Name);
    const amount = String(mapped.Loan_Amount || "").trim();
    const loanDate = toApiDate(mapped.Loan_Date);

    if (accountId) byAccount.set(accountId, betterRow(byAccount.get(accountId), mapped));
    if (memberId) byMemberId.set(memberId, betterRow(byMemberId.get(memberId), mapped));
    if (memberNo) byMemberNo.set(memberNo, betterRow(byMemberNo.get(memberNo), mapped));
    if (memberName) {
      byMemberName.set(memberName, betterRow(byMemberName.get(memberName), mapped));
    }
    if (memberNo && loanDate) {
      const key = `${memberNo}||${loanDate}`;
      byMemberNoAndDate.set(key, betterRow(byMemberNoAndDate.get(key), mapped));
    }
    if (memberId && loanDate) {
      const key = `${memberId}||${loanDate}`;
      byMemberIdAndDate.set(key, betterRow(byMemberIdAndDate.get(key), mapped));
    }
    if (amount) {
      const amtKey = normAmount(amount) || amount;
      if (!byAmount.has(amtKey)) byAmount.set(amtKey, mapped);
      if (!byAmount.has(amount)) byAmount.set(amount, mapped);
    }
    all.push(mapped);
  });

  return {
    byAccount,
    byMemberId,
    byMemberNo,
    byMemberName,
    byMemberNoAndDate,
    byMemberIdAndDate,
    byAmount,
    all,
  };
};

const normAmount = (value: unknown) => {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? String(n) : "";
};

const findLoanApplMatch = (
  item: any,
  indexes: ReturnType<typeof indexLoanApplRows>,
) => {
  const accountId = String(pick(item, ACCOUNT_KEYS) || "");
  const memberId = String(pick(item, MEMBER_ID_KEYS) || "");
  const memberNo = norm(pick(item, MEMBER_NO_KEYS));
  const memberName = norm(pick(item, MEMBER_NAME_KEYS));
  const amount = normAmount(pick(item, AMOUNT_KEYS));
  const loanDate = toApiDate(pick(item, ISSUE_DATE_KEYS));

  const candidates: any[] = [];
  const push = (row: any) => {
    if (row && !candidates.includes(row)) candidates.push(row);
  };

  if (memberNo && loanDate) {
    push(indexes.byMemberNoAndDate.get(`${memberNo}||${loanDate}`));
  }
  if (memberId && loanDate) {
    push(indexes.byMemberIdAndDate.get(`${memberId}||${loanDate}`));
  }
  if (accountId) push(indexes.byAccount.get(accountId));
  if (memberId) push(indexes.byMemberId.get(memberId));
  if (memberNo) push(indexes.byMemberNo.get(memberNo));
  if (memberName) push(indexes.byMemberName.get(memberName));

  if (amount) {
    const byAmt = indexes.all.filter(
      (row) => normAmount(row.Loan_Amount) === amount,
    );
    if (byAmt.length === 1) push(byAmt[0]);
    else byAmt.forEach(push);
  }

  // Same member: also consider every row for that member/no (guarantor may be on another cycle row)
  if (memberId) {
    indexes.all.forEach((row) => {
      if (String(row.Member_Id || "") === memberId) push(row);
    });
  }
  if (memberNo) {
    indexes.all.forEach((row) => {
      if (norm(row.Member_No) === memberNo) push(row);
    });
  }
  if (memberName) {
    indexes.all.forEach((row) => {
      if (norm(row.Member_Name) === memberName) push(row);
    });
  }

  if (indexes.all.length === 1) push(indexes.all[0]);

  if (candidates.length === 0) return null;

  // Prefer any candidate that still has guarantor, then highest score, merging fields
  return candidates.reduce((best, row) => betterRow(best, row), null as any);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchDisbursementDetailsOnce = async (
  orgId: number,
  groupId: string,
  loanDate: string,
  queryClient?: QueryClient,
) => {
  const normalized = toApiDate(loanDate);
  if (!normalized || !groupId) return [];

  const load = async () => {
    try {
      const res = await getDisbursementDetailsAPI(
        orgId,
        Number(groupId),
        normalized,
      );
      if (
        res?.message &&
        String(res.message).toLowerCase().includes("too many")
      ) {
        const waitSec = Number(res?.details?.retry_after ?? 5);
        await sleep(Math.max(1000, waitSec * 1000));
        const retry = await getDisbursementDetailsAPI(
          orgId,
          Number(groupId),
          normalized,
        );
        return extractDisbursementDetails(retry);
      }
      return extractDisbursementDetails(res);
    } catch (err: any) {
      // Don't cache rate-limit failures as empty successes
      if (err?.response?.status === 429) throw err;
      return [];
    }
  };

  if (!queryClient) {
    try {
      return await load();
    } catch {
      return [];
    }
  }

  try {
    return await queryClient.fetchQuery({
      queryKey: ["issue-register", "disbursement", orgId, groupId, normalized],
      queryFn: load,
      staleTime: DISB_STALE_MS,
    });
  } catch {
    return [];
  }
};

const runInBatches = async <T, R>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<R>,
  gapMs = 0,
  shouldContinue?: () => boolean,
) => {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    if (shouldContinue && !shouldContinue()) break;
    if (i > 0 && gapMs > 0) await sleep(gapMs);
    const chunk = items.slice(i, i + batchSize);
    const chunkResults = await Promise.all(chunk.map(worker));
    results.push(...chunkResults);
  }
  return results;
};

/** Join member / group / CO / trans_loanappl_member details onto loan report rows. */
const enrichIssueRegisterList = async (
  rows: any[],
  orgId: number,
  branchId: number,
  queryClient?: QueryClient,
  shouldContinue?: () => boolean,
) => {
  const fetchLookup = async <T,>(
    key: readonly unknown[],
    fn: () => Promise<T>,
  ): Promise<T | null> => {
    try {
      if (!queryClient) return await fn();
      return await queryClient.fetchQuery({
        queryKey: key,
        queryFn: fn,
        staleTime: LOOKUP_STALE_MS,
      });
    } catch {
      return null;
    }
  };

  const [groupRes, coRes, memberRes, schemeRes] = await Promise.all([
    fetchLookup(
      ["issue-register", "groups", orgId, branchId] as const,
      () => getGroupListAPI(orgId, branchId),
    ),
    fetchLookup(
      ["issue-register", "cos", orgId, branchId] as const,
      () => getCoListAPI(orgId, branchId),
    ),
    fetchLookup(
      ["issue-register", "members", orgId, branchId] as const,
      () => getMemberListAPI(orgId, branchId),
    ),
    fetchLookup(
      ["issue-register", "schemes", orgId] as const,
      () => getSchemeListAPI(orgId),
    ),
  ]);

  const groups = extractList(groupRes);
  const cos = extractList(coRes);
  const members = extractList(memberRes);
  const schemes = extractList(schemeRes);

  const schemeById = new Map<string, string>();
  schemes.forEach((scheme) => {
    const id = String(pick(scheme, SCHEME_ID_KEYS) || "").trim();
    const name = String(
      firstFilled(
        pick(scheme, SCHEME_KEYS),
        pickFuzzy(scheme, ["scheme_name", "schme_name", "schem_name"], ["id"]),
      ) || "",
    ).trim();
    if (id && name) {
      schemeById.set(id, name);
      // also index numeric-looking ids without leading zeros
      const asNum = String(Number(id));
      if (asNum !== "NaN") schemeById.set(asNum, name);
    }
  });

  const resolveSchemeName = (...sources: any[]) => {
    for (const source of sources) {
      if (!source) continue;
      const byName = firstFilled(
        pick(source, SCHEME_KEYS),
        pickFuzzy(source, ["scheme_name", "schme_name", "schem_name"], ["id"]),
      );
      if (byName) return String(byName);
      const schemeId = String(
        firstFilled(
          pick(source, SCHEME_ID_KEYS),
          pickFuzzy(source, ["scheme_id", "schem_id", "schme_id"]),
        ) || "",
      ).trim();
      if (!schemeId) continue;
      if (schemeById.has(schemeId)) return schemeById.get(schemeId) || "";
      const asNum = String(Number(schemeId));
      if (asNum !== "NaN" && schemeById.has(asNum)) {
        return schemeById.get(asNum) || "";
      }
    }
    return "";
  };

  const groupById = new Map<string, any>();
  const groupByName = new Map<string, any>();
  groups.forEach((group) => {
    const id = String(pick(group, GROUP_ID_KEYS) || "");
    const name = norm(pick(group, GROUP_NAME_KEYS));
    if (id) groupById.set(id, group);
    if (name) groupByName.set(name, group);
  });

  const coById = new Map<string, any>();
  cos.forEach((co) => {
    const id = String(pick(co, CO_ID_KEYS) || "");
    if (id) coById.set(id, co);
  });

  const memberById = new Map<string, any>();
  const memberByNo = new Map<string, any>();
  const memberByNameGroup = new Map<string, any>();
  const memberByName = new Map<string, any>();

  members.forEach((member) => {
    const id = String(pick(member, MEMBER_ID_KEYS) || "");
    const no = String(pick(member, MEMBER_NO_KEYS) || "");
    const name = norm(pick(member, MEMBER_NAME_KEYS));
    const groupId = String(pick(member, GROUP_ID_KEYS) || "");
    const groupName = norm(pick(member, GROUP_NAME_KEYS));

    if (id) memberById.set(id, member);
    if (no) memberByNo.set(norm(no), member);
    if (name && groupId) memberByNameGroup.set(`${name}||${groupId}`, member);
    if (name && groupName) {
      memberByNameGroup.set(`${name}||${groupName}`, member);
    }
    if (name && !memberByName.has(name)) memberByName.set(name, member);
  });

  const withGroup = rows.map((item) => {
    const groupId = String(pick(item, GROUP_ID_KEYS) || "");
    const groupName = String(pick(item, GROUP_NAME_KEYS) || "");
    const group =
      (groupId ? groupById.get(groupId) : null) ||
      (groupName ? groupByName.get(norm(groupName)) : null);

    const resolvedGroupId = String(
      firstFilled(
        groupId,
        pick(group, GROUP_ID_KEYS),
        pickFuzzy(item, ["grp", "group"], ["name"]),
      ) || "",
    );
    const resolvedGroupName = String(
      firstFilled(groupName, pick(group, GROUP_NAME_KEYS)) || "",
    );
    const rawLoanDate = pick(item, ISSUE_DATE_KEYS);

    return {
      ...item,
      _resolvedGroupId: resolvedGroupId,
      _resolvedGroupName: resolvedGroupName,
      _loanDateRaw: String(rawLoanDate || ""),
      _group: group,
    };
  });

  const resolveMemberForRow = (item: any, resolvedGroupId: string, resolvedGroupName: string) => {
    const memberId = String(pick(item, MEMBER_ID_KEYS) || "");
    const memberNo = String(pick(item, MEMBER_NO_KEYS) || "");
    const memberName = String(pick(item, MEMBER_NAME_KEYS) || "");
    const memberNameKey = norm(memberName);

    return (
      (memberId ? memberById.get(memberId) : null) ||
      (memberNo ? memberByNo.get(norm(memberNo)) : null) ||
      (memberNameKey && resolvedGroupId
        ? memberByNameGroup.get(`${memberNameKey}||${resolvedGroupId}`)
        : null) ||
      (memberNameKey && resolvedGroupName
        ? memberByNameGroup.get(`${memberNameKey}||${norm(resolvedGroupName)}`)
        : null) ||
      (memberNameKey ? memberByName.get(memberNameKey) : null)
    );
  };

  const rowNeedsDisbursementFetch = (
    item: any,
    resolvedGroupId: string,
    resolvedGroupName: string,
    group: any,
  ) => {
    const member = resolveMemberForRow(item, resolvedGroupId, resolvedGroupName);
    const schemeName = firstFilled(
      pick(item, SCHEME_KEYS),
      pick(member, SCHEME_KEYS),
      resolveSchemeName(item, member, group),
    );
    const guarantor = firstMeaningful(
      pickGuarantorName(item),
      pickGuarantorName(member),
    );
    const installment = firstFilled(
      pick(item, INSTL_AMT_KEYS),
      pick(member, INSTL_AMT_KEYS),
    );
    const realisable = firstFilled(
      pick(item, REALISABLE_KEYS),
      pick(member, REALISABLE_KEYS),
    );

    const hasScheme = String(schemeName || "").trim() !== "";
    const hasGuarantor = String(guarantor || "").trim() !== "";
    const hasInstallment = String(installment || "").trim() !== "";
    const hasRealisable = String(realisable || "").trim() !== "";

    // Guarantor-only gaps are handled by GetLoanCycleList fallback — skip disbursement.
    if (hasScheme && hasInstallment && hasRealisable && !hasGuarantor) {
      return false;
    }

    return !hasScheme || !hasGuarantor || !hasInstallment || !hasRealisable;
  };

  const toDisbursementKey = (row: any) => {
    const groupId = String(row._resolvedGroupId || "");
    const dateKey = toApiDate(row._loanDateRaw);
    if (!groupId || !dateKey) return "";
    return `${groupId}||${dateKey}`;
  };

  // Only GetDisbursementDetails for rows still missing scheme / guarantor / amounts
  // after report + branch member lookup — not for every row in the register.
  const disbursementKeyPriority = new Map<string, number>();
  withGroup.forEach((row) => {
    if (
      !rowNeedsDisbursementFetch(
        row,
        String(row._resolvedGroupId || ""),
        String(row._resolvedGroupName || ""),
        row._group,
      )
    ) {
      return;
    }
    const key = toDisbursementKey(row);
    if (!key) return;
    disbursementKeyPriority.set(key, (disbursementKeyPriority.get(key) || 0) + 1);
  });

  const disbursementKeys = Array.from(disbursementKeyPriority.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_DISBURSEMENT_FETCHES)
    .map(([key]) => key);

  const disbursementIndexByKey = new Map<
    string,
    ReturnType<typeof indexLoanApplRows>
  >();
  const disbursementIndexByGroup = new Map<
    string,
    ReturnType<typeof indexLoanApplRows>
  >();

  await runInBatches(
    disbursementKeys,
    DISBURSEMENT_BATCH_SIZE,
    async (key) => {
      const [groupId, dateKey] = key.split("||");
      const list = await fetchDisbursementDetailsOnce(
        orgId,
        groupId,
        dateKey,
        queryClient,
      );
      const indexed = indexLoanApplRows(list);
      disbursementIndexByKey.set(key, indexed);

      const prev = disbursementIndexByGroup.get(groupId);
      if (!prev) {
        disbursementIndexByGroup.set(groupId, indexed);
      } else {
        const mergedRows = [...prev.all, ...indexed.all];
        disbursementIndexByGroup.set(groupId, indexLoanApplRows(mergedRows));
      }
      return key;
    },
    DISBURSEMENT_BATCH_GAP_MS,
    shouldContinue,
  );

  const pickDisbursementMatch = (item: any, resolvedGroupId: string) => {
    const dateCandidates = Array.from(
      new Set(
        [
          toApiDate(item._loanDateRaw),
          toApiDate(pick(item, ISSUE_DATE_KEYS)),
          toApiDate(pick(item, ["Loan_Date", "loan_date"])),
        ].filter(Boolean),
      ),
    );

    let best: any = null;
    for (const dateKey of dateCandidates) {
      const detailKey = `${resolvedGroupId}||${dateKey}`;
      const matched = findLoanApplMatch(
        item,
        disbursementIndexByKey.get(detailKey) || indexLoanApplRows([]),
      );
      best = betterRow(best, matched);
    }

    const groupIndex =
      disbursementIndexByGroup.get(resolvedGroupId) || indexLoanApplRows([]);
    best = betterRow(best, findLoanApplMatch(item, groupIndex));

    if (!best && groupIndex.all.length === 1) best = groupIndex.all[0];
    return best;
  };

  const draftRows = withGroup.map((item) => {
    const group = item._group;
    const resolvedGroupId = String(item._resolvedGroupId || "");
    const resolvedGroupName = String(item._resolvedGroupName || "");

    const memberId = String(pick(item, MEMBER_ID_KEYS) || "");
    const memberNo = String(pick(item, MEMBER_NO_KEYS) || "");
    const memberName = String(pick(item, MEMBER_NAME_KEYS) || "");

    const member = resolveMemberForRow(item, resolvedGroupId, resolvedGroupName);

    const lookupSource = { ...item, ...member };

    const loanApplFromDetails = resolvedGroupId
      ? pickDisbursementMatch(lookupSource, resolvedGroupId)
      : null;

    const detailsMapped = loanApplFromDetails
      ? mapLoanApplFields(loanApplFromDetails)
      : null;
    const reportMapped = mapLoanApplFields(item);

    const coId =
      String(pick(item, CO_ID_KEYS) || "") ||
      String(pick(loanApplFromDetails, CO_ID_KEYS) || "") ||
      String(pick(member, CO_ID_KEYS) || "") ||
      String(pick(group, CO_ID_KEYS) || "");
    const co = coId ? coById.get(coId) : null;

    const resolvedMemberId = String(
      firstFilled(
        pick(item, MEMBER_ID_KEYS),
        detailsMapped?.Member_Id,
        pick(loanApplFromDetails, MEMBER_ID_KEYS),
        pick(member, MEMBER_ID_KEYS),
      ) || "",
    );

    const schemeId = String(
      firstFilled(
        detailsMapped?.Scheme_Id,
        reportMapped.Scheme_Id,
        pick(loanApplFromDetails, SCHEME_ID_KEYS),
        pick(item, SCHEME_ID_KEYS),
        pick(member, SCHEME_ID_KEYS),
      ) || "",
    );

    const guarantor = firstMeaningful(
      pickGuarantorName(loanApplFromDetails),
      detailsMapped?.Guaranter_Name,
      pickGuarantorName(item),
      reportMapped.Guaranter_Name,
      pickGuarantorName(member),
    );

    const schemeName = firstFilled(
      detailsMapped?.Schme_Name,
      pick(loanApplFromDetails, SCHEME_KEYS),
      pickFuzzy(
        loanApplFromDetails,
        ["schme_name", "scheme_name", "schm_name"],
        ["id"],
      ),
      resolveSchemeName(
        loanApplFromDetails,
        detailsMapped,
        item,
        member,
        group,
        schemeId ? { Scheme_Id: schemeId } : null,
      ),
      reportMapped.Schme_Name,
      pick(item, SCHEME_KEYS),
      schemeId
        ? schemeById.get(schemeId) ||
            schemeById.get(String(Number(schemeId)))
        : "",
    );

    return {
      ...item,
      Loan_Date: firstFilled(
        pick(item, ISSUE_DATE_KEYS),
        detailsMapped?.Loan_Date,
      ),
      Grp_Name: firstFilled(
        pick(item, GROUP_NAME_KEYS),
        pick(group, GROUP_NAME_KEYS),
        pick(member, GROUP_NAME_KEYS),
      ),
      Member_Id: resolvedMemberId,
      Member_No: firstFilled(
        pick(item, MEMBER_NO_KEYS),
        detailsMapped?.Member_No,
        pick(member, MEMBER_NO_KEYS),
      ),
      Member_Name: firstFilled(
        pick(item, MEMBER_NAME_KEYS),
        detailsMapped?.Member_Name,
        pick(member, MEMBER_NAME_KEYS),
      ),
      FatHusb_Name: firstFilled(
        pick(item, GUARDIAN_KEYS),
        detailsMapped?.Gurdain_Name,
        pick(member, GUARDIAN_KEYS),
      ),
      Area_Name: firstFilled(
        pick(item, AREA_KEYS),
        pick(member, AREA_KEYS),
        pick(group, AREA_KEYS),
      ),
      Loan_Amt: firstFilled(
        detailsMapped?.Loan_Amount,
        reportMapped.Loan_Amount,
        pick(item, AMOUNT_KEYS),
      ),
      Account_Id: firstFilled(
        detailsMapped?.Account_Id,
        reportMapped.Account_Id,
      ),
      Scheme_Id: schemeId,
      Schme_Name: schemeName,
      RoI: firstFilled(detailsMapped?.RoI, reportMapped.RoI),
      Loan_Cycle: firstFilled(
        detailsMapped?.Loan_Cycle,
        reportMapped.Loan_Cycle,
      ),
      Installment_No: firstFilled(
        detailsMapped?.Installment_No,
        reportMapped.Installment_No,
      ),
      Installment_Amt: firstFilled(
        detailsMapped?.Installment_Amt,
        reportMapped.Installment_Amt,
      ),
      Realisable_Amt: firstFilled(
        detailsMapped?.Realisable_Amt,
        reportMapped.Realisable_Amt,
        pick(item, REALISABLE_KEYS),
      ),
      Guaranter_Name: guarantor,
      Co_Name: firstFilled(
        pick(item, CO_KEYS),
        detailsMapped?.Co_Name,
        pick(co, CO_KEYS),
        pick(member, CO_KEYS),
        pick(group, CO_KEYS),
      ),
      Group_Id: resolvedGroupId,
      CO_Id: coId || "",
      _resolvedGroupId: resolvedGroupId,
      _resolvedMemberId: resolvedMemberId,
    };
  });

  // No per-member GetLoanCycleList / GetLoanCollectionReport fan-out —
  // GetLoanIssueRegister already returns the register rows.
  return draftRows.map((row) => {
    const {
      _resolvedGroupId,
      _resolvedMemberId,
      _group,
      _resolvedGroupName,
      _loanDateRaw,
      ...rest
    } = row;
    return rest;
  });
};

const toIssueRegisterRows = (list: any[]) => {
  return [...list].sort((a, b) => {
    const da = parseDate(pick(a, ISSUE_DATE_KEYS))?.getTime() ?? 0;
    const db = parseDate(pick(b, ISSUE_DATE_KEYS))?.getTime() ?? 0;
    if (da !== db) return da - db;
    const ga = String(pick(a, GROUP_NAME_KEYS) || "");
    const gb = String(pick(b, GROUP_NAME_KEYS) || "");
    if (ga !== gb) return ga.localeCompare(gb);
    return String(pick(a, MEMBER_NAME_KEYS) || "").localeCompare(
      String(pick(b, MEMBER_NAME_KEYS) || ""),
    );
  });
};

export const useIssueRegister = () => {
  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const [loading, setLoading] = useState(false);
  const searchGenRef = useRef(0);
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const schema = yup.object().shape({
    fromDate: yup.mixed().required("From date is required"),
    toDate: yup.mixed().required("To date is required"),
    branch: yup.mixed().required("Branch is required"),
  });

  const methods = useForm<IssueRegisterForm>({
    defaultValues: {
      fromDate: "",
      toDate: "",
      branch: "",
    },
    resolver: yupResolver(schema) as any,
  });

  const resetForm = () => {
    searchGenRef.current += 1;
    methods.reset({
      fromDate: "",
      toDate: "",
      branch: "",
    });
    dispatch(setIssueRegisterList(null));
  };

  /** Same pattern as detailed-list / collection-register branch load. */
  const getBranchListAPICall = async (org_Id: number) => {
    try {
      const res = await getBranchListAPI(org_Id);
      if (res?.message === "Data Found" || Array.isArray(res?.Data)) {
        dispatch(setBranchList(extractList(res)));
      } else {
        dispatch(setBranchList([]));
      }
    } catch {
      dispatch(setBranchList([]));
    }
  };

  /** GetLoanIssueRegister expects dd-MM-yyyy (e.g. 01-01-2026). */
  const formatFormDate = (value: IssueRegisterForm["fromDate"]) => {
    if (!value) return "";
    if (value instanceof Date) return format(value, "dd-MM-yyyy");
    const parsed = parseDate(value);
    if (parsed) return format(parsed, "dd-MM-yyyy");
    return String(value);
  };

  /**
   * Same search shell as detailed-list:
   * loading = primary GetLoanIssueRegister only; enrichment runs in background.
   */
  const getIssueRegisterAPICall = async (
    branchId: number,
    fromDate: string,
    toDate: string,
    searchId: number,
  ) => {
    if (!orgId || !branchId) {
      dispatch(setIssueRegisterList([]));
      return;
    }

    try {
      setLoading(true);
      const res = await getIssueRegisterAPI(
        Number(orgId),
        branchId,
        fromDate,
        toDate,
      );

      if (searchId !== searchGenRef.current) return;

      const message = String(res?.message || res?.data?.message || "");
      const list =
        Array.isArray(res?.details) && res.details.length > 0
          ? res.details
          : extractList(res);

      const hasData =
        (/data found/i.test(message) || list.length > 0) && Array.isArray(list);

      if (!hasData) {
        dispatch(setIssueRegisterList([]));
        return;
      }

      // Show primary report rows immediately (detailed-list / collection-register style)
      dispatch(setIssueRegisterList(toIssueRegisterRows(list)));

      // Optional column enrichment — does not block Search loading
      void (async () => {
        try {
          const isCurrentSearch = () => searchId === searchGenRef.current;
          const enriched = await enrichIssueRegisterList(
            list,
            Number(orgId),
            branchId,
            queryClient,
            isCurrentSearch,
          );
          if (!isCurrentSearch()) return;
          dispatch(setIssueRegisterList(toIssueRegisterRows(enriched)));
        } catch {
          // Keep base report rows already shown
        }
      })();
    } catch {
      if (searchId !== searchGenRef.current) return;
      dispatch(setIssueRegisterList([]));
    } finally {
      if (searchId === searchGenRef.current) {
        setLoading(false);
      }
    }
  };

  const onSubmit = (data: IssueRegisterForm) => {
    try {
      const searchId = ++searchGenRef.current;
      dispatch(setIssueRegisterList(null));
      getIssueRegisterAPICall(
        Number(data.branch),
        formatFormDate(data.fromDate),
        formatFormDate(data.toDate),
        searchId,
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    methods,
    resetForm,
    getBranchListAPICall,
    onSubmit,
    orgId,
    loading,
  };
};
