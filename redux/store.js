import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./accountSlice";
import tokenReducer from "./tokenSlice";
export default configureStore({
  reducer: {
    account: accountReducer,
    token: tokenReducer,
  },
});
