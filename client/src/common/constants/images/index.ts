import { IThemePreference } from "@/definitions/type";

const lightTheme = {
  group: "/assets/users.png",
};

const darkTheme = {
  group: "/assets/users-dark.png",
};

export const getImageThemeStore = (theme: IThemePreference) =>
  theme === "light" ? lightTheme : darkTheme;
