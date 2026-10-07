"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface State {
  isModalOpen: boolean;
  searchTerm: string;
}

export const initialState: State = {
  isModalOpen: false,
  searchTerm: "",
};

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    resetState: () => initialState,
  },
});

export const { openModal, closeModal, setSearchTerm, resetState } =
  supportSlice.actions;
export default supportSlice.reducer;
