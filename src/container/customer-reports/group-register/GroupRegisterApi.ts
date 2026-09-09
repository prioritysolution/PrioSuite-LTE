import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getBranchListAPI = async (orgId: number) => {
  return await doGetApiCall({ url: endPoints.getBranchList(orgId) });
};

export const getGroupRegisterAPI = async (
  orgId: number,
  branchId: number,
  fromDate?: string,
  toDate?: string,
) => {
  return await doGetApiCall({
    url: endPoints.getGroupRegister(orgId, branchId, fromDate, toDate),
  });
};
