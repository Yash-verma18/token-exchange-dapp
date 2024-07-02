import { createSlice } from "@reduxjs/toolkit";

export const exchangeSlice = createSlice({
  name: "exchange",
  initialState: {
    loaded: false,
    contract: null,
  },
  reducers: {
    setExchangeLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setExchangeContract: (state, action) => {
      state.contract = action.payload;
    },
  },
});

export const { setExchangeContract, setExchangeLoaded } = exchangeSlice.actions;

export default exchangeSlice.reducer;
