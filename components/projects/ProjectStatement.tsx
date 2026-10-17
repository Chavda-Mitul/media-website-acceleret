"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

// "The brief": the statement's words light up one by one as it scrolls through the viewport.
export function ProjectStatement({ statement, body }: { statement: string; body: string }) {
  const root = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(textRef.current!, {
          type: "words",
          autoSplit: true,
          // Returned so SplitText reverts and rebuilds it when the lines re-wrap.
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.15 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: textRef.current, start: "top 80%", end: "bottom 45%", scrub: true },
              },
            ),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="px-6 py-24 md:px-section-x md:py-40">
      <div className="mx-auto grid max-w-[1761px] gap-8 md:grid-cols-[1fr_2fr] md:gap-12">
        <h2 className="text-cap-1 font-medium tracking-tight-1 text-tiny-muted">The brief</h2>
        <div>
          <p ref={textRef} className="text-pretty font-serif text-statement">
            {statement}
          </p>
          <p data-reveal="" className="mt-10 max-w-2xl text-sub-1 leading-[1.5] tracking-tight-1 text-tiny-gray md:mt-14">
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
