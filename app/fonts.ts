import { Geist_Mono, Inter, Inter_Tight, Newsreader, Sora } from "next/font/google";

// Free stand-ins for the licensed originals:
// Suisse Intl -> Inter (body) / Inter Tight (display), ABC Gramercy -> Newsreader,
// Suisse Intl Mono -> Geist Mono. These four are the whole type system (see tailwind.config.ts), plus
// Sora for the footer alone.

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

// Upright only: the serif carries the narrator lines, never italic accents. Variable, with the optical-size
// axis, so the same face reads as a text serif in small copy and a display serif in the banner heading.
export const newsreader = Newsreader({
  subsets: ["latin"],
  style: "normal",
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

// Captions only (spectrum, process numbers), all below the first screen: not preloaded.
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

// Footer only, as on the reference footer: 800 for the wordmark (wide round bowls, two-storey a and tall
// ascenders: the closest free match to the reference's logo), regular for the links and small print.
// Variable, so 800 exists. Not preloaded: the footer is the last thing on every page, so it mustn't compete
// with the first screen.
export const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  inter.variable,
  interTight.variable,
  newsreader.variable,
  geistMono.variable,
  sora.variable,
].join(" ");
