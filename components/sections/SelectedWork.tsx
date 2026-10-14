"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { ALL_WORK, WORK, type WorkItem } from "@/lib/content/work";
import { BentArrow } from "@/components/ui/BentArrow";
import { WorkVideo } from "@/components/ui/WorkVideo";

function WorkCard({ item, sizes }: { item: WorkItem; sizes: string }) {
  return (
    <a
      href={item.href}
      data-work-card=""
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tiny-black"
    >
      <article className="flex h-full flex-col">
        {/* Hover: the frame insets 6px and the media zooms to 1.05 */}
        <div
          className="relative w-full overflow-hidden rounded-lg bg-tiny-gray [clip-path:inset(0_round_8px)] transition-[clip-path] duration-500 ease-out-cubic group-hover:[clip-path:inset(6px_round_8px)]"
          style={{ aspectRatio: item.aspect }}
        >
          {/* Oversized + translated on scroll for a subtle parallax */}
          <div data-work-parallax="" className="absolute inset-0 will-change-transform">
            {item.media.type === "video" ? (
              <WorkVideo
                src={item.media.src}
                poster={item.media.poster}
                className="absolute inset-0 h-full w-full object-cover transition-[scale] duration-700 ease-out-cubic group-hover:scale-105"
              />
            ) : (
              <Image
                src={item.media.src}
                alt={`${item.client} — ${item.title}`}
                fill
                sizes={sizes}
                className="object-cover transition-[scale] duration-700 ease-out-cubic group-hover:scale-105"
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col items-baseline font-semibold leading-[1.2] tracking-tight-2 md:mt-3 md:flex-row md:gap-6 md:text-sub-1">
          <h3>{item.client}</h3>
          <span className="text-tiny-muted">{item.title}</span>
        </div>
      </article>
    </a>
  );
}

function AllWorkLink({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <span className="block overflow-hidden">
        <span data-all-work="" className="block">
          {/* Text size lives on the link so the arrow's 1lh height matches the 32px label */}
          <a
            href={ALL_WORK.href}
            className="group inline-flex items-center gap-2 font-display text-[1.25rem] font-semibold leading-none tracking-tight-5 text-tiny-black focus-visible:outline-2 focus-visible:outline-offset-4 md:text-h4"
          >
            <BentArrow />
            <span className="flex items-start gap-1">
              <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-[scale] after:duration-500 after:ease-out-cubic group-hover:after:scale-x-100">
                {ALL_WORK.label}
              </span>
              <span className="font-sans text-[0.625rem] font-normal leading-[1.2] tracking-normal">
                {ALL_WORK.count}
                <span className="sr-only"> projects</span>
              </span>
            </span>
          </a>
        </span>
      </span>
    </div>
  );
}

export function SelectedWork() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Cards fade + rise in, staggered by whichever ones enter together.
        const cards = q<HTMLElement>("[data-work-card]");
        gsap.set(cards, { autoAlpha: 0, y: 60 });
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE_REVEAL, stagger: 0.12, force3D: true }),
        });

        // Media drifts inside its frame while the card crosses the viewport.
        q<HTMLElement>("[data-work-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -6, scale: 1.15 },
            {
              yPercent: 6,
              scale: 1.15,
              ease: "none",
              force3D: true,
              scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        q<HTMLElement>("[data-all-work]").forEach((el) => {
          gsap.from(el, {
            yPercent: 110,
            duration: 1,
            ease: EASE_REVEAL,
            force3D: true,
            scrollTrigger: { trigger: el, start: "top 95%", toggleActions: "play none none reverse" },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Selected work" className="relative w-full bg-tiny-white px-6 pb-16 md:px-section-x md:pb-24">
      <h2 className="sr-only">Selected work</h2>
      <div className="mx-auto flex max-w-[120rem] flex-col gap-6 md:gap-30">
        {/* Row 1: wide + narrow, top-aligned */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[730fr_518fr] md:items-start md:gap-4">
          <WorkCard item={WORK.cottonball} sizes="(min-width: 768px) 58vw, 100vw" />
          <WorkCard item={WORK.amesa} sizes="(min-width: 768px) 41vw, 100vw" />
        </div>

        {/* Row 2: single card pushed right by a 24% spacer */}
        <div className="md:grid md:grid-cols-[24fr_76fr]">
          <div aria-hidden="true" className="hidden md:block" />
          <WorkCard item={WORK.shieldAi} sizes="(min-width: 768px) 76vw, 100vw" />
        </div>

        {/* Row 3: narrow + wide; the narrow column ends with the All Work link */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[518fr_730fr] md:items-stretch md:gap-4">
          <div className="flex flex-col">
            <WorkCard item={WORK.freegame} sizes="(min-width: 768px) 41vw, 100vw" />
            <AllWorkLink className="mt-auto hidden pt-8 md:block" />
          </div>
          <WorkCard item={WORK.mienne} sizes="(min-width: 768px) 58vw, 100vw" />
        </div>

        <AllWorkLink className="mt-4 md:hidden" />
      </div>
    </section>
  );
}
