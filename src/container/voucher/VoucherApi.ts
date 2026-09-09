import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getLedgerListAPI = async (orgId: number) => {
  const response = await doGetApiCall({
    url: endPoints.getLedgerList(orgId),
  });
  return response;
};

export const postVoucherAPI = async (payload: any) => {
  const response = await doPostApiCall({
    url: `${endPoints.postVoucher}`,
    bodyData: payload,
  });
  return response;
};
