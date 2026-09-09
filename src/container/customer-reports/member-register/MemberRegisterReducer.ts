"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MemberRegisterState } from "./MemberRegisterType";

const initialState: MemberRegisterState = {
  branchList: [],
  memberRegisterList: null,
};

const memberRegisterSlice = createSlice({
  name: "memberRegister",
  initialState,
  reducers: {
    setBranchList: (state, action: PayloadAction<any[]>) => {
      state.branchList = action.payload;
    },
    setMemberRegisterList: (state, action: PayloadAction<any[] | null>) => {
      state.memberRegisterList = action.payload;
    },
  },
});

export const { setBranchList, setMemberRegisterList } =
  memberRegisterSlice.actions;
export default memberRegisterSlice.reducer;
