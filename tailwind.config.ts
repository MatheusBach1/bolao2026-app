import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        nlw: {
          bg: '#09090A',
          card: '#202024',
          input: '#121214',
          yellow: '#F7DD43',
          green: '#04D361',
          textHover: '#8D8D99',
          textMuted: '#C4C4CC'
        },
        brand: {
          green: '#1A7A4A',
          dark: '#2C3E50',
        },
      },
    },
  },
  plugins: [],
};
export default config;
