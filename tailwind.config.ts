import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0A1830",
          800: "#0F2247",
          700: "#173262",
          600: "#1F4080",
          500: "#2C5AA0",
          100: "#E7ECF5",
        },
        paper: "#F7F8FA",
      },
    },
  },
  plugins: [],
};

export default config;
