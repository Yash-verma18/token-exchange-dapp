import { createSlice } from "@reduxjs/toolkit";

export const accountSlice = createSlice({
  name: "account",
  initialState: {
    account: null,
    provider: null,
    signer: null,
    chainId: null,
  },
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setProvider: (state, action) => {
      state.provider = action.payload;
    },
    setSigner: (state, action) => {
      state.signer = action.payload;
    },
    setChainId: (state, action) => {
      state.chainId = action.payload;
    },
  },
});

export const { setAccount, setProvider, setSigner, setChainId } =
  accountSlice.actions;

export default accountSlice.reducer;
