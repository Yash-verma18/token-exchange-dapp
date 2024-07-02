import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
  name: "token",
  initialState: {
    loaded: false,
    contracts: [],
    symbols: [],
  },
  reducers: {
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setContract: (state, action) => {
      state.contracts = [...state.contracts, action.payload];
    },
    setSymbol: (state, action) => {
      state.symbols = [...state.symbols, action.payload];
    },
  },
});

export const { setContract, setSymbol, setLoaded } = tokenSlice.actions;

export default tokenSlice.reducer;
