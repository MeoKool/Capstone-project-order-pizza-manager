/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1ab128",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#dba362",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#ef4d4d",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#47c737",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#efcb00",
          foreground: "#000000",
        },
        info: {
          DEFAULT: "#227eb8",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#5d6679",
        },
        accent: {
          DEFAULT: "#c0eba6",
          foreground: "#347928",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        status: {
          green: "#60b748",
          yellow: "#edd87e",
          orange: "#e29460",
          red: "#ef4d4d",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
