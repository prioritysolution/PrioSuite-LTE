import { doGetApiCall, doPostApiCall, doPutApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getHolidayListAPI = async (orgId: number) => {
  return await doGetApiCall({
    url: endPoints.getHolidayList(orgId),
  });
};

export const addHolidayAPI = async (payload: { holiday_date: string; purpose: string; org_id: number }) => {
  return await doPostApiCall({
    url: endPoints.addHoliday,
    bodyData: payload,
  });
};

export const updateHolidayAPI = async (payload: { holiday_id: number; holiday_date: string; purpose: string; org_id: number }) => {
  return await doPutApiCall({
    url: endPoints.updateHoliday,
    bodyData: payload,
  });
};

export const deleteHolidayAPI = async (payload: {
  holiday_id: number;
  org_id: number;
}) => {
  return await doPostApiCall({
    url: endPoints.deleteHoliday,
    bodyData: payload,
  });
};
