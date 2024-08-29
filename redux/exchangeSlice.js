import { createSlice } from '@reduxjs/toolkit';

export const exchangeSlice = createSlice({
  name: 'exchange',
  initialState: {
    loaded: false,
    contract: null,
    token1Balance: 0,
    token2Balance: 0,
    transferInProgress: false,
    allOrders: [],
    allEvents: [],
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
      state.allEvents = [...state.allEvents, action.payload];
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

    // Making order Cases
    newOrderRequest: (state) => {
      state.newOrderRequest = {
        transactionType: 'New Order',
        isPending: true,
        isSuccessful: false,
      };
    },

    setNewOrderFail: (state) => {
      state.newOrderRequest = {
        transactionType: 'New Order',
        isPending: false,
        isSuccessful: false,
        isError: true,
      };
    },

    setNewOrderSuccess: (state, action) => {
      state.newOrderRequest = {
        transactionType: 'New Order',
        isPending: false,
        isSuccessful: true,
      };
      state.allEvents = [...state.allEvents, action.payload];
    },

    addNewOrder: (state, action) => {
      state.allOrders = [...state.allOrders, action.payload];
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
  newOrderRequest,
  setNewOrderFail,
  setNewOrderSuccess,
  addNewOrder,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;
