"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IScheme {
  Scheme_Id: number;
  Scheme_Name: string;
  RoI: string | number;
  Repay_Mode: number;
  Repay_Name: string;
  Repay_Period?: string | number;
  Sanction_Limit: string | number;
  RoI_OD?: string | number;
  InstlAmt_1000?: string | number;
  Prn_Ledger?: string | number;
  Intt_Ledger?: string | number;
  Prn_Ledger_Name?: string;
  Intt_Ledger_Name?: string;
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

const schemeMasterSlice = createSlice({
  name: "schemeMaster",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<IScheme | undefined>) => {
      state.isModalOpen = true;
      state.editId = action.payload ? action.payload.Scheme_Id : null;
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
  schemeMasterSlice.actions;
export default schemeMasterSlice.reducer;
