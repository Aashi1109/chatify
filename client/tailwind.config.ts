import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#23262f",
        secondary: "#fff",
        tertiary: "#2f80ed",
      },
      gridTemplateRows: {
        layout: "5rem 1fr",
      },
    },
  },
  plugins: [],
};
export default config;
