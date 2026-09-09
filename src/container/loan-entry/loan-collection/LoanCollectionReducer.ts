import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoanCollectionState {
  groupList: any[];
  memberList: any[];
}

const initialState: LoanCollectionState = {
  groupList: [],
  memberList: [],
};

const loanCollectionSlice = createSlice({
  name: "loanCollection",
  initialState,
  reducers: {
    setGroupList: (state, action: PayloadAction<any[]>) => {
      state.groupList = action.payload;
    },
    setMemberList: (state, action: PayloadAction<any[]>) => {
      state.memberList = action.payload;
    },
    resetLoanCollection: () => initialState,
  },
});

export const { setGroupList, setMemberList, resetLoanCollection } =
  loanCollectionSlice.actions;

export default loanCollectionSlice.reducer;
