"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GroupRegisterState } from "./GroupRegisterType";

const initialState: GroupRegisterState = {
  branchList: [],
  groupRegisterList: null,
};

const groupRegisterSlice = createSlice({
  name: "groupRegister",
  initialState,
  reducers: {
    setBranchList: (state, action: PayloadAction<any[]>) => {
      state.branchList = action.payload;
    },
    setGroupRegisterList: (state, action: PayloadAction<any[] | null>) => {
      state.groupRegisterList = action.payload;
    },
  },
});

export const { setBranchList, setGroupRegisterList } =
  groupRegisterSlice.actions;
export default groupRegisterSlice.reducer;
