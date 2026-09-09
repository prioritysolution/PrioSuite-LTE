"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  loading: boolean;
  error: string | null;
  coList: any[];
}

export const initialState: State = {
  loading: false,
  error: null,
  coList: [],
};

const newApplicationSlice = createSlice({
  name: "newApplication",
  initialState,
  reducers: {
    saveStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    saveSuccess: (state) => {
      state.loading = false;
    },
    saveFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCoList: (state, action: PayloadAction<any[]>) => {
      state.coList = action.payload || [];
    },
  },
});

export const { saveStart, saveSuccess, saveFailure, setCoList } =
  newApplicationSlice.actions;
export default newApplicationSlice.reducer;
