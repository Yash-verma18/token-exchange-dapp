import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
  name: "token",
  initialState: {
    token1: {
      loaded: false,
      contract: null,
      symbol: "",
    },
    token2: {
      loaded: false,
      contract: null,
      symbol: "",
    },
  },
  reducers: {
    token1Loaded: (state, action) => {
      state.token1.loaded = true;
      state.token1.contract = action.payload.contract;
      state.token1.symbol = action.payload.symbol;
    },
    token2Loaded: (state, action) => {
      state.token2.loaded = true;
      state.token2.contract = action.payload.contract;
      state.token2.symbol = action.payload.symbol;
    },
  },
});

export const { token1Loaded, token2Loaded } = tokenSlice.actions;

export default tokenSlice.reducer;
