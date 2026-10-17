"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL, SHEET_ARRIVE, sheetArrive } from "@/lib/motion";
import { INFO_PANELS, type InfoPanel } from "@/lib/content/showcases";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Scroll window (fraction of the pinned range) in which Approach wipes up over About. */
const WIPE_START = 0.12;
const WIPE_END = 0.5;

function PanelText({ panel }: { panel: InfoPanel }) {
  return (
    // Right half on desktop, its right edge on the page gutter.
    <div className="absolute inset-x-gutter top-[39%] text-tiny-white md:left-[50.4%]">
      <SectionLabel data-info-item="">{panel.label}</SectionLabel>
      <p data-info-item="" className="mt-5 text-pretty font-serif text-statement-sm">
        {panel.body}
      </p>
      <div data-info-item="" className="mt-6">
        <ArrowLink href={panel.href} aria-label={`Learn more: ${panel.label}`}>
          Learn more
        </ArrowLink>
      </div>
    </div>
  );
}

// About & Approach: a pinned full-bleed stage. Scrolling wipes the Approach layer (photo + copy)
// up from the bottom over the About layer, while both photos drift in parallax.
export function InfoCards() {
  const root = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      // The stage rises over the page as a rounded sheet and squares off as it pins.
      sheetArrive(stageRef.current!, root.current!);

      const mm = gsap.matchMedia();

      mm.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)", motionOk: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          const { reduceMotion } = ctx.conditions as { reduceMotion: boolean };
          const approach = q("[data-info-layer='1']");

          // The wipe follows scroll even with reduced motion (it is direct manipulation, not ambient motion).
          const tl = gsap.timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: reduceMotion ? true : 0.5 },
          });
          tl.fromTo(approach, { "--wipe": 100 }, { "--wipe": 0, ease: "none", duration: WIPE_END - WIPE_START }, WIPE_START);

          if (!reduceMotion) {
            // Approach copy rises in as it is uncovered.
            tl.from(
              q("[data-info-layer='1'] [data-info-item]"),
              { y: 40, autoAlpha: 0, duration: 0.12, stagger: 0.04, ease: "power2.out", force3D: true },
              WIPE_START + 0.12,
            );

            // About copy: staggered fade-up as the stage scrolls into view.
            gsap.from(q("[data-info-layer='0'] [data-info-item]"), {
              y: 40,
              autoAlpha: 0,
              duration: 1,
              ease: EASE_REVEAL,
              stagger: 0.1,
              force3D: true,
              scrollTrigger: { trigger: root.current, start: "top 60%", toggleActions: "play none none reverse" },
            });

            // Photos drift through the whole time the stage is on screen.
            gsap.fromTo(
              q("[data-info-bg]"),
              { y: () => -0.1 * window.innerHeight },
              {
                y: () => 0.1 * window.innerHeight,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                  trigger: root.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          }
          tl.set({}, {}, 1);
        },
      );
    },
    { scope: root },
  );

  return (
    // Non-sticky wrapper carries the navbar marker (sticky elements can't be measured reliably).
    <div ref={root} data-nav-theme="media" className="relative isolate z-0 h-[330vh] w-full">
      <section
        ref={stageRef}
        aria-label="About and approach"
        className={`sticky top-0 h-svh w-full overflow-hidden bg-tiny-black text-tiny-white md:h-screen ${SHEET_ARRIVE}`}
      >
        {INFO_PANELS.map((panel, i) => (
          <div
            key={panel.label}
            data-info-layer={i}
            // Layer 1 is clipped from the top: --wipe 100 → 0 reveals it bottom-up.
            className={`absolute inset-0 ${i === 1 ? "[--wipe:100] [clip-path:inset(calc(var(--wipe)*1%)_0_0_0)]" : ""}`}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div data-info-bg="" className="absolute inset-0 scale-[1.21] will-change-transform">
                {/* Black and white: atmosphere on the ink stage, not portfolio colour. */}
                <Image src={panel.image} alt="" fill sizes="100vw" className="object-cover object-top grayscale" />
              </div>
            </div>
            <PanelText panel={panel} />
          </div>
        ))}
      </section>
    </div>
  );
}
