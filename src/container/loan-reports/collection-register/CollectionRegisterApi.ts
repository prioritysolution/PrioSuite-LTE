import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getBranchListAPI = async (orgId: number) => {
  return await doGetApiCall({ url: endPoints.getBranchList(orgId) });
};

/** Single branch + date-range call for collection register (Coll_Date). */
export const getCollectionRegisterAPI = async (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
) => {
  return await doGetApiCall({
    url: endPoints.getCollectionRegister(orgId, branchId, fromDate, toDate),
  });
};
