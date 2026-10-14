"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { SHIPYARD } from "@/lib/content/work";
import { BentArrow } from "@/components/ui/BentArrow";

export function ShipyardBanner() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = { trigger: root.current, start: "top 75%", toggleActions: "play none none reverse" };

        // Heading + body unmask line by line (re-split on resize / font load).
        q<HTMLElement>("[data-shipyard-lines]").forEach((el, i) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1,
                ease: EASE_REVEAL,
                stagger: 0.08,
                delay: i * 0.15,
                force3D: true,
                scrollTrigger: trigger,
              }),
          });
        });

        gsap.from(q("[data-shipyard-fade]"), {
          autoAlpha: 0,
          y: 24,
          duration: 1,
          ease: EASE_REVEAL,
          stagger: 0.1,
          delay: 0.3,
          force3D: true,
          scrollTrigger: trigger,
        });

        // Content drifts slightly against the scroll while the banner is on screen.
        gsap.fromTo(
          q("[data-shipyard-inner]"),
          { y: 40 },
          {
            y: -40,
            ease: "none",
            force3D: true,
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Shipyard"
      // Coloured background: the navbar switches to its frosted-white pills over it.
      data-nav-theme="media"
      className="relative w-full overflow-hidden bg-tiny-shipyard text-tiny-white"
    >
      <div
        data-shipyard-inner=""
        className="relative mx-auto grid max-w-[120rem] grid-cols-1 px-5 pb-6 pt-4 will-change-transform md:min-h-[35vw] md:grid-cols-2 md:grid-rows-[auto_1fr_auto] md:gap-x-16 md:gap-y-3 md:pb-[3.125rem] md:pl-[5.3125rem] md:pr-30 md:pt-8"
      >
        {/* Logo: SVG uses currentColor, so render it as a white mask */}
        <span
          role="img"
          aria-label="Shipyard"
          data-shipyard-fade=""
          className="mx-auto mb-[3.3125rem] block h-[1.6875rem] w-[6.8125rem] bg-tiny-white [mask:var(--logo)_center/contain_no-repeat] md:col-start-1 md:row-start-3 md:mx-0 md:mb-0 md:h-[3.875rem] md:w-[15.625rem] md:self-end"
          style={{ "--logo": `url(${SHIPYARD.logo})` } as CSSProperties}
        />

        <h2
          data-shipyard-lines=""
          className="mb-25 max-w-62 font-serif text-[1.5rem] leading-[1.1] tracking-tight-2 md:col-start-1 md:row-start-1 md:mb-0 md:max-w-[26.8125rem] md:text-[2.5rem]"
        >
          {SHIPYARD.heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <div className="flex w-54 flex-col gap-5 justify-self-end md:col-start-2 md:row-start-1 md:w-auto md:max-w-[23.9375rem] md:gap-[2.3125rem]">
          <p data-shipyard-lines="" className="text-[0.75rem] leading-tight tracking-tight-2 md:text-[1rem] md:leading-[1.1]">
            {SHIPYARD.body}
          </p>
          <a
            href={SHIPYARD.link.href}
            data-shipyard-fade=""
            className="group inline-flex items-center gap-2 self-start text-[0.75rem] capitalize leading-[1.2] tracking-tight-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tiny-white md:text-cap-1"
          >
            <BentArrow size="sm" />
            <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-[scale] after:duration-500 after:ease-out-cubic group-hover:after:scale-x-100">
              {SHIPYARD.link.label}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
