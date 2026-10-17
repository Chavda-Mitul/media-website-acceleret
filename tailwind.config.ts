import type { Config } from "tailwindcss";

// Design tokens extracted from tinywins.com (measured at a 1440px viewport).
// Loaded by Tailwind v4 via `@config` in app/globals.css.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Four families, one role each: Inter Tight for names, labels and the one shouted climax, Inter for body
      // and UI, Newsreader for everything the studio says (the narrator lines and the big statements), Geist
      // Mono for media captions. Plus Sora, footer only.
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-inter-tight)", "var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // The footer's wordmark, links and small print.
        footer: ["var(--font-sora)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        tiny: {
          // Ink and paper: the two tones of the page.
          white: "#ffffff",
          black: "#000000",
          // Values live in app/globals.css :root.
          // The logo's play-triangle blue: the only accent.
          brand: "var(--tiny-brand)",
          "light-purple": "var(--tiny-light-purple)",
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
        "tight-6": "-0.06em", // footer wordmark (Sora 800, letters just touching)
        "wide-1": "0.06em", // Geist Mono meta captions (uppercase)
      },
      lineHeight: {
        crush: "0.87",
        tightest: "0.9",
      },
      fontSize: {
        // One type scale. Display sizes are Inter Tight 600: display-1 is the closing headline, the one line that
        // shouts (uppercase); display-2 the hook headline; display-3 names: services, process steps, stats.
        "display-1": ["clamp(5rem, 8.6vw, 13.4375rem)", { lineHeight: "0.87", letterSpacing: "-0.04em" }],
        "display-1-mobile": ["clamp(3rem, 11.2vw, 13.4375rem)", { lineHeight: "0.87", letterSpacing: "-0.04em" }],
        "display-2": ["clamp(2rem, 4.6vw, 5.5rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "display-3": ["clamp(1.5rem, 2.2vw, 2.75rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        // The statements, in the serif (Newsreader 400, sentence case). statement: the chapter statements (studio
        // statement, showcase titles, closing banner, case-study brief); statement-sm: copy over photos (About /
        // Approach). Leading stays loose enough for masked lines to keep their descenders.
        statement: ["clamp(2rem, 4.6vw, 5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "statement-sm": ["clamp(1.625rem, 2.6vw, 3.25rem)", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
        // The narrator: every chapter's serif line (and the case-study taglines).
        tagline: ["clamp(1.25rem, 1.8vw, 2rem)", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        // "Make them feel [emotion]": 16px floor, 21.6px at 1440px, 24px cap; 24px flat below md.
        spectrum: ["clamp(1rem, 1.5vw, 1.5rem)", { lineHeight: "1.2", letterSpacing: "-0.04em" }],
        "spectrum-mobile": ["1.5rem", { lineHeight: "1", letterSpacing: "-0.05em" }],
        // Inter running text (Process cards, banner copy).
        body: ["clamp(0.9375rem, 1.05vw, 1.125rem)", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
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
        // One side gutter (24px → 80px from md), and the vertical rhythm. Values in app/globals.css :root.
        gutter: "var(--gutter)",
        section: "var(--space-section)",
        // Not "block": v4 reads that as an inline-size value, so `inline-block` would set a fixed width.
        rhythm: "var(--space-rhythm)",
        "section-x": "5rem",
      },
      borderRadius: {
        // Chapter edges only (SheetEdge, the closing banner card). Media keeps rounded-lg.
        sheet: "var(--radius-sheet)",
      },
      zIndex: {
        // Story chapter rail: above page content (z-10), below the header.
        rail: "60",
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
