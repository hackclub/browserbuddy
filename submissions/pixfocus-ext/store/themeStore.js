import { create } from "zustand";

//Note to myself use themeStore for components the uses dynamic themes, for constant/default values go to colors util

const themeDefinitions = {
  COFFEE_CUP: {
    primary: "#EFB6C8",
    secondary: "#A888B5",
    accent: "#FFF",
    text: "#fff",
    iconFill: "#373737",
    buttonBorder: "#000",
  },
  FIRE_CAMP: {
    primary: "#241515",
    secondary: "#F4D793",
    accent: "#A94A4A",
    text: "#ffff",
    iconFill: "#241515",
    buttonBorder: "#fff",
  },
  OWL: {
    primary: "#FFF8E5",
    secondary: "#F1AFAB",
    accent: "#F9A846",
    text: "#BC9179",
    iconFill: "#F8F2DF",
    buttonBorder: "#000",
  },

  RABBIT: {
    primary: "#90AACB",
    secondary: "#D8E5E8",
    accent: "#9AC8E9",
    text: "#F4F4F4",
    iconFill: "#2E2E2E",
    buttonBorder: "#F4F4F4",
  },
};

const useThemeStore = create((set, get) => ({
  currentTheme: "COFFEE_CUP",
  colors: themeDefinitions.COFFEE_CUP,

  setTheme: (themeName) => {
    if (themeDefinitions[themeName]) {
      set({
        currentTheme: themeName,
        colors: themeDefinitions[themeName],
      });
    }
  },

  getColor: (colorName) => {
    const { colors } = get();
    return colors[colorName];
  },
}));

export default useThemeStore;
