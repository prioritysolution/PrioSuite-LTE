"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DemandGenerationState,
  GenerateResult,
} from "./DemandGenerationType";

const initialState: DemandGenerationState = {
  result: null,
  loading: false,
};

const demandGenerationSlice = createSlice({
  name: "demandGeneration",
  initialState,
  reducers: {
    setDemandResult: (state, action: PayloadAction<GenerateResult | null>) => {
      state.result = action.payload;
    },
    setDemandLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearDemand: (state) => {
      state.result = null;
      state.loading = false;
    },
  },
});

export const { setDemandResult, setDemandLoading, clearDemand } =
  demandGenerationSlice.actions;

export default demandGenerationSlice.reducer;
