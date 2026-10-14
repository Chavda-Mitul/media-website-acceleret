import { Geist_Mono, Inter, Inter_Tight, Instrument_Serif } from "next/font/google";

// Free stand-ins for the licensed originals:
// Suisse Intl -> Inter (body) / Inter Tight (display), ABC Gramercy -> Instrument Serif,
// Suisse Intl Mono -> Geist Mono.

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

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = [inter.variable, interTight.variable, instrumentSerif.variable, geistMono.variable].join(" ");
