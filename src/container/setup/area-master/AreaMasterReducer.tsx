"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IArea {
  Area_Id: number;
  Area_Name: string;
  Area_Desc: string;
  Area_Type?: string | number;
  Area_Type_Id?: number;
  Area_Type_Label?: string;
  Opt_Description?: string;
  Branch_Id?: number;
  branch_id?: number;
  Branch_Name?: string;
  Assign_Branch_Label?: string;
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

const areaMasterSlice = createSlice({
  name: "areaMaster",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<IArea | undefined>) => {
      state.isModalOpen = true;
      state.editId = action.payload ? action.payload.Area_Id : null;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editId = null;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
});

export const { openModal, closeModal, setSearchTerm } = areaMasterSlice.actions;
export default areaMasterSlice.reducer;
