export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "slide-in-right": {
          "0%": {
            transform: "translateX(100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "slide-out-left": {
          "0%": {
            transform: "translateX(0)",
            opacity: "1",
          },
          "100%": {
            transform: "translateX(-100%)",
            opacity: "0",
          },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-out-left": "slide-out-left 0.5s ease-out",
      },
      colors: {
        sidebarBg: "#181818",
        mainBg: "#212121",
        hoveringIcon: "#3a3a3a",
        inputBg: "#303030",
      },
    },
  },
  variants: {
    extend: {
      animation: ["responsive", "hover", "focus"],
    },
  },
  plugins: [],
};
