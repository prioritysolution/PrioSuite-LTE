import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getBranchListAPI = async (orgId: number) => {
  return await doGetApiCall({ url: endPoints.getBranchList(orgId) });
};

export const getMemberRegisterAPI = async (
  orgId: number,
  branchId: number,
  fromDate?: string,
  toDate?: string,
) => {
  return await doGetApiCall({
    url: endPoints.getMemberRegister(orgId, branchId, fromDate, toDate),
  });
};

export const getGroupListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getGroupList(orgId, branchId),
  });
};

export const getCoListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getCoList(orgId, branchId),
  });
};
