import api from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";

export const masterService = {
    getFinancialYear: async () => {
        const response = await api.get(endPoints.getFinancialYear);
        return response.data;
    },
    getSidebarData: async (org_id: number) => {
        const response = await api.get(
            `${endPoints.getSidebar}?org_id=${org_id}`,
        );
        return response.data;
    },
    getActiveYear: async (org_id: number) => {
        const response = await api.get(endPoints.getActiveYear(org_id));
        return response.data;
    },
    getApplicationOption: async (group_id: number) => {
        const response = await api.get(
            endPoints.getApplicationOption(group_id),
        );
        return response.data;
    },
    getAreaList: async (org_id: number, branch_id: number) => {
        const response = await api.get(
            endPoints.getAreaList(org_id, branch_id),
        );
        return response.data;
    },
    getGroupList: async (org_id: number, branch_id: number) => {
        const response = await api.get(
            endPoints.getGroupList(org_id, branch_id),
        );
        return response.data;
    },
    getCoList: async (org_id: number, branch_id: number) => {
        const response = await api.get(endPoints.getCoList(org_id, branch_id));
        return response.data;
    }
};