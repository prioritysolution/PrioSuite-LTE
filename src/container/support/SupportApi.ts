import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const getSupportTicketsAPI = async (orgId: number, branchId: number) => {
  return await doGetApiCall({
    url: endPoints.getSupportTickets(orgId, branchId),
  });
};

export const addSupportTicketAPI = async (payload: FormData) => {
  return await doPostApiCall(
    {
      url: endPoints.addSupportTicket,
      bodyData: payload,
    },
    "multipart/form-data",
  );
};
