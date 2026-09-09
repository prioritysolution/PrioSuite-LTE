"use client";
import { useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";
import { AppDispatch, RootState } from "@/redux/store";
import { VoucherForm } from "./VoucherType";
import { setVoucher } from "./VoucherReducer";
import { getLedgerListAPI, postVoucherAPI } from "./VoucherApi";
import { toast } from "sonner";

export const useVoucher = () => {
  const dispatch = useDispatch<AppDispatch>();

  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const branchId = getCookieData<string | number>("priobank-lite-branch_id");

  const ledgerList = useSelector(
    (state: RootState) => state.voucher.ledgerList,
  );

  const [loading, setLoading] = useState(false);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  const schema = yup.object().shape({
    voucherDate: yup.mixed().required("Voucher Date is Required"),
    voucherType: yup.mixed().required("Voucher Type is Required"),
    particulars: yup.string().required("Particulars is Required"),
    refVouchNo: yup.string().optional(),
    ledger: yup.mixed().required("Ledger is Required"),
    amount: yup
      .string()
      .required("Amount is Required")
      .test("is-numeric", "Amount must be a positive number", (val) => {
        if (!val) return false;
        const num = Number(val);
        return !isNaN(num) && num > 0;
      }),
    mode: yup.mixed().required("Mode is Required"),
  });

  const methods = useForm<VoucherForm>({
    mode: "onChange",
    defaultValues: {
      voucherDate: "",
      voucherType: "",
      particulars: "",
      refVouchNo: "",
      ledger: "",
      amount: "",
      mode: "",
    },
    resolver: yupResolver(schema) as any,
  });

  const resetForm = () => {
    methods.reset({
      voucherDate: "",
      voucherType: "",
      particulars: "",
      refVouchNo: "",
      ledger: "",
      amount: "",
      mode: "",
    });
  };

  const getLedgerListAPICall = useCallback(
    async (org_Id: number) => {
      try {
        setIsLedgerLoading(true);
        const res = await getLedgerListAPI(org_Id);
        if (res.message === "Data Found" && res.Data) {
          dispatch(setVoucher(res.Data));
        } else {
          dispatch(setVoucher([]));
        }
      } catch (error) {
        dispatch(setVoucher([]));
      } finally {
        setIsLedgerLoading(false);
      }
    },
    [dispatch],
  );

  const onSubmit = async (data: VoucherForm) => {
    console.log("DATA", data);

    try {
      setLoading(true);
      const formattedDate =
        data.voucherDate instanceof Date
          ? format(data.voucherDate, "yyyy-MM-dd")
          : data.voucherDate || "";

      const payload = {
        vouch_date: formattedDate,
        vouch_type: Number(data.voucherType),
        particular: data.particulars,
        branch_id: Number(branchId),
        trans_mode: Number(data.mode),
        ledger_id: Number(data.ledger),
        amount: Number(data.amount),
        org_id: Number(orgId),
        ref_vouch: data.refVouchNo || "",
        bank_id: null,
      };

      const res = await postVoucherAPI(payload);
      if (
        res.message === "Success" ||
        res.status === "Success" ||
        res.message === "Data Found" ||
        res.Data
      ) {
        toast.success(res.message || "Voucher saved successfully!");
        resetForm();
      } else {
        toast.error(res.message || "Failed to save voucher.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      getLedgerListAPICall(Number(orgId));
    }
  }, [orgId, getLedgerListAPICall]);

  return {
    orgId,
    methods,
    resetForm,
    onSubmit,
    ledgerList,
    loading,
    isLedgerLoading,
  };
};
