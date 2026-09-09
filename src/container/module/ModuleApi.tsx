import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const fetchItemsAPI = async (orgId: number, branchId: number) => {
  // Example of using doGetApiCall
  const response = await doGetApiCall({
    url: endPoints.getAreaList(orgId, branchId),
  });
  return response;
};

export const createItemAPI = async (payload: any) => {
  // Example of using doPostApiCall
  const response = await doPostApiCall({
    url: `${endPoints.login}`, // placeholder url for posting
    bodyData: payload,
  });
  return response;
};
