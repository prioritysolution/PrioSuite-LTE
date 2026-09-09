"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IssueRegisterState } from "./IssueRegisterType";

const initialState: IssueRegisterState = {
  branchList: [],
  issueRegisterList: null,
};

const issueRegisterSlice = createSlice({
  name: "issueRegister",
  initialState,
  reducers: {
    setBranchList: (state, action: PayloadAction<any[]>) => {
      state.branchList = action.payload;
    },
    setIssueRegisterList: (state, action: PayloadAction<any[] | null>) => {
      state.issueRegisterList = action.payload;
    },
  },
});

export const { setBranchList, setIssueRegisterList } =
  issueRegisterSlice.actions;
export default issueRegisterSlice.reducer;
