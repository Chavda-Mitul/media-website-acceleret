"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { INFO_PANELS, type InfoPanel } from "@/lib/content/showcases";
import { BentArrow } from "@/components/ui/BentArrow";

/** Scroll window (fraction of the pinned range) in which Approach wipes up over About. */
const WIPE_START = 0.12;
const WIPE_END = 0.5;

function PanelText({ panel }: { panel: InfoPanel }) {
  return (
    // Same font size on the wrapper so the 5em indents line up across label, body and link.
    <div className="absolute inset-x-4 top-[39%] font-display text-[1.25rem] font-semibold leading-none tracking-[-0.03em] md:left-[50.4%] md:right-[4.17%] md:text-about">
      <p data-info-item="" className="text-white/30 md:indent-[5em]">
        {panel.label}
      </p>
      <p data-info-item="" className="mt-[0.15em] text-white md:indent-[5em]">
        {panel.body}
      </p>
      <div data-info-item="" className="mt-[1.55em] md:mt-6 md:pl-[5em]">
        <a
          href={panel.href}
          aria-label={`Learn more: ${panel.label}`}
          className="group inline-flex items-center gap-2 font-sans text-[0.75rem] font-normal capitalize leading-[1.2] tracking-tight-1 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-[0.9rem]"
        >
          <BentArrow size="sm" />
          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-[scale] after:duration-500 after:ease-out-cubic group-hover:after:scale-x-100">
            Learn more
          </span>
        </a>
      </div>
    </div>
  );
}

// About & Approach: a pinned full-bleed stage. Scrolling wipes the Approach layer (photo + copy)
// up from the bottom over the About layer, while both photos drift in parallax.
export function InfoCards() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
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
        aria-label="About and approach"
        className="sticky top-0 h-svh w-full overflow-hidden bg-tiny-black text-tiny-white md:h-screen"
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
                <Image src={panel.image} alt="" fill sizes="100vw" className="object-cover object-top" />
              </div>
            </div>
            <PanelText panel={panel} />
          </div>
        ))}
      </section>
    </div>
  );
}
