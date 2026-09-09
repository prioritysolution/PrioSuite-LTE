import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getBranchListAPI = async (orgId: number) => {
  return await doGetApiCall({ url: endPoints.getBranchList(orgId) });
};

export const getIssueRegisterAPI = async (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
) => {
  return await doGetApiCall({
    url: endPoints.getIssueRegister(orgId, branchId, fromDate, toDate),
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

export const getMemberListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getMemberList(orgId, branchId),
  });
};

/** trans_loanappl_member rows (Guaranter_Name, scheme, installment, etc.) */
export const getDisbursementDetailsAPI = async (
  orgId: number,
  groupId: number,
  loanDate: string,
) => {
  return await doGetApiCall({
    url: endPoints.getDisbursementDetails(orgId, groupId, loanDate),
  });
};

export const getAllMemberListAPI = async (
  orgId: number,
  groupId: string | number,
) => {
  return await doGetApiCall({
    url: endPoints.getAllMemberList(orgId, String(groupId)),
  });
};

/** Group members (Member_No / name) — merge with GetAllMemberList like loan collection */
export const getGroupMemberAPI = async (
  orgId: number,
  groupId: string | number,
) => {
  return await doGetApiCall({
    url: endPoints.getGroupMember(orgId, groupId),
  });
};

export const getDisbursementListAPI = async (
  orgId: number,
  branchId: number,
) => {
  return await doGetApiCall({
    url: endPoints.getDisbursementList(orgId, branchId),
  });
};

export const getSchemeListAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getScheme(orgId),
  });
};

export const getLoanCycleListAPI = async (
  orgId: number,
  branchId: number,
  groupId: string | number,
  memberId: string | number,
) => {
  return await doGetApiCall({
    url: endPoints.getLoanCycleList(
      orgId,
      branchId,
      String(groupId),
      String(memberId),
    ),
  });
};

/** loan_info packet — Scheme_Id / guarantor fallbacks for issued loans */
export const getLoanCollectionReportAPI = async (
  orgId: number,
  groupId: string | number,
  memberId: string | number,
  fromDate: string,
  toDate: string,
  branchId: string | number,
  loancycleId: string | number,
) => {
  return await doGetApiCall({
    url: endPoints.getLoanCollectionReport(
      orgId,
      String(groupId),
      String(memberId),
      fromDate,
      toDate,
      String(branchId),
      String(loancycleId),
    ),
  });
};
