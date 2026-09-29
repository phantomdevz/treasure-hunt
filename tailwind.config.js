/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void:       "#0A0B0D",
        graphite:   "#1C1F24",
        steel:      "#8A8F98",
        silver:     "#E8EAED",
        "pincer-red":   "#E8342A",
        "red-tint":     "#F4776E",
        "pincer-blue":  "#2E5EFF",
        "blue-tint":    "#6E8CFF",
        rust:       "#5C4A3D",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        red:      "0 0 20px rgba(232,52,42,0.3)",
        "red-lg": "0 0 40px rgba(232,52,42,0.4)",
        blue:     "0 0 20px rgba(46,94,255,0.3)",
        "blue-lg":"0 0 40px rgba(46,94,255,0.4)",
      },
      animation: {
        "radar-pulse":     "radarPulse 2s ease-out infinite",
        "radar-pulse-red": "radarPulseRed 2s ease-out infinite",
        "glitch-slice":    "glitch-slice 5s steps(2) infinite",
        spin:              "spin 0.8s linear infinite",
      },
      keyframes: {
        radarPulse: {
          "0%":   { boxShadow: "0 0 0 0 rgba(46,94,255,0.6)" },
          "70%":  { boxShadow: "0 0 0 14px rgba(46,94,255,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(46,94,255,0)" },
        },
        radarPulseRed: {
          "0%":   { boxShadow: "0 0 0 0 rgba(232,52,42,0.6)" },
          "70%":  { boxShadow: "0 0 0 14px rgba(232,52,42,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(232,52,42,0)" },
        },
        "glitch-slice": {
          "0%":   { clipPath: "inset(0 0 95% 0)", transform: "translate(-3px, 0)" },
          "15%":  { clipPath: "inset(30% 0 50% 0)", transform: "translate(3px, 0)" },
          "30%":  { clipPath: "inset(70% 0 10% 0)", transform: "translate(-2px, 1px)" },
          "60%":  { clipPath: "inset(0 0 0 0)", transform: "translate(0, 0)" },
          "100%": { clipPath: "inset(0 0 0 0)", transform: "translate(0, 0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
