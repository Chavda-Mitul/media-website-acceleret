import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Navbar } from "@/components/ui/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media Website",
  description: "Emotion-led brand & digital studio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <noscript>
          <style>
            {
              "[data-mask-word],[data-mask-line]{transform:none!important}[data-nav-inner]{visibility:visible!important}[data-initial-loader]{display:none!important}"
            }
          </style>
        </noscript>
        {/* Navbar sits inside the provider because it reads scroll direction from Lenis. */}
        <SmoothScrollProvider>
          <Navbar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
