import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getGroupListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getGroupList(orgId, branchId),
  });
};

export const getAllMemberListAPI = async (orgId: number, groupId: string) => {
  return await doGetApiCall({
    url: endPoints.getAllMemberList(orgId, groupId),
  });
};

export const getGroupMemberAPI = async (orgId: number, groupId: string) => {
  return await doGetApiCall({
    url: endPoints.getGroupMember(orgId, groupId),
  });
};

export const getLoanCycleListAPI = async (
  orgId: number,
  branchId: number,
  groupId: string,
  memberId: string,
) => {
  return await doGetApiCall({
    url: endPoints.getLoanCycleList(orgId, branchId, groupId, memberId),
  });
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
  return await doGetApiCall({
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
};

export const getSchemeListAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getScheme(orgId),
  });
};

export const postCollectionAPI = async (bodyData: any) => {
  return await doPostApiCall({
    url: endPoints.postCollection,
    bodyData,
  });
};
