"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DashboardPayload, DashboardState } from "./DashboardType";

export const initialState: DashboardState = {
  loading: false,
  error: null,
  isHeadView: false,
  stats: {
    totalLoanIssue: 0,
    totalCollection: 0,
    totalOutstanding: 0,
    totalActiveBorrowers: 0,
  },
  branches: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    start: (state) => {
      state.loading = true;
      state.error = null;
    },
    success: (state, action: PayloadAction<DashboardPayload>) => {
      state.loading = false;
      state.error = null;
      state.isHeadView = action.payload.isHeadView;
      state.stats = action.payload.summary;
      state.branches = action.payload.branches;
    },
    failure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { start, success, failure } = dashboardSlice.actions;
export default dashboardSlice.reducer;
