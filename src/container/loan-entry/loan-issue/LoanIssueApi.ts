import { doPostApiCall, doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getDisbursementListAPI = async (
  orgId: number,
  branchId: number,
) => {
  return await doGetApiCall({
    url: endPoints.getDisbursementList(orgId, branchId),
  });
};

export const getDisbursementDetailsAPI = async (
  orgId: number,
  groupId: number,
  loanDate: string,
) => {
  return await doGetApiCall({
    url: endPoints.getDisbursementDetails(orgId, groupId, loanDate),
  });
};

export const postDisbursementAPI = async (bodyData: any) => {
  return await doPostApiCall({
    url: endPoints.postDisbursement,
    bodyData: bodyData,
  });
};
