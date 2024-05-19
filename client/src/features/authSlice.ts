// initial state for auth slice

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAuthSlice {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

const authInitialState: IAuthSlice = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Partial<IAuthSlice>>) => {
      const accessToken = action.payload?.accessToken ?? null;
      state.accessToken = accessToken;
      state.isAuthenticated = !!accessToken;
      state.refreshToken = action.payload?.refreshToken ?? null;
    },
  },
});

export const { setAuth } = authSlice.actions;

export default authSlice.reducer;
