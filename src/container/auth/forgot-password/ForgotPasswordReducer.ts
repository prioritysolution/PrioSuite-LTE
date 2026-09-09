"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ForgotPasswordState {
  loading: boolean;
  email: string;
  error: string | null;
  success: boolean;
}

export const initialForgotPasswordState: ForgotPasswordState = {
  loading: false,
  email: "",
  error: null,
  success: false,
};

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState: initialForgotPasswordState,
  reducers: {
    submitStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    submitSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.email = action.payload;
      state.success = true;
    },
    submitFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    reset: () => initialForgotPasswordState,
  },
});

export const { submitStart, submitSuccess, submitFailure, reset } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
