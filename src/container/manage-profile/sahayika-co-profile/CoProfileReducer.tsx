"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  flowMode: "add" | "update";
  isFormVisible: boolean;
  isSearchOpen: boolean;
  editMode: boolean;
}

export const initialState: State = {
  flowMode: "add",
  isFormVisible: false,
  isSearchOpen: false,
  editMode: false,
};

const coProfileSlice = createSlice({
  name: "coProfile",
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
    resetFlow: () => initialState,
  },
});

export const {
  setFlowMode,
  showForm,
  hideForm,
  openSearch,
  closeSearch,
  setEditMode,
  resetFlow,
} = coProfileSlice.actions;
export default coProfileSlice.reducer;
