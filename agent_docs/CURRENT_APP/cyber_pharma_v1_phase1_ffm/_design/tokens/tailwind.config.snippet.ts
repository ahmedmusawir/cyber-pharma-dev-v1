/* ============================================================
 * CYBER PHARMA v1 — tailwind.config.ts MAPPING SNIPPET
 * 
 * Merge this into the existing tailwind.config.ts at theme.extend.
 * This is what turns --primary (CSS variable) into bg-primary (utility).
 * 
 * NO numbered palette is referenced — that's intentional.
 * Components use semantic utilities only.
 *
 * Companion: _design/tokens/globals.css (the CSS variables)
 * ============================================================ */

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // semantic (fixed meaning)
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))"
        },
        // data-viz / KPI tiles
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        brand: ["var(--font-brand)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

/* ============================================================
 * FONT WIRING (in src/app/layout.tsx)
 *
 * import { Saira } from "next/font/google";
 * 
 * const saira = Saira({
 *   subsets: ["latin"],
 *   weight: ["300", "400", "500", "600", "700", "800"],
 *   variable: "--font-brand"
 * });
 *
 * Then apply to <html>:
 *   <html lang="en" className={`${saira.variable}`}>
 *
 * For Slate default dark mode, also add "dark":
 *   <html lang="en" className={`${saira.variable} dark`}>
 * ============================================================ */
