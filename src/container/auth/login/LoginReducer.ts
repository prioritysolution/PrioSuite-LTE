"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LoginState {
  showPassword: boolean;
}

export const initialLoginState: LoginState = {
  showPassword: false,
};

const loginSlice = createSlice({
  name: "login",
  initialState: initialLoginState,
  reducers: {
    togglePassword: (state) => {
      state.showPassword = !state.showPassword;
    },
    setShowPassword: (state, action: PayloadAction<boolean>) => {
      state.showPassword = action.payload;
    },
  },
});

export const { togglePassword, setShowPassword } = loginSlice.actions;
export default loginSlice.reducer;
