import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CashAccountReportData } from "./cashAccountType";

interface CashAccountState {
  branchList: any[];
  cashAccountReport: CashAccountReportData | null;
}

const initialState: CashAccountState = {
  branchList: [],
  cashAccountReport: null,
};

const cashAccountSlice = createSlice({
  name: "cashAccount",
  initialState,
  reducers: {
    setBranchList: (state, action: PayloadAction<any[]>) => {
      state.branchList = action.payload;
    },
    setCashAccountReport: (
      state,
      action: PayloadAction<CashAccountReportData | null>,
    ) => {
      state.cashAccountReport = action.payload;
    },
  },
});

export const { setBranchList, setCashAccountReport } = cashAccountSlice.actions;
export default cashAccountSlice.reducer;
