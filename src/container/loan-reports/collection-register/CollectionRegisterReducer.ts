"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CollectionRegisterState,
  FetchCollectionRegisterArgs,
} from "./CollectionRegisterType";
import {
  getBranchListAPI,
  getCollectionRegisterAPI,
} from "./CollectionRegisterApi";

const pick = (item: any, keys: string[]) => {
  if (!item || typeof item !== "object") return "";
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const str = String(value).trim();
  if (!str) return null;
  const native = new Date(str);
  if (!Number.isNaN(native.getTime())) return native;
  const match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const parsed = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const isCollDateInRange = (
  collDate: unknown,
  fromDate: string,
  toDate: string,
) => {
  const coll = parseDate(collDate);
  if (!coll) return false;
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from || !to) return true;
  const t = startOfDay(coll);
  return t >= startOfDay(from) && t <= startOfDay(to);
};

const COLL_DATE_KEYS = [
  "Coll_Date",
  "coll_date",
  "Collection_Date",
  "collection_date",
];

const extractList = (res: any): any[] => {
  const data = res?.Data ?? res?.data?.Data ?? res?.data;

  // Nested personal-ledger shape: { collection_report, loan_info }
  if (data && !Array.isArray(data) && typeof data === "object") {
    const report =
      data.collection_report ||
      data.Collection_Report ||
      data.details ||
      data.Details;
    const loanInfo = data.loan_info?.[0] || data.Loan_Info?.[0] || null;
    if (Array.isArray(report)) {
      if (!loanInfo) return report;
      return report.map((row: any) => ({
        ...loanInfo,
        ...row,
        Coll_Date: row?.Coll_Date ?? row?.coll_date ?? loanInfo?.Coll_Date,
        Loan_Amt:
          row?.Loan_Amt ??
          row?.Loan_Amount ??
          loanInfo?.Loan_Amount ??
          loanInfo?.Loan_Amt,
        Realisable_Amt:
          row?.Realisable_Amt ?? loanInfo?.Realisable_Amt ?? loanInfo?.Resilable_Amt,
        Member_Name: row?.Member_Name ?? loanInfo?.Member_Name,
        Grp_Name: row?.Grp_Name ?? row?.Group_Name ?? loanInfo?.Grp_Name,
        Co_Name: row?.Co_Name ?? loanInfo?.Co_Name,
      }));
    }

    // Branch-wide: Data may be an array of per-member packets
    if (Array.isArray(data.Data)) {
      return flattenMemberPackets(data.Data);
    }
  }

  // Array of member packets: [{ collection_report, loan_info }, ...]
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (
      first &&
      typeof first === "object" &&
      (first.collection_report ||
        first.Collection_Report ||
        first.loan_info ||
        first.Loan_Info)
    ) {
      return flattenMemberPackets(data);
    }
    return data;
  }

  const candidates = [
    res?.details,
    res?.Data,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const nonEmpty = candidates.find(
    (item) => Array.isArray(item) && item.length > 0,
  );
  if (nonEmpty) return nonEmpty;
  const empty = candidates.find((item) => Array.isArray(item));
  return Array.isArray(empty) ? empty : [];
};

const flattenMemberPackets = (packets: any[]): any[] => {
  const rows: any[] = [];
  packets.forEach((packet) => {
    if (!packet || typeof packet !== "object") return;
    const report =
      packet.collection_report ||
      packet.Collection_Report ||
      (Array.isArray(packet) ? packet : null);
    const loanInfo = packet.loan_info?.[0] || packet.Loan_Info?.[0] || packet;
    if (!Array.isArray(report)) {
      // Flat row already
      if (pick(packet, COLL_DATE_KEYS) || pick(packet, ["Member_Name", "Grp_Name"])) {
        rows.push(packet);
      }
      return;
    }
    report.forEach((row: any) => {
      rows.push({
        ...loanInfo,
        ...row,
        Coll_Date: row?.Coll_Date ?? row?.coll_date,
        Member_Name:
          row?.Member_Name ?? loanInfo?.Member_Name ?? packet?.Member_Name,
        Grp_Name:
          row?.Grp_Name ??
          row?.Group_Name ??
          loanInfo?.Grp_Name ??
          packet?.Grp_Name,
        Co_Name: row?.Co_Name ?? loanInfo?.Co_Name ?? packet?.Co_Name,
        Loan_Amt:
          row?.Loan_Amt ??
          loanInfo?.Loan_Amount ??
          loanInfo?.Loan_Amt ??
          packet?.Loan_Amt,
        Realisable_Amt:
          row?.Realisable_Amt ??
          loanInfo?.Realisable_Amt ??
          packet?.Realisable_Amt,
      });
    });
  });
  return rows;
};

