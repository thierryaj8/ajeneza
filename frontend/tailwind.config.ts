import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1160px" } },
    extend: {
      colors: {
        // Brand palette from the site template (fixed, theme-independent)
        navy: { DEFAULT: "#172a3a", 900: "#101f2b", 800: "#172a3a", 700: "#213a4d", 600: "#2c4a60" },
        gold: { DEFAULT: "#a7834e", 700: "#7d5d33", 600: "#8f6c3e", 400: "#c4a173", 300: "#d7bd98", 100: "#e8dece" },
        silver: { DEFAULT: "#b9c1c2", 200: "#d0d6d7", 100: "#e8dece" },
        sand: "#eae3d7",
        cream: "#f5f1e9",
        paper: "#fbf9f4",
        // Theme-aware tokens (switch in dark mode)
        bg: v("bg"),
        surface: v("surface"),
        "surface-2": v("surface-2"),
        ink: v("ink"),
        muted: v("muted"),
        line: v("line"),
        accent: v("accent"),
        "accent-strong": v("accent-strong"),
        "accent-ink": v("accent-ink"),
        heading: v("heading"),
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { prose: "68ch" },
      // The template is sharp-edged: keep corners almost square everywhere.
      borderRadius: { sm: "1px", DEFAULT: "2px", md: "2px", lg: "2px", xl: "3px", "2xl": "3px", "3xl": "4px" },
      typography: () => ({
        site: {
          css: {
            "--tw-prose-body": "rgb(var(--ink))",
            "--tw-prose-headings": "rgb(var(--heading))",
            "--tw-prose-lead": "rgb(var(--muted))",
            "--tw-prose-links": "rgb(var(--accent))",
            "--tw-prose-bold": "rgb(var(--heading))",
            "--tw-prose-counters": "rgb(var(--muted))",
            "--tw-prose-bullets": "rgb(var(--line))",
            "--tw-prose-hr": "rgb(var(--line))",
            "--tw-prose-quotes": "rgb(var(--heading))",
            "--tw-prose-quote-borders": "rgb(var(--accent))",
            "--tw-prose-captions": "rgb(var(--muted))",
            "--tw-prose-code": "rgb(var(--heading))",
            "--tw-prose-pre-code": "#e8dece",
            "--tw-prose-pre-bg": "#101f2b",
            "--tw-prose-th-borders": "rgb(var(--line))",
            "--tw-prose-td-borders": "rgb(var(--line))",
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;
