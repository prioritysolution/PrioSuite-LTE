import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VoucherState {
  ledgerList: any[];
}

const initialState: VoucherState = {
  ledgerList: [],
};

const voucherSlice = createSlice({
  name: "voucher",
  initialState,
  reducers: {
    setVoucher: (state, action: PayloadAction<any[]>) => {
      state.ledgerList = action.payload;
    },
  },
});

export const { setVoucher } = voucherSlice.actions;

export default voucherSlice.reducer;
