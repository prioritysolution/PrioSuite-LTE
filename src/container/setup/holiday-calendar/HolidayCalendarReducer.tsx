"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IHoliday {
  Id: number;
  Holiday_Date: string;
  Purpose: string;
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

const holidayCalendarSlice = createSlice({
  name: "holidayCalendar",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<IHoliday | undefined>) => {
      state.isModalOpen = true;
      state.editId = action.payload ? action.payload.Id : null;
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
  holidayCalendarSlice.actions;
export default holidayCalendarSlice.reducer;
