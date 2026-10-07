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
    /**
     * Prefer one GetApplicationOption call (group_id=0), split by Opt_Grp_Id.
     * Falls back to per-group requests if the API does not return all groups.
     */
    getApplicationOptions: async (group_ids: number[]) => {
        const uniqueIds = [...new Set(group_ids)];

        const extractOptions = (payload: unknown): any[] => {
            const candidates = [
                (payload as any)?.Data,
                (payload as any)?.details,
                (payload as any)?.data?.Data,
                (payload as any)?.data?.details,
                (payload as any)?.data?.data,
                (payload as any)?.data,
                payload,
            ];
            const list = candidates.find((item) => Array.isArray(item));
            return Array.isArray(list) ? list : [];
        };

        const groupOf = (opt: any): number | null => {
            const raw = opt?.Opt_Grp_Id ?? opt?.opt_grp_id ?? opt?.Group_Id;
            const n = Number(raw);
            return Number.isFinite(n) ? n : null;
        };

        try {
            const allResponse = await api.get(
                endPoints.getApplicationOption(0),
            );
            const options = extractOptions(allResponse.data);
            const coversAllGroups =
                options.length > 0 &&
                uniqueIds.every((id) =>
                    options.some((opt) => groupOf(opt) === id),
                );

            if (coversAllGroups) {
                return Object.fromEntries(
                    uniqueIds.map((id) => [
                        id,
                        {
                            Data: options.filter(
                                (opt) => groupOf(opt) === id,
                            ),
                        },
                    ]),
                ) as Record<number, unknown>;
            }
        } catch {
            // group_id=0 not supported
        }

        const results = await Promise.all(
            uniqueIds.map((group_id) =>
                api.get(endPoints.getApplicationOption(group_id)),
            ),
        );
        return Object.fromEntries(
            uniqueIds.map((group_id, index) => [group_id, results[index].data]),
        ) as Record<number, unknown>;
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