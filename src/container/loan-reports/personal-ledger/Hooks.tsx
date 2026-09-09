"use client";
import { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";
import { AppDispatch, RootState } from "@/redux/store";
import { PersonalLedgerForm } from "./PersonalLedgerType";
import {
  setPersonalLedger,
  setGroupList,
  setMemberList,
  setLoanCycleList,
} from "./PersonalLedgerReducer";
import {
  getAllGroupListAPI,
  getAllMemberListAPI,
  getLoanCollectionReportAPI,
  getLoanCycleListAPI,
} from "./PersonalLedgerApi";

export const usePersonalLedger = () => {
  const dispatch = useDispatch<AppDispatch>();

  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const branchId = getCookieData<string | number>("priobank-lite-branch_id");

  const personalLedgerData = useSelector(
    (state: RootState) => state.personalLedger.personalLedger,
  );
  const groupListData = useSelector(
    (state: RootState) => state.personalLedger.groupList,
  );
  const memberListData = useSelector(
    (state: RootState) => state.personalLedger.memberList,
  );
  const loanCycleListData = useSelector(
    (state: RootState) => state.personalLedger.loanCycleList,
  );

  const [isMemberListLoading, setIsMemberListLoading] = useState(false);
  const [isLoanCycleListLoading, setIsLoanCycleListLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = yup.object().shape(
    {
      fromDate: yup.mixed().nullable().when("toDate", {
        is: (val: any) => !!val,
        then: (schema) => schema.required("From Date is Required"),
        otherwise: (schema) => schema.optional(),
      }),
      toDate: yup.mixed().nullable().when("fromDate", {
        is: (val: any) => !!val,
        then: (schema) => schema.required("To Date is Required"),
        otherwise: (schema) => schema.optional(),
      }),
      groupId: yup.mixed(),
      memberId: yup.mixed(),
      loanCycleId: yup.mixed(),
      loanDate: yup.mixed(),
      loanAmount: yup.mixed(),
      reliasableAmount: yup.mixed(),
      installmentAmount: yup.mixed(),
      personalledger: yup.mixed(),
    },
    [["fromDate", "toDate"]],
  );

  const methods = useForm<PersonalLedgerForm>({
    mode: "onChange",
    defaultValues: {
      fromDate: "",
      toDate: "",
      groupId: "",
      memberId: "",
      loanDate: "",
      loanAmount: "",
      reliasableAmount: "",
      installmentAmount: "",
      personalledger: "",
      loanCycleId: "",
    },
    resolver: yupResolver(schema) as any,
  });

  const resetForm = () => {
    methods.reset({
      fromDate: "",
      toDate: "",
      groupId: "",
      memberId: "",
      loanDate: "",
      loanAmount: "",
      reliasableAmount: "",
      installmentAmount: "",
      personalledger: "",
      loanCycleId: "",
    });

    dispatch(setPersonalLedger(null));
    dispatch(setLoanCycleList([]));
  };

  const getAllGroupListAPICall = async (org_Id: number, branch_Id?: string | number ) => {
    try {
      const res = await getAllGroupListAPI(org_Id, branch_Id);
      if (res.message === "Data Found") {
        dispatch(setGroupList(res.Data));
      } else {
        dispatch(setGroupList([]));
      }
    } catch (error) {
      dispatch(setGroupList([]));
    }
  };

  const getAllMemberListAPICall = useCallback(
    async (org_Id: number, group_Id: string) => {
      try {
        setIsMemberListLoading(true);
        const res = await getAllMemberListAPI(org_Id, group_Id);

        if (res.message === "Data Found") {
          dispatch(setMemberList(res.Data));
        } else {
          dispatch(setMemberList([]));
        }
      } catch (error) {
        dispatch(setMemberList([]));
      } finally {
        setIsMemberListLoading(false);
      }
    },
    [dispatch],
  );

  const getLoanCycleListAPICall = useCallback(
    async (
      orgId: number,
      branchId: number,
      groupId: string,
      memberId: string,
    ) => {
      try {
        setIsLoanCycleListLoading(true);
        const res = await getLoanCycleListAPI(
          orgId,
          branchId,
          groupId,
          memberId,
        );
        if (res.message === "Data Found" && res.Data) {
          dispatch(setLoanCycleList(res.Data));
        } else {
          dispatch(setLoanCycleList([]));
        }
      } catch (error) {
        dispatch(setLoanCycleList([]));
      } finally {
        setIsLoanCycleListLoading(false);
      }
    },
    [dispatch],
  );

  const getLoanCollectionReportAPICall = async (
    orgId: number,
    groupId: string,
    memberId: string,
    fromDate: Date | string | null,
    toDate: Date | string | null,
    branchId: string,
    loancycleId: string,
  ) => {
    try {
      setLoading(true);
      const formattedFromDate =
        fromDate instanceof Date
          ? format(fromDate, "yyyy-MM-dd")
          : fromDate || "";
      const formattedToDate =
        toDate instanceof Date ? format(toDate, "yyyy-MM-dd") : toDate || "";

      const res = await getLoanCollectionReportAPI(
        orgId,
        groupId,
        memberId,
        formattedFromDate,
        formattedToDate,
        branchId,
        loancycleId,
      );
      if (res.message === "Data Found" && res.Data) {
        const mappedReport = (res.Data.collection_report || []).map(
          (item: any) => ({
            sl: item.Sl,
            collection_date: item.Coll_Date,
            collection_amount: item.Coll_Amount,
            principal: item.Prn_Amount,
            interest: item.Intt_Amount,
            balance: item.Outs_Amount,
          }),
        );
        dispatch(setPersonalLedger(mappedReport));

        if (res.Data.loan_info && res.Data.loan_info.length > 0) {
          const info = res.Data.loan_info[0];
          methods.setValue(
            "loanDate",
            info.Loan_Date ? new Date(info.Loan_Date) : "",
          );
          methods.setValue("loanAmount", info.Loan_Amount || "");
          methods.setValue("reliasableAmount", info.Realisable_Amt || "");
          methods.setValue("installmentAmount", info.Installment_Amt || "");
        }
      } else {
        dispatch(setPersonalLedger(null));
      }
    } catch (error) {
      dispatch(setPersonalLedger(null));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PersonalLedgerForm) => {
    try {
      await getLoanCollectionReportAPICall(
        Number(orgId),
        data.groupId,
        data.memberId,
        data.fromDate,
        data.toDate,
        String(branchId || ""),
        data.loanCycleId,
      );
    } catch (error) {
      console.log("onSubmit error=", error);
    }
  };

  const watchedGroupId = methods.watch("groupId");
  const watchedMemberId = methods.watch("memberId");

  useEffect(() => {
    if (!watchedGroupId) {
      dispatch(setMemberList([]));
      dispatch(setLoanCycleList([]));
    }
  }, [watchedGroupId, dispatch]);

  useEffect(() => {
    if (!watchedMemberId) {
      dispatch(setLoanCycleList([]));
    }
  }, [watchedMemberId, dispatch]);

  return {
    orgId,
    branchId,
    methods,
    getAllGroupListAPICall,
    getAllMemberListAPICall,
    getLoanCycleListAPICall,
    personalLedgerData,
    groupListData,
    memberListData,
    loanCycleListData,
    resetForm,
    onSubmit,
    isMemberListLoading,
    isLoanCycleListLoading,
    loading,
  };
};
