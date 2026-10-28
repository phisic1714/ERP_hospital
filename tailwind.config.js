/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    require('node:path').join(__dirname, 'apps/*/src/**/*.{js,ts,jsx,tsx,mdx}'),
    require('node:path').join(__dirname, 'packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F8FC",
        surface: "#FFFFFF",
        brand: {
          bg: "#F5F8FC",
          card: "#FFFFFF",
          border: "#E2EAF4",
          heading: "#14213D",
          body: "#64748B",
          muted: "#94A3B8",
          // Blue Theme (ERP Center & Inventory)
          blue: {
            DEFAULT: "#2563EB",
            dark: "#164EAB",
            light: "#EFF6FF",
            secondary: "#60A5FA",
          },
          // Orange Theme (Procurement)
          orange: {
            DEFAULT: "#F28C28",
            dark: "#D97706",
            light: "#FFF7ED",
            secondary: "#FB923C",
          },
          // HR Theme
          teal: {
            DEFAULT: "#0D9488",
            dark: "#0F766E",
            light: "#F0FDFA",
          },
          // Finance Theme
          indigo: {
            DEFAULT: "#6366F1",
            dark: "#4338CA",
            light: "#EEF2FF",
          },
          // Reports Theme
          violet: {
            DEFAULT: "#8B5CF6",
            dark: "#6D28D9",
            light: "#F5F3FF",
          },
          // Semantic Colors
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        // Dynamic Theme Variables for Modules
        theme: {
          primary: "var(--theme-primary, #2563EB)",
          dark: "var(--theme-dark, #164EAB)",
          light: "var(--theme-light, #EFF6FF)",
          secondary: "var(--theme-secondary, #60A5FA)",
          border: "var(--theme-border, #BFDBFE)",
          ring: "var(--theme-ring, rgba(37, 99, 235, 0.2))",
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 33, 61, 0.04), 0 2px 6px -1px rgba(20, 33, 61, 0.02)',
        'card': '0 2px 12px -2px rgba(20, 33, 61, 0.05), 0 1px 3px 0 rgba(20, 33, 61, 0.03)',
        'elevated': '0 10px 30px -5px rgba(20, 33, 61, 0.08), 0 4px 10px -2px rgba(20, 33, 61, 0.03)',
        'glow-blue': '0 4px 20px rgba(37, 99, 235, 0.18)',
        'glow-orange': '0 4px 20px rgba(242, 140, 40, 0.22)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'Prompt', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
