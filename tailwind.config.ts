import type { Config } from "tailwindcss";

// Design tokens extracted from tinywins.com (measured at a 1440px viewport).
// Loaded by Tailwind v4 via `@config` in app/globals.css.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-inter-tight)", "var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        tiny: {
          white: "#ffffff",
          black: "#000000",
          // Values live in app/globals.css :root so GSAP can read them too.
          yellow: "var(--tiny-yellow)",
          "light-yellow": "var(--tiny-light-yellow)",
          pink: "var(--tiny-pink)",
          "light-pink": "var(--tiny-light-pink)",
          green: "var(--tiny-green)",
          "light-green": "var(--tiny-light-green)",
          blue: "var(--tiny-blue)",
          "light-blue": "var(--tiny-light-blue)",
          purple: "var(--tiny-purple)",
          "light-purple": "var(--tiny-light-purple)",
          orange: "var(--tiny-orange)",
          "light-orange": "var(--tiny-light-orange)",
          shipyard: "var(--tiny-shipyard)",
          pill: "var(--tiny-pill)",
          "pill-hover": "var(--tiny-pill-hover)",
          gray: "var(--tiny-gray)",
          // Opacity tokens: case-study subtitles / inactive service items.
          muted: "rgb(0 0 0 / 0.4)",
          faint: "rgb(0 0 0 / 0.15)",
        },
      },
      letterSpacing: {
        "tight-1": "-0.01em", // nav links
        "tight-2": "-0.02em", // stats row, card titles
        "tight-3": "-0.03em", // hero headline, serif tagline
        "tight-4": "-0.04em", // closing "LET'S MAKE THEM FEEL SOMETHING"
        "tight-5": "-0.05em", // statement heading, services list
      },
      lineHeight: {
        crush: "0.87",
        tightest: "0.9",
      },
      fontSize: {
        // Fluid display sizes (74.88px / 123.84px / 25.92px / 18px at 1440px).
        hero: ["clamp(2rem, 5.2vw, 6rem)", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        mega: ["clamp(5rem, 8.6vw, 13.4375rem)", { lineHeight: "0.87", letterSpacing: "-0.04em" }],
        "mega-mobile": ["clamp(3rem, 11.2vw, 13.4375rem)", { lineHeight: "0.87", letterSpacing: "-0.04em" }],
        // Original uses -0.03em with ABC Gramercy; Instrument Serif is narrower, so loosened.
        tagline: ["clamp(1.25rem, 1.8vw, 2rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        stat: ["clamp(0.875rem, 1.5vw, 1.125rem)", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        // "Make them feel [emotion]" (21.6px at 1440px).
        spectrum: ["clamp(1.375rem, 1.5vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.04em" }],
        // Agency statement (32px mobile → 59px at 1440px) and service names (24px → 30.24px).
        statement: ["clamp(2rem, 4.1vw, 5rem)", { lineHeight: "0.9", letterSpacing: "-0.05em" }],
        service: ["clamp(1.5rem, 2.1vw, 2.5rem)", { lineHeight: "1", letterSpacing: "-0.05em" }],
        // Category showcase headings (66.24px at 1440px) and About/Approach copy (25.56px at 1440px).
        showcase: ["clamp(2rem, 4.6vw, 5.5rem)", { lineHeight: "0.9", letterSpacing: "-0.05em" }],
        about: ["clamp(1.25rem, 1.775vw, 2.25rem)", { lineHeight: "1.05", letterSpacing: "-0.05em" }],
        // Static desktop scale.
        h1: ["4rem", { lineHeight: "1" }],
        h2: ["3.5rem", { lineHeight: "1" }],
        h3: ["2.5rem", { lineHeight: "1" }],
        h4: ["2rem", { lineHeight: "1" }],
        "sub-1": ["1.125rem", { lineHeight: "1.2" }],
        "sub-2": ["1rem", { lineHeight: "1.1" }],
        "cap-1": ["0.875rem", { lineHeight: "1.2" }],
        "cap-2": ["0.75rem", { lineHeight: "1.2" }],
        "serif-lg": ["2.5rem", { lineHeight: "1.5" }],
        "serif-md": ["2rem", { lineHeight: "1.3" }],
        "serif-sm": ["1.25rem", { lineHeight: "1.3" }],
      },
      // Numeric steps (18 = 72px, 30 = 120px, 32 = 128px) come from v4's dynamic spacing scale.
      spacing: {
        gutter: "2rem",
        "section-x": "5rem",
      },
      zIndex: {
        header: "70",
        drawer: "80",
        loader: "200",
      },
      transitionTimingFunction: {
        "out-cubic": "cubic-bezier(0.33, 1, 0.68, 1)",
      },
    },
  },
};

export default config;
