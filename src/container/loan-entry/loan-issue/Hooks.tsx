"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch, RootState } from "@/redux/store";
import {
  getDisbursementListStart,
  getDisbursementListSuccess,
  getDisbursementListFailure,
} from "./LoanIssueReducer";
import {
  getDisbursementListAPI,
  getDisbursementDetailsAPI,
  postDisbursementAPI,
} from "./LoanIssueApi";
import { toast } from "sonner";

export const useLoanIssue = (selectedBranchId?: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const { disbursementList, loading, error } = useSelector(
    (state: RootState) => state.loanIssue,
  );

  const orgId = Number(getCookieData("priobank-lite-org_id"));
  const cookieBranchId = Number(getCookieData("priobank-lite-branch_id"));
  const branchId = Number(selectedBranchId || cookieBranchId || 0);
  const finId = Number(getCookieData("priobank-lite-financial_Id"));

  const fetchDisbursementList = useCallback(async () => {
    if (!orgId || !branchId) {
      dispatch(getDisbursementListSuccess([]));
      return;
    }

    dispatch(getDisbursementListStart());
    try {
      const res = await getDisbursementListAPI(orgId, branchId);
      const message = res?.message || res?.data?.message;
      const dataList = res?.Data || res?.data?.Data;

      if (message === "Data Found" && Array.isArray(dataList)) {
        dispatch(getDisbursementListSuccess(dataList));
      } else {
        dispatch(getDisbursementListSuccess([]));
      }
    } catch (err: any) {
      console.error("Failed to fetch disbursement list:", err);
      dispatch(
        getDisbursementListFailure(
          err?.message || "Failed to load disbursement list",
        ),
      );
      toast.error("Failed to load disbursement list");
    }
  }, [orgId, branchId, dispatch]);

  const fetchDisbursementDetails = useCallback(
    async (groupId: number, loanDate: string) => {
      if (!orgId) return [];
      try {
        const res = await getDisbursementDetailsAPI(orgId, groupId, loanDate);
        const dataList = res?.Data || res?.data?.Data;
        return Array.isArray(dataList) ? dataList : [];
      } catch (err: any) {
        console.error("Failed to fetch disbursement details:", err);
        toast.error("Failed to load disbursement details");
        return [];
      }
    },
    [orgId],
  );

  const postDisbursement = useCallback(
    async (
      groupId: number,
      disbDate: string,
      transMode: number,
      refVouch: string,
      bankId: number | null,
      detailsList: { Account_Id: number; Loan_Amount: string | number }[],
    ) => {
      if (!orgId) return;

      const disb_data = detailsList.map((detail) => ({
        account_id: detail.Account_Id,
        amount: Number(detail.Loan_Amount),
      }));

      const payload = {
        group_id: groupId,
        disb_date: disbDate,
        branch_id: branchId,
        fin_id: finId,
        trans_mode: transMode,
        org_id: orgId,
        disb_data: disb_data,
        ref_vouch: refVouch,
        bank_id: bankId,
      };

      try {
        const res = await postDisbursementAPI(payload);
        if (res?.massage === "Success" || res?.message === "Success") {
          fetchDisbursementList();
        }
        return res;
      } catch (err: any) {
        console.error("Failed to post disbursement:", err);
        toast.error(
          err?.response?.data?.message || "Failed to process disbursement",
        );
        throw err;
      }
    },
    [orgId, branchId, finId, fetchDisbursementList],
  );

  return {
    disbursementList,
    loading,
    error,
    branchId,
    refresh: fetchDisbursementList,
    fetchDisbursementDetails,
    postDisbursement,
  };
};
