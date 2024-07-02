import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./accountSlice";
import tokenReducer from "./tokenSlice";
import exchangeReducer from "./exchangeSlice";
export default configureStore({
  reducer: {
    account: accountReducer,
    token: tokenReducer,
    exchange: exchangeReducer,
  },
});
