import { createSlice } from "@reduxjs/toolkit";

interface IUiSlice {
  isModalOpen: boolean;
}
// initial state
const uiInitialState: IUiSlice = {
  isModalOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState: uiInitialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
  },
});

export const { openModal, closeModal } = uiSlice.actions;

export default uiSlice.reducer;
