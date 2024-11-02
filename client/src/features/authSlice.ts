// initial state for auth slice

import { IUser } from "@/definitions/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAuthSlice {
  isAuthenticated: boolean;
  user: IUser | null | undefined;
}

const authInitialState: IAuthSlice = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Partial<IAuthSlice>>) => {
      state.isAuthenticated = !!action.payload.isAuthenticated;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
