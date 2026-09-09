"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DetailedListState } from "./DetailedListType";

const initialState: DetailedListState = {
  branchList: [],
  schemeList: [],
  detailedList: null,
};

const detailedListSlice = createSlice({
  name: "detailedList",
  initialState,
  reducers: {
    setBranchList: (state, action: PayloadAction<any[]>) => {
      state.branchList = action.payload;
    },
    setSchemeList: (state, action: PayloadAction<any[]>) => {
      state.schemeList = action.payload;
    },
    setDetailedList: (state, action: PayloadAction<any[] | null>) => {
      state.detailedList = action.payload;
    },
  },
});

export const { setBranchList, setSchemeList, setDetailedList } =
  detailedListSlice.actions;
export default detailedListSlice.reducer;
