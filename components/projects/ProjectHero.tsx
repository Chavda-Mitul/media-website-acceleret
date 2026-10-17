"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL, onIntroCue } from "@/lib/motion";
import { projectVtName, type Project } from "@/lib/content/projects";
import { MaskedWords } from "@/components/ui/MaskedWords";
import { ProjectMedia } from "@/components/projects/ProjectMedia";

/** Seconds before the title rises: lets the cover morph (700ms, see globals.css) mostly land first. */
const TITLE_DELAY = 0.45;

const SERVICE_CELLS = ["bg-tiny-pill text-tiny-black", "bg-tiny-brand text-tiny-white", "bg-tiny-black text-tiny-white"];

// Case-study hero. The cover shares the project's view-transition name with its gallery card and the
// previous project's "Keep scrolling" preview, so arriving from either grows that image into this frame.
export function ProjectHero({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Reduced motion is handled in CSS ([data-mask-word] stays in place).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const words = q("[data-hero-word]");
        const fades = q("[data-hero-fade]");
        gsap.set(words, { y: 0, yPercent: 110 });
        // [data-reveal] (globals.css) keeps them hidden until hydration; reduced motion shows them in place.
        gsap.set(fades, { autoAlpha: 0, y: 24 });
        // After a client-side navigation the cue has already fired, so this runs straight away.
        return onIntroCue("page", () => {
          gsap.to(words, { yPercent: 0, duration: 1.1, ease: EASE_REVEAL, stagger: 0.06, delay: TITLE_DELAY, force3D: true });
          gsap.to(fades, { autoAlpha: 1, y: 0, duration: 1, ease: EASE_REVEAL, stagger: 0.08, delay: TITLE_DELAY + 0.2 });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="px-3 pt-17 sm:px-4 sm:pt-20">
      <div className="relative">
        <ProjectMedia
          image={project.cover}
          name={projectVtName(project.slug)}
          eager
          className="h-[72svh] rounded-lg md:h-[74svh]"
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
        </ProjectMedia>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 text-tiny-white md:flex-row md:items-end md:justify-between md:gap-12 md:p-12">
          <h1 className="max-w-[14ch] font-display text-[clamp(3rem,9vw,10rem)] font-semibold leading-tightest tracking-tight-5">
            <MaskedWords text={project.title} target="data-hero-word" />
          </h1>
          <p data-hero-fade="" data-reveal="" className="max-w-md text-sub-1 leading-[1.4] tracking-tight-1 text-white/85 md:pb-3">
            {project.summary}
          </p>
        </div>
      </div>

      <ul className="mt-2 grid gap-2 md:grid-cols-3">
        {project.services.map((service, i) => (
          <li
            key={service}
            data-hero-fade=""
            data-reveal=""
            className={`flex items-center justify-between rounded-lg px-5 py-4 text-sub-1 font-medium tracking-tight-2 md:px-6 md:py-5 ${SERVICE_CELLS[i % SERVICE_CELLS.length]}`}
          >
            {service}
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 14V2M3 7l5-5 5 5" />
            </svg>
          </li>
        ))}
      </ul>
    </section>
  );
}
