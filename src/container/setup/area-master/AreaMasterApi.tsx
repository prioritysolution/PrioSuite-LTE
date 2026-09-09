import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getAreaListAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getAreaList(orgId, branchId),
  });
};

export const addAreaAPI = async (payload: { area_name: string; area_desc: string; branch_id: number; org_id: number; area_type: string | number; }) => {
  return await doPostApiCall({
    url: endPoints.addArea,
    bodyData: payload,
  });
};

export const updateAreaAPI = async (payload: { area_id: number; area_name: string; area_desc: string; branch_id: number; org_id: number; area_type: string | number; }) => {
  return await doPutApiCall({
    url: endPoints.updateArea,
    bodyData: payload,
  });
};

export const deleteAreaAPI = async (payload: { area_id: number; org_id: number; branch_id: number }) => {
  return await doPostApiCall({
    url: endPoints.deleteArea,
    bodyData: payload,
  });
};

export const getApplicationOptionAPI = async (groupId: number) => {
  return await doGetApiCall({
    url: endPoints.getApplicationOption(groupId),
  });
};
