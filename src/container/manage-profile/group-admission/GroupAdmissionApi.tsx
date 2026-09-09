import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getGroupDataAPI = async (orgId: number, groupNo: string, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getGroupData(orgId, groupNo, branchId),
  });
};

export const getMiscConfigAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getMiscConfig(orgId, branchId),
  });
};

const FEE_KEYS = [
  "grp_adm_amt",
  "grp_adm_fee",
  "group_adm_fee",
  "group_admission_fee",
  "adm_amt",
  "adm_fee",
  "admamt",
  "admfee",
  "admission_fee",
  "admissionfee",
];

const NAME_KEYS = [
  "config_name",
  "misc_name",
  "param_name",
  "key",
  "name",
  "code",
  "config_code",
];

const VALUE_KEYS = [
  "config_value",
  "misc_value",
  "param_value",
  "value",
  "amt",
  "amount",
];

const toFeeNumber = (value: any): number | "" => {
  if (value === undefined || value === null || value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? "" : n;
};

const normalizeKey = (key: string) => key.toLowerCase().replace(/[\s-]/g, "_");

const scoreFeeName = (name: string) => {
  const n = name.toLowerCase();
  if ((/grp|group/.test(n) && /adm|fee/.test(n)) || n.includes("grp_adm")) return 3;
  if (/admission/.test(n) && /fee|amt/.test(n)) return 2;
  if (/adm_fee|admfee|adm_amt|admamt/.test(n)) return 2;
  if (/adm|fee/.test(n)) return 1;
  return 0;
};

const pickFeeFromObject = (source: any): number | "" => {
  if (!source || typeof source !== "object" || Array.isArray(source)) return "";

  for (const key of FEE_KEYS) {
    const found = Object.keys(source).find((k) => normalizeKey(k) === key);
    if (!found) continue;
    const fee = toFeeNumber(source[found]);
    if (fee !== "") return fee;
  }

  const nameKey = Object.keys(source).find((k) =>
    NAME_KEYS.includes(normalizeKey(k)),
  );
  const valueKey = Object.keys(source).find((k) =>
    VALUE_KEYS.includes(normalizeKey(k)),
  );
  if (nameKey && valueKey && scoreFeeName(String(source[nameKey] ?? "")) > 0) {
    return toFeeNumber(source[valueKey]);
  }

  return "";
};

export const extractAdmissionFee = (res: any): number | "" => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];

  let bestScore = 0;
  let bestFee: number | "" = "";

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const direct = pickFeeFromObject(item);
        if (direct !== "") return direct;

        const nameKey = item
          ? Object.keys(item).find((k) => NAME_KEYS.includes(normalizeKey(k)))
          : undefined;
        const valueKey = item
          ? Object.keys(item).find((k) => VALUE_KEYS.includes(normalizeKey(k)))
          : undefined;
        if (!nameKey || !valueKey) continue;
        const score = scoreFeeName(String(item[nameKey] ?? ""));
        const fee = toFeeNumber(item[valueKey]);
        if (score > bestScore && fee !== "") {
          bestScore = score;
          bestFee = fee;
        }
      }
      if (bestFee !== "") return bestFee;
    } else {
      const fee = pickFeeFromObject(candidate);
      if (fee !== "") return fee;
    }
  }

  return bestFee;
};

export const addGroupAPI = async (payload: any) => {
  return await doPostApiCall({
    url: endPoints.addGroup,
    bodyData: payload,
  });
};

export const updateGroupAPI = async (payload: any) => {
  return await doPutApiCall({
    url: endPoints.updateGroup,
    bodyData: payload,
  });
};

export const searchGroupAPI = async (orgId: number, keyword: string, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.searchGroup(orgId, keyword, branchId),
  });
};

export const getGroupListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getGroupList(orgId, branchId),
  });
};
