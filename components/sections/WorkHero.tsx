"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL, PAGE_REVEAL_OFFSET, onIntroCue } from "@/lib/motion";

const LINES_DESKTOP = ["Designing for feelings"];
const LINES_MOBILE = ["Designing", "Feelings"];

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
// Calibrated for Inter Tight to match the reference's measured line widths (98% of the column on
// desktop, "Designing" at 94% on mobile); its Suisse sizes are 8.5cqw / 18.5cqw. The bottom padding
// is trimmed by the extra glyph height so the work starts at the same y as the reference (478px).
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
      <div className="mx-auto max-w-[1761px] pb-[156px] [container-type:inline-size] md:pb-[264px]">
        <h1 className="text-center font-display font-semibold uppercase leading-crush">
          <MaskedLines lines={LINES_MOBILE} className="block text-[20.1cqw] tracking-[-0.05em] md:hidden" />
          <MaskedLines
            lines={LINES_DESKTOP}
            className="hidden whitespace-nowrap text-[9.24cqw] tracking-[-0.06em] md:block"
          />
        </h1>
      </div>
    </section>
  );
}
