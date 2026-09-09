import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getSchemeListAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getSchemeList(orgId),
  });
};

export const addSchemeAPI = async (payload: {
  scheme_name: string;
  roi: number;
  repay_mode: number;
  repay_period: number;
  sanction_limit: number;
  roi_od: number;
  instl_amt_1000: number;
  prn_ledger: number;
  intt_ledger: number;
  org_id: number;
}) => {
  return await doPostApiCall({
    url: endPoints.addScheme,
    bodyData: payload,
  });
};

export const updateSchemeAPI = async (payload: {
  scheme_id: number;
  scheme_name: string;
  roi: number;
  repay_mode: number;
  repay_period: number;
  sanction_limit: number;
  roi_od: number;
  instl_amt_1000: number;
  prn_ledger: number;
  intt_ledger: number;
  org_id: number;
}) => {
  return await doPutApiCall({
    url: endPoints.updateScheme,
    bodyData: payload,
  });
};

export const deleteSchemeAPI = async (payload: {
  scheme_id: number;
  org_id: number;
}) => {
  return await doPostApiCall({
    url: endPoints.deleteScheme,
    bodyData: payload,
  });
};

export const getApplicationOptionAPI = async (groupId: number) => {
  return await doGetApiCall({
    url: endPoints.getApplicationOption(groupId),
  });
};

export const getLedgerListAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getLedgerList(orgId),
  });
};
