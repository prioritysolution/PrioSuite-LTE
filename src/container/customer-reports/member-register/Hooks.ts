"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format } from "date-fns";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch } from "@/redux/store";
import { MemberRegisterForm } from "./MemberRegisterType";
import {
  getBranchListAPI,
  getCoListAPI,
  getGroupListAPI,
  getMemberRegisterAPI,
} from "./MemberRegisterApi";
import {
  setBranchList,
  setMemberRegisterList,
} from "./MemberRegisterReducer";

const GUARDIAN_KEYS = [
  "FatHusb_Name",
  "Father_Name",
  "Gurd_Name",
  "Guardian_Name",
  "Gurdain_Name",
  "mem_fname",
  "Father_Husband",
  "FH_Name",
  "Husband_Name",
];

const GROUP_NAME_KEYS = [
  "Group_Name",
  "Grp_Name",
  "grp_name",
  "GroupName",
  "group_name",
];

const AREA_KEYS = [
  "Area_Name",
  "Area",
  "Vill_Name",
  "area_name",
  "Vill_Area",
];

const DATE_KEYS = [
  "Adm_Date",
  "adm_date",
  "Admission_Date",
  "Form_Date",
  "Admit_Date",
  "Mem_Adm_Date",
  "Entry_Date",
];

const CO_KEYS = [
  "CO_Name",
  "Co_Name",
  "co_name",
  "Under_CO",
  "Under_Co",
  "Sahayika_Name",
  "Sahayika",
  "Admitted_By",
];

const GROUP_ID_KEYS = ["Group_Id", "Grp_Id", "grp_id", "GroupId", "group_id"];
const CO_ID_KEYS = ["CO_Id", "Co_Id", "co_id", "COId"];
const MEMBER_NO_KEYS = [
  "Member_No",
  "Mem_No",
  "member_no",
  "mem_no",
  "Membership_No",
];

const pick = (item: any, keys: string[]) => {
  if (!item || typeof item !== "object") return "";

  for (const key of keys) {
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }

  const wanted = keys.map((k) => k.toLowerCase());
  for (const key of Object.keys(item)) {
    if (!wanted.includes(key.toLowerCase())) continue;
    const val = item[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }

  return "";
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
};

const filterByAdmissionDate = (
  list: any[],
  fromDate: string,
  toDate: string,
) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from && !to) return list;

  return list.filter((item) => {
    const adm = parseDate(pick(item, DATE_KEYS));
    if (!adm) return true;
    if (from) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      if (adm < start) return false;
    }
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      if (adm > end) return false;
    }
    return true;
  });
};

const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const firstFilled = (...values: unknown[]) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

/** One search = 3 bulk APIs max. Join names on the client — no per-group GetGroupMember. */
const enrichMemberRegisterList = async (
  members: any[],
  orgId: number,
  branchId: number,
) => {
  const [groupRes, coRes] = await Promise.all([
    getGroupListAPI(orgId, branchId).catch(() => null),
    getCoListAPI(orgId, branchId).catch(() => null),
  ]);

  const groups = extractList(groupRes);
  const cos = extractList(coRes);

  const groupById = new Map<string, any>();
  groups.forEach((group) => {
    const id = String(pick(group, GROUP_ID_KEYS) || "");
    if (id) groupById.set(id, group);
  });

  const coById = new Map<string, any>();
  cos.forEach((co) => {
    const id = String(pick(co, CO_ID_KEYS) || "");
    if (id) coById.set(id, co);
  });

  return members.map((member) => {
    const groupId = String(pick(member, GROUP_ID_KEYS) || "");
    const group = groupId ? groupById.get(groupId) : null;

    const coId =
      String(pick(member, CO_ID_KEYS) || "") ||
      String(pick(group, CO_ID_KEYS) || "");
    const co = coId ? coById.get(coId) : null;

    return {
      ...member,
      FatHusb_Name: firstFilled(pick(member, GUARDIAN_KEYS)),
      Group_Name: firstFilled(
        pick(member, GROUP_NAME_KEYS),
        pick(group, GROUP_NAME_KEYS),
      ),
      Area_Name: firstFilled(
        pick(member, AREA_KEYS),
        pick(group, AREA_KEYS),
      ),
      Adm_Date: firstFilled(pick(member, DATE_KEYS)),
      CO_Name: firstFilled(
        pick(member, CO_KEYS),
        pick(co, CO_KEYS),
        pick(group, CO_KEYS),
      ),
      Group_Id: groupId || "",
      CO_Id: coId || "",
      Member_No: firstFilled(pick(member, MEMBER_NO_KEYS)),
    };
  });
};

export const useMemberRegister = () => {
  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const schema = yup.object().shape({
    fromDate: yup.mixed().required("From date is required"),
    toDate: yup.mixed().required("To date is required"),
    branch: yup.mixed().required("Branch is required"),
  });

  const methods = useForm<MemberRegisterForm>({
    defaultValues: {
      fromDate: "",
      toDate: "",
      branch: "",
    },
    resolver: yupResolver(schema) as any,
  });

  const resetForm = () => {
    methods.reset({
      fromDate: "",
      toDate: "",
      branch: "",
    });
    dispatch(setMemberRegisterList(null));
  };

  const getBranchListAPICall = async (org_Id: number) => {
    try {
      const res = await getBranchListAPI(org_Id);
      if (res?.message === "Data Found" || Array.isArray(res?.Data)) {
        dispatch(setBranchList(extractList(res)));
      } else {
        dispatch(setBranchList([]));
      }
    } catch {
      dispatch(setBranchList([]));
    }
  };

  const getMemberRegisterAPICall = async (
    branchId: number,
    fromDate: string,
    toDate: string,
  ) => {
    try {
      setLoading(true);
      const res = await getMemberRegisterAPI(
        Number(orgId),
        branchId,
        fromDate,
        toDate,
      );
      const list = extractList(res);
      const enriched = await enrichMemberRegisterList(
        list,
        Number(orgId),
        branchId,
      );
      const filtered = filterByAdmissionDate(enriched, fromDate, toDate);
      dispatch(setMemberRegisterList(filtered));
    } catch {
      dispatch(setMemberRegisterList([]));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: MemberRegisterForm) => {
    const formattedFromDate =
      data.fromDate instanceof Date
        ? format(data.fromDate, "yyyy-MM-dd")
        : data.fromDate || "";
    const formattedToDate =
      data.toDate instanceof Date
        ? format(data.toDate, "yyyy-MM-dd")
        : data.toDate || "";

    getMemberRegisterAPICall(
      Number(data.branch),
      String(formattedFromDate),
      String(formattedToDate),
    );
  };

  return {
    methods,
    resetForm,
    getBranchListAPICall,
    onSubmit,
    orgId,
    loading,
  };
};
