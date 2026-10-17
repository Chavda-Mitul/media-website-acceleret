"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PROJECT_MORPH, projectHref, projectVtName, type Project } from "@/lib/content/projects";
import { ProjectMedia } from "@/components/projects/ProjectMedia";

/** Progress at which the preview takes the next project's view-transition name (it is full-bleed from 0.85). */
const ARM_AT = 0.9;
/** Progress at which the page hands off to the next project. */
const HANDOFF_AT = 0.98;
/**
 * A handoff only fires once the section has been seen below this progress during this visit, so landing
 * on the page already scrolled to the bottom (browser back restores scroll) doesn't bounce straight on.
 */
const REARM_BELOW = 0.6;

const CLIP_DESKTOP = "inset(22% 20% 22% 20% round 12px)";
const CLIP_MOBILE = "inset(24% 5% 24% 5% round 12px)";
const CLIP_FULL = "inset(0% 0% 0% 0% round 0px)";

const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;

/** How long input stays held once the next page's URL is in: the 700ms morph (globals.css) plus a margin. */
const MORPH_HOLD_MS = 850;
/** Release regardless after this long, in case the navigation never lands. */
const MAX_HOLD_MS = 3000;
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);

/**
 * Swallows wheel / touch / keyboard scrolling until the page at `path` has been up for the morph's length.
 * The morph lands on the hero where it was captured (scroll 0), so a visitor still wheeling must not scroll
 * the new page underneath it. Capture-phase on window, so it runs before Lenis's listener and can stop it.
 */
function holdScrollInput(path: string) {
  const block = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) block(event);
  };
  const options = { capture: true, passive: false } as const;
  window.addEventListener("wheel", block, options);
  window.addEventListener("touchmove", block, options);
  window.addEventListener("keydown", onKey, true);

  const start = performance.now();
  let arrived = 0;
  const check = (now: number) => {
    if (!arrived && location.pathname === path) arrived = now;
    if ((arrived && now - arrived > MORPH_HOLD_MS) || now - start > MAX_HOLD_MS) {
      window.removeEventListener("wheel", block, options);
      window.removeEventListener("touchmove", block, options);
      window.removeEventListener("keydown", onKey, true);
    } else {
      requestAnimationFrame(check);
    }
  };
  requestAnimationFrame(check);
}

