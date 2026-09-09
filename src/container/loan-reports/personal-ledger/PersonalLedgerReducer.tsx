import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PersonalLedgerState {
  groupList: any[];
  memberList: any[];
  personalLedger: any[] | null;
  loanCycleList: any[];
}

const initialState: PersonalLedgerState = {
  groupList: [],
  memberList: [],
  personalLedger: null,
  loanCycleList: [],
};

const personalLedgerSlice = createSlice({
  name: "personalLedger",
  initialState,
  reducers: {
    setGroupList: (state, action: PayloadAction<any[]>) => {
      state.groupList = action.payload;
    },
    setMemberList: (state, action: PayloadAction<any[]>) => {
      state.memberList = action.payload;
    },
    setPersonalLedger: (state, action: PayloadAction<any[] | null>) => {
      state.personalLedger = action.payload;
    },
    setLoanCycleList: (state, action: PayloadAction<any[]>) => {
      state.loanCycleList = action.payload;
    },
  },
});

export const {
  setGroupList,
  setMemberList,
  setPersonalLedger,
  setLoanCycleList,
} = personalLedgerSlice.actions;
export default personalLedgerSlice.reducer;
