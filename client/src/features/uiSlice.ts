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
    toggleModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
  },
});

export const { toggleModal } = uiSlice.actions;

export default uiSlice.reducer;
