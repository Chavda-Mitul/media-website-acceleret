"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { ProjectBlock, ProjectImage } from "@/lib/content/projects";

function BlockImage({ image, sizes, className = "" }: { image: ProjectImage; sizes: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-tiny-gray ${className}`}>
      <div data-block-media="" className="absolute inset-0 will-change-transform">
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}

// Case-study imagery. "full" opens from an inset rounded window to the full width as it scrolls in,
// "pair" is a two-up row, and "wide" drifts in parallax inside its frame.
export function ProjectBlocks({ blocks }: { blocks: ProjectBlock[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        q<HTMLElement>('[data-block="full"]').forEach((block) => {
          const frame = block.querySelector<HTMLElement>("[data-block-frame]")!;
          const media = block.querySelector<HTMLElement>("[data-block-media]")!;
          const scrollTrigger = { trigger: block, start: "top bottom", end: "top 15%", scrub: true };
          gsap.fromTo(
            frame,
            { clipPath: "inset(0% 8% 0% 8% round 24px)" },
            { clipPath: "inset(0% 0% 0% 0% round 8px)", ease: "none", scrollTrigger },
          );
          gsap.fromTo(media, { scale: 1.15 }, { scale: 1, ease: "none", force3D: true, scrollTrigger });
        });

        q<HTMLElement>('[data-block="wide"] [data-block-media]').forEach((media) => {
          gsap.fromTo(
            media,
            { yPercent: -6, scale: 1.15 },
            {
              yPercent: 6,
              scale: 1.15,
              ease: "none",
              force3D: true,
              scrollTrigger: { trigger: media.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        q<HTMLElement>('[data-block="pair"] > *').forEach((frame, i) => {
          gsap.from(frame, {
            autoAlpha: 0,
            y: 80,
            duration: 1.1,
            ease: "expo.out",
            delay: (i % 2) * 0.1,
            force3D: true,
            scrollTrigger: { trigger: frame, start: "top 90%" },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Project imagery" className="flex flex-col gap-4 px-3 pb-24 sm:px-4 md:gap-6 md:pb-40">
      {blocks.map((block, i) => {
        if (block.type === "pair") {
          return (
            <div key={i} data-block="pair" className="grid gap-4 md:grid-cols-2 md:gap-6">
              {block.images.map((image) => (
                <BlockImage key={image.src} image={image} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/5] md:aspect-[4/3]" />
              ))}
            </div>
          );
        }
        if (block.type === "full") {
          return (
            <div key={i} data-block="full">
              <div data-block-frame="" className="overflow-hidden rounded-lg">
                <BlockImage image={block.image} sizes="100vw" className="aspect-[4/5] md:aspect-video" />
              </div>
            </div>
          );
        }
        return (
          <div key={i} data-block="wide" className="md:px-[12%]">
            <BlockImage image={block.image} sizes="(min-width: 768px) 76vw, 100vw" className="aspect-[4/3] md:aspect-[21/9]" />
          </div>
        );
      })}
    </section>
  );
}
