"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { BRAND_BANNER } from "@/lib/content/work";
import { CONTACT_EMAIL } from "@/lib/navigation";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ButtonLink } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/Logo";

export function BrandBanner() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = { trigger: root.current, start: "top 75%", toggleActions: "play none none reverse" };

        // Heading + body unmask line by line (re-split on resize / font load).
        q<HTMLElement>("[data-banner-lines]").forEach((el, i) => {
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

        gsap.from(q("[data-banner-fade]"), {
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
          q("[data-banner-inner]"),
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
    // The story's closing card: a paper sheet with rounded corners on the ink stage (the page sets the ink
    // around it, and its wrapper carries the navbar marker), just before the footer curtain.
    <section ref={root} aria-label="Acceleret Media" className="relative w-full overflow-hidden rounded-sheet bg-tiny-white text-tiny-black">
      <div
        data-banner-inner=""
        className="relative mx-auto grid max-w-[120rem] grid-cols-1 px-gutter py-rhythm will-change-transform md:min-h-[35vw] md:grid-cols-2 md:grid-rows-[auto_1fr_auto] md:gap-x-16 md:gap-y-3"
      >
        {/* The full-colour mark: on the monochrome page, the logo is where the blue lives. */}
        <span
          role="img"
          aria-label="Acceleret Media logo"
          data-banner-fade=""
          className="mx-auto mb-[3.3125rem] block md:col-start-1 md:row-start-3 md:mx-0 md:mb-0 md:self-end"
        >
          <BrandMark className="h-9 md:h-[4.5rem]" />
        </span>

        {/* The story's last narrator line: the same serif voice as every chapter's, set as a chapter statement
            because it's the finale. */}
        <h2
          data-banner-lines=""
          className="mb-rhythm font-serif text-statement font-normal md:col-start-1 md:row-start-1 md:mb-0"
        >
          {BRAND_BANNER.heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <div className="flex w-full max-w-[24rem] flex-col gap-6 justify-self-end md:col-start-2 md:row-start-1 md:gap-8">
          <p data-banner-lines="" className="font-serif text-body">
            {BRAND_BANNER.body}
          </p>
          <div data-banner-fade="" className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink tone="ink" href={`mailto:${CONTACT_EMAIL}`}>
              Start a project
            </ButtonLink>
            <ArrowLink href={BRAND_BANNER.link.href}>
              <span className="font-serif font-normal">{BRAND_BANNER.link.label}</span>
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
