import { ITheme, IThemePreference } from "@/definitions/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const THEME_KEY = "user-theme-preference";

interface IUiSlice {
  theme: IThemePreference;
}
const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getCurrentTheme = (): "dark" | "light" => {
  const userPreference = localStorage.getItem(THEME_KEY) as
    | "dark"
    | "light"
    | null;
  return userPreference || getSystemTheme();
};

const uiInitialState: IUiSlice = {
  theme: getCurrentTheme(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState: uiInitialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ITheme>) => {
      state.theme =
        action.payload === "system" ? getSystemTheme() : action.payload;
      localStorage.setItem(THEME_KEY, action.payload);
    },
  },
});

export const { setTheme } = uiSlice.actions;
export default uiSlice.reducer;
