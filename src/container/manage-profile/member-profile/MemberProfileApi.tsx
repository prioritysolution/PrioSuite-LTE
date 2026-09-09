import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getMemberDataAPI = async (orgId: number, memNo: string, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getMemberData(orgId, memNo, branchId),
  });
};

export const getMiscConfigAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getMiscConfig(orgId, branchId),
  });
};

const normalizeKey = (key: string) => key.toLowerCase().replace(/[\s-]/g, "_");

const toAmount = (value: any): number | "" => {
  if (value === undefined || value === null || value === "") return "";
  const n = Number(value);
  return Number.isNaN(n) ? "" : n;
};

export const extractMiscField = (res: any, keys: string[]): number | "" => {
  const wanted = keys.map(normalizeKey);
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];

  const pick = (source: any): number | "" => {
    if (!source || typeof source !== "object") return "";
    if (Array.isArray(source)) {
      for (const item of source) {
        const value = pick(item);
        if (value !== "") return value;
      }
      return "";
    }

    for (const key of Object.keys(source)) {
      if (!wanted.includes(normalizeKey(key))) continue;
      const value = toAmount(source[key]);
      if (value !== "") return value;
    }

    const name =
      source.Config_Name ??
      source.Key ??
      source.Name ??
      source.Param_Name ??
      source.Misc_Name;
    const rawValue =
      source.Config_Value ??
      source.Value ??
      source.Param_Value ??
      source.Misc_Value;
    if (name && wanted.includes(normalizeKey(String(name)))) {
      return toAmount(rawValue);
    }

    return "";
  };

  for (const candidate of candidates) {
    const value = pick(candidate);
    if (value !== "") return value;
  }

  return "";
};

export const addMemberAPI = async (payload: any) => {
  return await doPostApiCall({
    url: endPoints.addMember,
    bodyData: payload,
  });
};

export const updateMemberAPI = async (payload: any) => {
  return await doPutApiCall({
    url: endPoints.updateMember,
    bodyData: payload,
  });
};

export const searchMemberAPI = async (orgId: number, keyword: string, branchId: number, page: number = 1) => {
  return await doGetApiCall({
    url: endPoints.searchMember(orgId, keyword, branchId, page),
  });
};

export const getMemberListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getMemberList(orgId, branchId),
  });
};

export const getAllGroupListAPI = async (orgId: number, branchId?: string | number) => {
  return await doGetApiCall({
    url: endPoints.getAllGroupList(orgId, branchId),
  });
};

export const getAllMemberListAPI = async (orgId: number, groupId: string) => {
  return await doGetApiCall({
    url: endPoints.getAllMemberList(orgId, groupId),
  });
};
