import type { Config } from "tailwindcss";

import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import daisyui from "daisyui";
import catppuccin from "@catppuccin/daisyui";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  daisyui: {
    // The top value of this array will be used as the default theme
    // You can use https://github.com/saadeghi/theme-change to switch between themes
    themes: [
      catppuccin("mocha"),
      catppuccin("macchiato"),
      catppuccin("frappe"),
      catppuccin("latte"),
      "night",
    ],
  },

  plugins: [typography, forms, daisyui],
} satisfies Config;
