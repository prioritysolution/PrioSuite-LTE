"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  loading: boolean;
  data: any[];
  error: string | null;
}

export const initialState: State = {
  loading: false,
  data: [],
  error: null,
};

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.data = action.payload;
    },
    fetchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addItem: (state, action: PayloadAction<any>) => {
      state.data.push(action.payload);
    },
    reset: () => initialState,
  },
});

export const { fetchStart, fetchSuccess, fetchFailure, addItem, reset } = moduleSlice.actions;
export default moduleSlice.reducer;
