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
    url: endPoints.getLoanEligibleMember(orgId, grpId),
  });
};

export const mapGroupMembers = (response: any): any[] => {
  const membersList = response?.Data || response?.data?.Data;
  if (!Array.isArray(membersList)) return [];
  return membersList.map((m: any) => ({
    mem_id: m.Member_Id,
    member_no: m.Member_No,
    member_name: m.Member_Name,
    gurdain_name: m.FatHusb_Name || m.Guardian_Name || "",
    area: m.Area_Name || "",
    loan_amount: "",
    purpose: "",
    guranter_name: "",
    has_active_loan: Number(m.Has_Active_Loan) === 1,
    active_loan_reason: m.Active_Loan_Reason ?? null,
    active_account_no: m.Active_Account_No ?? null,
  }));
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

/** Same response-shape parsing used by Loan Other Info modal. */
export const extractLoanOtherInfoRow = (infoData: any) => {
  if (!infoData) return null;
  if (infoData.Data && infoData.Data[0]) return infoData.Data[0];
  if (infoData.data && infoData.data.Data && infoData.data.Data[0]) {
    return infoData.data.Data[0];
  }
  if (
    infoData.data &&
    infoData.data.data &&
    infoData.data.data.data &&
    infoData.data.data.data[0]
  ) {
    return infoData.data.data.data[0];
  }
  if (infoData.data && infoData.data.data && infoData.data.data[0]) {
    return infoData.data.data[0];
  }
  if (infoData.data && infoData.data[0]) return infoData.data[0];
  return null;
};

/** Same field mapping used when Accept applies modal data. */
export const mapLoanOtherInfoFields = (resData: any) => ({
  ln_cycle: resData.Loan_Cycle ?? resData.ln_cycle ?? 1,
  inst_no: resData.Inst_No ?? resData.inst_no ?? resData.No_Of_Inst ?? 0,
  inst_amt: resData.Inst_Amt ?? resData.inst_amt ?? 0,
  resil_amt:
    resData.Tot_Repay_Amt ??
    resData.Tot_repay_amt ??
    resData.Resil_Amt ??
    resData.resil_amt ??
    0,
  final_date: resData.Final_Date ?? resData.final_date ?? "",
});

export const getCoListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getCoList(orgId, branchId),
  });
};
