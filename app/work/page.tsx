import type { Metadata } from "next";
import { WorkHero } from "@/components/sections/WorkHero";
import { WorkViews } from "@/components/sections/WorkViews";
import { WorkGrid } from "@/components/sections/WorkGrid";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Work | Media Website",
  description: "Selected case studies and snapshots from the studio.",
};

export default function WorkPage() {
  return (
    <>
      {/* No-JS: captions and images skip their reveal (see lib/reveal.ts, components/ui/FadeImage.tsx). */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}[data-fade]{opacity:1!important}"}</style>
      </noscript>
      {/* z-10 + solid background: <main> scrolls away over the sticky footer (curtain reveal). */}
      <main className="relative z-10 bg-tiny-white">
        <WorkHero />
        {/* Server-rendered grid; the client wrapper adds the view toggle and lazy filmstrip. */}
        <WorkViews grid={<WorkGrid />} />
      </main>
      <Footer />
    </>
  );
}