// "Keep scrolling": the next project's card grows to full-bleed as the visitor scrolls, then the page hands
// off to that project. The preview carries the next project's view-transition name once it's full-bleed,
// so the navigation morphs it into the next page's hero.
export function NextProject({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const [armed, setArmed] = useState(false);
  // Set while the scroll-driven version runs (not under reduced motion); the button uses it.
  const scrubbing = useRef(false);
  const canHandOff = useRef(false);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const href = projectHref(project.slug);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const frame = q("[data-next-frame]")[0];
      const media = q("[data-next-frame] [data-project-media]")[0];
      const ringArc = q("[data-next-ring-arc]")[0];
      const ringText = q("[data-next-ring-text]")[0];
      const mm = gsap.matchMedia();

      mm.add(
        { desktop: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" },
        (context) => {
          const { desktop, motion } = context.conditions!;
          if (!motion) return;
          scrubbing.current = true;
          // Next keeps visited pages alive (hidden in <Activity>) and re-runs this on return, with refs and
          // state intact: start each visit unarmed, so coming back doesn't bounce straight on again.
          canHandOff.current = false;

          let isArmed = false;
          let handedOff = false;

          const handOff = () => {
            handedOff = true;
            // The name must be committed before the navigation's view transition snapshots the page.
            if (!isArmed) flushSync(() => setArmed(true));
            // Stop any smooth-scroll momentum, and further input, so the next page holds still under the morph.
            const l = lenisRef.current;
            l?.scrollTo(l.scroll, { immediate: true, force: true });
            holdScrollInput(href);
            router.push(href, { transitionTypes: [PROJECT_MORPH] });
          };

          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                onUpdate: (self) => {
                  const p = self.progress;
                  ringArc.style.strokeDashoffset = String(RING_C * (1 - p));
                  ringText.textContent = `${Math.round(p * 100)}%`;
                  if (p < REARM_BELOW) canHandOff.current = true;

                  const shouldArm = p >= ARM_AT;
                  if (shouldArm !== isArmed && !handedOff) {
                    isArmed = shouldArm;
                    setArmed(shouldArm);
                  }
                  if (p >= HANDOFF_AT && canHandOff.current && !handedOff) handOff();
                },
              },
            })
            .to("[data-next-content]", { autoAlpha: 0, y: -30, duration: 0.25 }, 0)
            .to("[data-next-label]", { autoAlpha: 0, y: -20, duration: 0.2 }, 0)
            .fromTo(frame, { clipPath: desktop ? CLIP_DESKTOP : CLIP_MOBILE }, { clipPath: CLIP_FULL, duration: 0.85, ease: "power1.inOut" }, 0)
            .fromTo(media, { scale: 1.15 }, { scale: 1, duration: 0.85, force3D: true }, 0)
            .to("[data-next-shade]", { opacity: 0, duration: 0.6 }, 0.25)
            // Hold at full-bleed for the last stretch, so the morph starts from a still frame.
            .set({}, {}, 1);

          return () => {
            scrubbing.current = false;
            setArmed(false);
          };
        },
      );
    },
    { scope: root },
  );

  // Glide to the end of the page and let the scroll-driven handoff take over; under reduced motion, just go.
  const goNext = () => {
    const l = lenisRef.current;
    if (!scrubbing.current) {
      router.push(href);
      return;
    }
    canHandOff.current = true;
    if (l) l.scrollTo(l.limit, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      aria-labelledby="next-project-title"
      className="relative h-[260svh] bg-tiny-white motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <p data-next-label="" className="absolute inset-x-0 top-[11%] text-center font-serif text-tagline tracking-tight-1 text-tiny-muted">
          Keep scrolling
        </p>

        {/* Full-viewport frame clipped down to a card; the scroll opens the clip to full-bleed. */}
        <div data-next-frame="" className="absolute inset-0 [clip-path:inset(24%_5%_24%_5%_round_12px)] md:[clip-path:inset(22%_20%_22%_20%_round_12px)]">
          <ProjectMedia
            image={project.cover}
            name={armed ? projectVtName(project.slug) : undefined}
            className="h-full"
            mediaClassName="inset-0 will-change-transform"
          >
            <div data-next-shade="" className="absolute inset-0 bg-black/45" />
          </ProjectMedia>
        </div>

        <div data-next-content="" className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center text-tiny-white md:gap-5">
          <p className="text-cap-1 font-medium tracking-tight-1 text-white/70">Next project</p>
          <h2 id="next-project-title" className="font-display text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-none tracking-tight-5">
            {project.title}
          </h2>
          <p className="max-w-md text-sub-2 leading-[1.4] tracking-tight-1 text-white/85 md:text-sub-1">{project.summary}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={goNext}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-tiny-brand px-5 py-3 text-cap-1 font-medium tracking-tight-1 transition-opacity duration-300 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Go to {project.title}
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2 8h12M9 3l5 5-5 5" />
              </svg>
            </button>
            <Link
              href="/work"
              className="rounded-full border border-white/50 px-5 py-3 text-cap-1 font-medium tracking-tight-1 transition-colors duration-300 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              All projects
            </Link>
          </div>
        </div>

        {/* Handoff progress */}
        <div
          aria-hidden="true"
          className="absolute bottom-6 right-6 size-16 rounded-full bg-tiny-white/85 backdrop-blur-md motion-reduce:hidden md:bottom-10 md:right-10 md:size-20"
        >
          <svg viewBox="0 0 64 64" className="size-full -rotate-90">
            <circle cx="32" cy="32" r={RING_R} fill="none" stroke="currentColor" strokeWidth="2" className="text-tiny-faint" />
            <circle
              data-next-ring-arc=""
              cx="32"
              cy="32"
              r={RING_R}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C}
              className="text-tiny-brand"
            />
          </svg>
          <span
            data-next-ring-text=""
            className="absolute inset-0 flex items-center justify-center text-cap-2 font-medium tabular-nums text-tiny-black md:text-cap-1"
          >
            0%
          </span>
        </div>
      </div>
    </section>
  );
}
