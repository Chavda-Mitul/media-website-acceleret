"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL, PAGE_REVEAL_OFFSET, onIntroCue } from "@/lib/motion";

const LINES_DESKTOP = ["Designing for feelings"];
const LINES_MOBILE = ["Designing", "feelings"];

function MaskedLines({ lines, className }: { lines: string[]; className: string }) {
  return (
    <span className={className}>
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden">
          <span data-mask-line="" className="block">
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

// Sized in container query units so the line always spans the column, like the reference.
// A statement, so it's in the serif (Newsreader 400, sentence case), calibrated to the reference's measured
// line widths: 98% of the column on desktop, "Designing" at 94% on mobile. The bottom padding
// is tightened for the project carousel, so its card row fits above the fold at 1080px. (The old
// grid used pb-[156px] / md:pb-[264px] so the work started at the reference's y of 478px.)
export function WorkHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Reduced motion is handled in CSS ([data-mask-line] stays in place).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = gsap.utils.toArray<HTMLElement>("[data-mask-line]", root.current);
        gsap.set(lines, { y: 0, yPercent: 110 });
        // Same clock as the Navbar intro (see lib/motion.ts).
        return onIntroCue("page", () => {
          gsap.to(lines, {
            yPercent: 0,
            duration: 1.1,
            ease: EASE_REVEAL,
            stagger: 0.08,
            delay: PAGE_REVEAL_OFFSET,
            force3D: true,
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="px-6 pt-24 md:px-section-x md:pt-28">
      <div className="mx-auto max-w-[1761px] pb-20 [container-type:inline-size] md:pb-24">
        {/* Leading just over 1, so the line masks keep the g's descenders. */}
        <h1 className="text-center font-serif font-normal leading-[1.05]">
          {/* Tracking sits with the font size: an em on the h1 would resolve against the h1's own size. */}
          <MaskedLines lines={LINES_MOBILE} className="block text-[21.96cqw] tracking-[-0.02em] md:hidden" />
          <MaskedLines
            lines={LINES_DESKTOP}
            className="hidden whitespace-nowrap text-[10.59cqw] tracking-[-0.02em] md:block"
          />
        </h1>
      </div>
    </section>
  );
}
