import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getLoanPurposeAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getLoanPurpose(orgId),
  });
};

export const addLoanPurposeAPI = async (payload: {
  purpose: string;
  org_id: number;
}) => {
  return await doPostApiCall({
    url: endPoints.addLoanPurpose,
    bodyData: payload,
  });
};

export const updateLoanPurposeAPI = async (payload: {
  purpose_id: number;
  purpose: string;
  org_id: number;
}) => {
  return await doPutApiCall({
    url: endPoints.updateLoanPurpose,
    bodyData: payload,
  });
};

export const deleteLoanPurposeAPI = async (payload: {
  purpose_id: number;
  org_id: number;
}) => {
  return await doPostApiCall({
    url: endPoints.deleteLoanPurpose,
    bodyData: payload,
  });
};
