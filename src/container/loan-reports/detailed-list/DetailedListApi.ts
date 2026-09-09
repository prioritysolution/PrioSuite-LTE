import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getBranchListAPI = async (orgId: number) => {
  const response = await doGetApiCall({ url: endPoints.getBranchList(orgId) });
  return response;
};

export const getSchemeListAPI = async (orgId: number) => {
  const response = await doGetApiCall({ url: endPoints.getSchemeList(orgId) });
  return response;
};

export const getGroupLoanReportAPI = async (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
  schemeId?: number | string | null,
) => {
  const response = await doGetApiCall({
    url: endPoints.getGroupLoanReport(
      orgId,
      branchId,
      fromDate,
      toDate,
      schemeId,
    ),
  });
  return response;
};
