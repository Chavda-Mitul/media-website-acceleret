"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Chapter } from "@/components/ui/Act";

/**
 * The homepage's playhead: a slim rail in the right gutter with one segment per chapter (see <Act>).
 * Each segment fills as you read through its chapter and a small ▶ rides the fill, so the page reads as
 * one reel with a scrubber. It's drawn in white with `mix-blend-difference`, so it shows black on paper
 * and white on ink or photos without a background of its own. Segments jump to their chapter; their names
 * show on hover or focus. Desktop (lg) only: it lives in the 80px gutter. Shown from the first chapter
 * after the hook until the closing card (`[data-story-end]`).
 */
export function StoryRail({ chapters }: { chapters: Chapter[] }) {
  const root = useRef<HTMLElement>(null);

  // Read lazily on click, so Lenis arriving after mount never rebuilds the triggers.
  const lenis = useLenis();
  const lenisRef = useRef<Lenis | undefined>(undefined);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    () => {
      const rail = root.current!;
      const q = gsap.utils.selector(rail);
      const segments = q("[data-rail-segment]");
      const fills = q("[data-rail-fill]");
      const head = q("[data-rail-head]")[0];
      const acts = chapters.map((chapter) => document.getElementById(`chapter-${chapter.id}`));
      if (!head || acts.some((act) => !act)) return;

      const setFill = fills.map((fill) => gsap.quickSetter(fill, "scaleY"));
      const setHead = gsap.quickSetter(head, "y", "px");
      const progress = chapters.map(() => 0);
      let current = 0;

      // The playhead sits at the end of the fill in the chapter being read.
      const placeHead = () => {
        const segment = segments[current];
        setHead(segment.offsetTop + segment.offsetHeight * progress[current] - head.offsetHeight / 2);
      };

      const update = (index: number, value: number) => {
        progress[index] = value;
        setFill[index](value);
        if (index === current) placeHead();
      };

      const enter = (index: number) => {
        current = index;
        segments.forEach((segment, i) =>
          i === index ? segment.setAttribute("aria-current", "step") : segment.removeAttribute("aria-current"),
        );
        placeHead();
      };

      acts.forEach((act, index) => {
        ScrollTrigger.create({
          trigger: act,
          start: "top 50%",
          end: "bottom 50%",
          onUpdate: (self) => update(index, self.progress),
          onRefresh: (self) => update(index, self.progress),
          onToggle: (self) => {
            if (self.isActive) enter(index);
          },
        });
      });

      ScrollTrigger.create({
        trigger: acts[1],
        start: "top 60%",
        endTrigger: document.querySelector("[data-story-end]") ?? acts[acts.length - 1],
        end: "top 60%",
        onToggle: (self) =>
          gsap.to(rail, { autoAlpha: self.isActive ? 1 : 0, duration: 0.4, ease: "power2.out", overwrite: true }),
      });
    },
    { scope: root, dependencies: [chapters] },
  );

  const goTo = (chapter: Chapter) => {
    const target = document.getElementById(`chapter-${chapter.id}`);
    if (!target) return;
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // force: also cuts through the spectrum's locked snap glide.
    if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.6, force: true, immediate: instant });
    else target.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
  };

  return (
    <nav
      ref={root}
      aria-label="Story chapters"
      // Hidden until GSAP shows it (autoAlpha also keeps the hidden buttons out of the tab order).
      className="pointer-events-none invisible fixed right-0 top-1/2 z-rail hidden w-gutter -translate-y-1/2 justify-center text-tiny-white opacity-0 mix-blend-difference lg:flex"
    >
      <div className="relative flex flex-col gap-1.5">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            data-rail-segment=""
            aria-label={`Go to ${chapter.label}`}
            onClick={() => goTo(chapter)}
            className="group pointer-events-auto relative flex h-[clamp(2rem,5vh,3rem)] w-4 justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            <span className="relative h-full w-0.5 overflow-hidden bg-current/30">
              <span data-rail-fill="" className="absolute inset-0 origin-top scale-y-0 bg-current" />
            </span>
            <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap font-sans text-cap-2 font-medium tracking-tight-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              {chapter.label}
            </span>
          </button>
        ))}

        {/* The playhead: the logo's ▶, turned to point along the reel. */}
        <span data-rail-head="" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -ml-[4px] block size-2">
          <svg viewBox="0 0 8 10" className="block size-full rotate-90">
            <path d="M0 0L8 5L0 10V0Z" fill="currentColor" />
          </svg>
        </span>
      </div>
    </nav>
  );
}
