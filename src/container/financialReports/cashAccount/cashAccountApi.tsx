import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getCashAccountReportAPI = async (
  orgId: number,
  fromDate: string,
  toDate: string,
  branchId: string,
) => {
  const response = await doGetApiCall({
    url: endPoints.cashAccount(orgId, fromDate, toDate, branchId),
  });
  return response;
};
