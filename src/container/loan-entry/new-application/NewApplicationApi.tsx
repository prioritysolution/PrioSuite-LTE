import { doPostApiCall, doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const saveGroupLoanAPI = async (payload: any) => {
  return await doPostApiCall({
    url: endPoints.postApplication,
    bodyData: payload,
  });
};

export const searchGroupAPI = async (
  orgId: number,
  keyword: string,
  branchId: number,
) => {
  return await doGetApiCall({
    url: endPoints.searchGroup(orgId, keyword, branchId),
  });
};

export const getGroupListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getGroupList(orgId, branchId),
  });
};

export const getGroupDataAPI = async (
  orgId: number,
  groupNo: string,
  branchId: number,
) => {
  return await doGetApiCall({
    url: endPoints.getGroupData(orgId, groupNo, branchId),
  });
};

export const getSchemeAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getScheme(orgId),
  });
};

export const getGroupMemberAPI = async (orgId: number, grpId: string) => {
  return await doGetApiCall({
    url: endPoints.getGroupMember(orgId, grpId),
  });
};

export const getLoanPurposeAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getLoanPurpose(orgId),
  });
};

export const getLoanOtherInfoAPI = async (
  orgId: number,
  schemeId: number,
  loanDate: string,
  memId: number,
  applAmt: number,
) => {
  return await doGetApiCall({
    url: endPoints.getLoanOtherInfo(orgId, schemeId, loanDate, memId, applAmt),
  });
};

export const getCoListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getCoList(orgId, branchId),
  });
};
