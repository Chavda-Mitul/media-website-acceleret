import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/sections/Footer";
import "./globals.css";

export const metadata: Metadata = {
  // Pages set a short title ("Work"); the template appends the brand.
  title: { default: "Acceleret Media", template: "%s | Acceleret Media" },
  description: "Emotion-led brand & digital studio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables}>
      {/* Browser extensions inject attributes on <body> (e.g. style="margin-top:0px") before hydration. */}
      <body suppressHydrationWarning>
        <noscript>
          <style>
            {
              "[data-mask-word],[data-mask-line]{transform:none!important}[data-nav-inner]{visibility:visible!important}[data-initial-loader]{display:none!important}[data-process-cover]{transform:none!important}"
            }
          </style>
        </noscript>
        {/* Navbar sits inside the provider because it reads scroll direction from Lenis. */}
        <SmoothScrollProvider>
          <Navbar />
          {children}
          {/* Site-wide curtain footer: every page wraps its content in <main className="relative z-10 bg-…"> */}
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
