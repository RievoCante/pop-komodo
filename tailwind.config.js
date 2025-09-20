// Tailwind CSS configuration for Pop Komodo
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        bitcoin: "hsl(var(--bitcoin))",
        "bitcoin-glow": "hsl(var(--bitcoin-glow))",
        ethereum: "hsl(var(--ethereum))",
        "ethereum-glow": "hsl(var(--ethereum-glow))",
        monad: "hsl(var(--monad))",
        "monad-glow": "hsl(var(--monad-glow))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "gradient-shift": "gradientShift 15s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pop-pulse": "popPulse 0.3s ease-out",
        "count-up": "countUp 0.8s ease-out",
        "click-float": "clickFloat 1s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
      },
      keyframes: {
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.7",
          },
          "50%": {
            transform: "translateY(-20px) rotate(180deg)",
            opacity: "1",
          },
        },
        popPulse: {
          "0%": { transform: "scale(1)" },
          "50%": {
            transform: "scale(1.1)",
            boxShadow: "0 0 80px rgba(168,85,247,0.8)",
          },
          "100%": { transform: "scale(1)" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        clickFloat: {
          "0%": { opacity: "1", transform: "translateY(0) scale(0.5)" },
          "50%": { opacity: "0.8", transform: "translateY(-30px) scale(1.2)" },
          "100%": { opacity: "0", transform: "translateY(-60px) scale(0.8)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
