import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        editor: {
          bg: "var(--editor-bg)",
          text: "var(--editor-text)",
          muted: "var(--editor-muted)",
          border: "var(--editor-border)",
          accent: "var(--editor-accent)",
          hover: "var(--editor-hover)",
        },
        callout: {
          info: {
            bg: "var(--callout-info-bg)",
            border: "var(--callout-info-border)",
            text: "var(--callout-info-text)",
          },
          warning: {
            bg: "var(--callout-warning-bg)",
            border: "var(--callout-warning-border)",
            text: "var(--callout-warning-text)",
          },
          tip: {
            bg: "var(--callout-tip-bg)",
            border: "var(--callout-tip-border)",
            text: "var(--callout-tip-text)",
          },
          danger: {
            bg: "var(--callout-danger-bg)",
            border: "var(--callout-danger-border)",
            text: "var(--callout-danger-text)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
