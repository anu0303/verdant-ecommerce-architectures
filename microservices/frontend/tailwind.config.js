/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2B22",
        paper: "#EFEEE4",
        paperDim: "#E4E2D4",
        moss: { DEFAULT: "#45624B", dark: "#324A38", light: "#5D7D63" },
        ochre: { DEFAULT: "#B98430", dark: "#946924" },
        vine: "#9BB79A",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: { tag: "2px" },
    },
  },
  plugins: [],
};
