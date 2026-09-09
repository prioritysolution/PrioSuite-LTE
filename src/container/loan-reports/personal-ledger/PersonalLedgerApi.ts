import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getAllGroupListAPI = async (
  orgId: number,
  branchId?: string | number,
) => {
  const response = await doGetApiCall({
    url: endPoints.getAllGroupList(orgId, branchId),
  });
  return response;
};

export const getAllMemberListAPI = async (orgId: number, groupId: string) => {
  const response = await doGetApiCall({
    url: endPoints.getAllMemberList(orgId, groupId),
  });
  return response;
};

export const getLoanCollectionReportAPI = async (
  orgId: number,
  groupId: string,
  memberId: string,
  fromDate: string,
  toDate: string,
  branchId: string,
  loancycleId: string,
) => {
  const response = await doGetApiCall({
    url: endPoints.getLoanCollectionReport(
      orgId,
      groupId,
      memberId,
      fromDate,
      toDate,
      branchId,
      loancycleId,
    ),
  });
  return response;
};

export const getLoanCycleListAPI = async (
  orgId: number,
  branchId: number,
  groupId: string,
  memberId: string,
) => {
  const response = await doGetApiCall({
    url: endPoints.getLoanCycleList(orgId, branchId, groupId, memberId),
  });
  return response;
};
