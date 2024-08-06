import { createSlice } from '@reduxjs/toolkit';

export const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: {
    loaded: false,
    contract: null,
    token1Balance: 0,
    token2Balance: 0,
    transferInProgress: false,
  },
  reducers: {
    setExchangeLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setExchangeContract: (state, action) => {
      state.contract = action.payload;
    },
    setExchangeToken1Balance: (state, action) => {
      state.token1Balance = action.payload;
    },
    setExchangeToken2Balance: (state, action) => {
      state.token2Balance = action.payload;
    },

    setTransferRequest: (state) => {
      state.transferRequest = {
        transactionType: 'Transfer',
        isPending: true,
        isSuccessful: false,
      };

      state.transferInProgress = true;
    },

    setTransferSuccess: (state, action) => {
      state.transferRequest = {
        transactionType: 'Transfer',
        isPending: false,
        isSuccessful: true,
      };
      state.transferInProgress = false;
      state.event = action.payload;
    },

    setTransferFail: (state) => {
      state.transferRequest = {
        transactionType: 'Transfer',
        isPending: false,
        isSuccessful: false,
        isError: true,
      };
      state.transferInProgress = false;
    },
  },
});

export const {
  setExchangeContract,
  setExchangeLoaded,
  setExchangeToken1Balance,
  setExchangeToken2Balance,
  setTransferRequest,
  setTransferSuccess,
  setTransferFail,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;
