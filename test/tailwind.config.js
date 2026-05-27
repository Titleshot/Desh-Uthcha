/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: "#060b16",
          surface: "#0f172a",
          surfaceMuted: "#111f3c",
          accent: "#1d4ed8",
          pending: "#f59e0b",
          review: "#3b82f6",
          verified: "#22c55e",
          failed: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
