"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  flowMode: "add" | "update";
  isFormVisible: boolean;
  isSearchOpen: boolean;
  editMode: boolean;
  searchId: string;
}

export const initialState: State = {
  flowMode: "add",
  isFormVisible: false,
  isSearchOpen: false,
  editMode: false,
  searchId: "",
};

const groupAdmissionSlice = createSlice({
  name: "groupAdmission",
  initialState,
  reducers: {
    setFlowMode: (state, action: PayloadAction<"add" | "update">) => {
      state.flowMode = action.payload;
    },
    showForm: (state) => {
      state.isFormVisible = true;
    },
    hideForm: (state) => {
      state.isFormVisible = false;
    },
    openSearch: (state) => {
      state.isSearchOpen = true;
    },
    closeSearch: (state) => {
      state.isSearchOpen = false;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.editMode = action.payload;
    },
    setSearchId: (state, action: PayloadAction<string>) => {
      state.searchId = action.payload;
    },
    resetFlow: (state) => {
      state.isFormVisible = false;
      state.editMode = false;
    },
  },
});

export const {
  setFlowMode,
  showForm,
  hideForm,
  openSearch,
  closeSearch,
  setEditMode,
  setSearchId,
  resetFlow,
} = groupAdmissionSlice.actions;
export default groupAdmissionSlice.reducer;
