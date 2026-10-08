"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DemandGenerationState,
  DemandRow,
} from "./DemandGenerationType";

const initialState: DemandGenerationState = {
  rows: null,
  loading: false,
};

const demandGenerationSlice = createSlice({
  name: "demandGeneration",
  initialState,
  reducers: {
    setDemandRows: (state, action: PayloadAction<DemandRow[] | null>) => {
      state.rows = action.payload;
    },
    setDemandLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearDemand: (state) => {
      state.rows = null;
      state.loading = false;
    },
  },
});

export const { setDemandRows, setDemandLoading, clearDemand } =
  demandGenerationSlice.actions;

export default demandGenerationSlice.reducer;
