export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        // Message appear animation
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Human bubble + bot response slide up
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-out-left": "slide-out-left 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.35s ease-out forwards",
      },
      colors: {
        sidebarBg: "#0d0e1a",
        mainBg: "#07080f",
        hoveringIcon: "rgba(255,255,255,0.07)",
        inputBg: "rgba(255,255,255,0.06)",
        background: "#07080f",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
