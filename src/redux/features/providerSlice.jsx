// features/providerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentProvider: null,
  providers: [],
};

const providerSlice = createSlice({
  name: "provider",
  initialState,
  reducers: {
    updateProvider: (state, action) => {
      console.log("updating", action.payload);
      state.currentProvider = action.payload;
    },
    setProvider: (state, action) => {
      state.currentProvider = action.payload;
    },
    clearProvider: (state) => {
      state.currentProvider = null;
    },
    setProviders: (state, action) => {
      state.providers = action.payload;
    },
  },
});

export const { updateProvider, setProvider, clearProvider, setProviders } =
  providerSlice.actions;
export default providerSlice.reducer;