const normalizeRows = (list: any[], fromDate: string, toDate: string) => {
  return list
    .filter((item) => {
      const collDate = pick(item, COLL_DATE_KEYS);
      // If row has Coll_Date, enforce range; otherwise keep (backend already filtered)
      if (collDate) return isCollDateInRange(collDate, fromDate, toDate);
      return true;
    })
    .sort((a, b) => {
      const da = parseDate(pick(a, COLL_DATE_KEYS))?.getTime() ?? 0;
      const db = parseDate(pick(b, COLL_DATE_KEYS))?.getTime() ?? 0;
      if (da !== db) return da - db;
      const ga = String(pick(a, ["Grp_Name", "Group_Name", "grp_name"]) || "");
      const gb = String(pick(b, ["Grp_Name", "Group_Name", "grp_name"]) || "");
      if (ga !== gb) return ga.localeCompare(gb);
      return String(
        pick(a, ["Member_Name", "member_name", "Mem_Name"]) || "",
      ).localeCompare(
        String(pick(b, ["Member_Name", "member_name", "Mem_Name"]) || ""),
      );
    });
};

export const fetchBranchList = createAsyncThunk(
  "collectionRegister/fetchBranchList",
  async (orgId: number, { rejectWithValue }) => {
    try {
      const res = await getBranchListAPI(orgId);
      if (res?.message === "Data Found" || Array.isArray(res?.Data)) {
        const list = Array.isArray(res?.Data) ? res.Data : extractList(res);
        return list;
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to load branches");
    }
  },
);

export const fetchCollectionRegister = createAsyncThunk(
  "collectionRegister/fetchCollectionRegister",
  async (args: FetchCollectionRegisterArgs, { rejectWithValue, signal }) => {
    try {
      if (!args.orgId || !args.branchId) return [];

      const res = await getCollectionRegisterAPI(
        args.orgId,
        args.branchId,
        args.fromDate,
        args.toDate,
      );

      if (signal.aborted) {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }

      const list = extractList(res);
      return normalizeRows(list, args.fromDate, args.toDate);
    } catch (error: any) {
      if (error?.name === "AbortError" || signal.aborted) throw error;
      return rejectWithValue(
        error?.message || "Failed to load collection register",
      );
    }
  },
);

const initialState: CollectionRegisterState = {
  branchList: [],
  collectionRegisterList: null,
  loading: false,
  error: null,
};

const collectionRegisterSlice = createSlice({
  name: "collectionRegister",
  initialState,
  reducers: {
    setBranchList: (state, action: PayloadAction<any[]>) => {
      state.branchList = action.payload;
    },
    setCollectionRegisterList: (
      state,
      action: PayloadAction<any[] | null>,
    ) => {
      state.collectionRegisterList = action.payload;
    },
    clearCollectionRegister: (state) => {
      state.collectionRegisterList = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchList.fulfilled, (state, action) => {
        state.branchList = action.payload;
      })
      .addCase(fetchBranchList.rejected, (state) => {
        state.branchList = [];
      })
      .addCase(fetchCollectionRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.collectionRegisterList = action.payload;
        state.error = null;
      })
      .addCase(fetchCollectionRegister.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.loading = false;
        state.collectionRegisterList = [];
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load collection register";
      });
  },
});

export const {
  setBranchList,
  setCollectionRegisterList,
  clearCollectionRegister,
} = collectionRegisterSlice.actions;
export default collectionRegisterSlice.reducer;
