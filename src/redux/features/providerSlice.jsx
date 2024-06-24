// features/providerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentProvider: null,
};

const providerSlice = createSlice({
  name: "provider",
  initialState,
  reducers: {
    updateProvider: (state, action) => {
      state.currentProvider = action.payload;
    },
    setProvider: (state, action) => {
      state.currentProvider = action.payload;
    },
    clearProvider: (state) => {
      state.currentProvider = null;
    },
  },
});

export const { updateProvider, setProvider, clearProvider } =
  providerSlice.actions;
export default providerSlice.reducer;
