import type { Config } from "tailwindcss";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const zooliPreset = require("@zooli/tokens/tailwind.preset");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokens = require("@zooli/tokens/tokens.json");

const config: Config = {
  presets: [zooliPreset],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // This app was originally built against its own `zooli.purple` /
        // `zooli.yellow` / `sidebar` names — keep those working, just
        // pointed at the shared brand ramp instead of their old one-off hexes.
        zooli: {
          purple: { ...tokens.violet, DEFAULT: tokens.violet["600"], dark: tokens.ink["900"] },
          yellow: { ...tokens.gold, DEFAULT: tokens.gold["500"] },
        },
        sidebar: tokens.ink["900"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in": "slideIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideIn: {
          "0%": { transform: "translateX(-8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
