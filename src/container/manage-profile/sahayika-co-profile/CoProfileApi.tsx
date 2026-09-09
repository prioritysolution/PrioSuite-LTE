import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const addCoAPI = async (payload: any) => {
  return await doPostApiCall({
    url: endPoints.addCo,
    bodyData: payload,
  });
};

export const updateCoAPI = async (payload: any) => {
  return await doPutApiCall({
    url: endPoints.updateCo,
    bodyData: payload,
  });
};

export const getCoListAPI = async (
  orgId: number,
  branchId: number,
  keyword?: string,
) => {
  return await doGetApiCall({
    url: endPoints.getCoList(orgId, branchId, keyword),
  });
};

export const searchCoAPI = async (
  orgId: number,
  keyword: string,
  branchId: number,
) => {
  return await doGetApiCall({
    url: endPoints.searchCo(orgId, keyword, branchId),
  });
};

export const getCoDataAPI = async (
  orgId: number,
  branchId: number,
  options: { co_id?: number; co_code?: string },
) => {
  const attempts = [
    endPoints.getCoData(orgId, branchId, options.co_id, options.co_code),
    options.co_id
      ? endPoints.getCoData(orgId, branchId, options.co_id)
      : "",
    options.co_code
      ? endPoints.getCoData(orgId, branchId, undefined, options.co_code)
      : "",
  ].filter(Boolean);

  let lastError: unknown = null;

  for (const url of attempts) {
    try {
      return await doGetApiCall({ url });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};
