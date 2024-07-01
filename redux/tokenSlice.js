import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
  name: "token",
  initialState: {
    contract: null,
    symbol: null,
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    setSymbol: (state, action) => {
      state.symbol = action.payload;
    },
  },
});

export const { setContract, setSymbol } = tokenSlice.actions;

export default tokenSlice.reducer;
