import { createSlice } from "@reduxjs/toolkit";

interface IUiSlice {}

// initial state
const uiInitialState: IUiSlice = {};

const uiSlice = createSlice({
  name: "ui",
  initialState: uiInitialState,
  reducers: {},
});

export default uiSlice.reducer;
