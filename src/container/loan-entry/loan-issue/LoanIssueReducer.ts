"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
  disbursementList: any[];
  loading: boolean;
  error: string | null;
}

export const initialState: State = {
  disbursementList: [],
  loading: false,
  error: null,
};

const loanIssueSlice = createSlice({
  name: "loanIssue",
  initialState,
  reducers: {
    getDisbursementListStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getDisbursementListSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.disbursementList = action.payload;
    },
    getDisbursementListFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getDisbursementListStart,
  getDisbursementListSuccess,
  getDisbursementListFailure,
} = loanIssueSlice.actions;
export default loanIssueSlice.reducer;
