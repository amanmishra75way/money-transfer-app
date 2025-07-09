import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import txnReducer from "./txnSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    txn: txnReducer,
  },
});
