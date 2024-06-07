// store.js
import { configureStore } from "@reduxjs/toolkit";
import providerReducer from "./features/providerSlice";
import sessionReducer from "./features/sessionSlice";
import authReducer from "./features/authSlice";

export const store = configureStore({
  reducer: {
    provider: providerReducer,
    session: sessionReducer,
    auth: authReducer,
  },
});

export default store;
