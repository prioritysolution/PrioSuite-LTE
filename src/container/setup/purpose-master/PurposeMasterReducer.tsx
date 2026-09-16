"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IPurpose {
  Purp_Id: number;
  Purp_Desc: string;
}

export interface State {
  isModalOpen: boolean;
  editId: number | null;
  searchTerm: string;
}

export const initialState: State = {
  isModalOpen: false,
  editId: null,
  searchTerm: "",
};

const purposeMasterSlice = createSlice({
  name: "purposeMaster",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<IPurpose | undefined>) => {
      state.isModalOpen = true;
      state.editId = action.payload ? action.payload.Purp_Id : null;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editId = null;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    resetState: () => initialState,
  },
});

export const { openModal, closeModal, setSearchTerm, resetState } =
  purposeMasterSlice.actions;
export default purposeMasterSlice.reducer;
