"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useStaggerReveal } from "@/lib/reveal";
import { WorkToggle, type WorkView } from "@/components/ui/WorkToggle";

// The filmstrip (and its ~1,000 tiles of data) loads on demand, in its own chunk.
const loadFilmstrip = () => import("@/components/sections/WorkFilmstrip").then((mod) => mod.WorkFilmstrip);

/** Seconds for each half of the view cross-fade. */
const FADE_OUT = 0.25;
const FADE_IN = 0.35;

// Grid ⇄ Filmstrip. The toggle reflects a click at once; the content fades out, swaps, and fades back in.
// Both views stay mounted once loaded (the inactive one is `hidden`), so switching back is instant.
export function WorkViews({ grid }: { grid: ReactNode }) {
  const [view, setView] = useState<WorkView>("grid");
  const [shown, setShown] = useState<WorkView>("grid");
  const [swaps, setSwaps] = useState(0);
  const [Filmstrip, setFilmstrip] = useState<ComponentType | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const requested = useRef<WorkView>("grid");
  const lenis = useLenis();

  useStaggerReveal(wrapper, [shown]);

  // Warm the chunk once the page settles, so the first switch doesn't wait on the network.
  useEffect(() => {
    const warm = () => void loadFilmstrip();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(id);
  }, []);

  const changeView = (next: WorkView) => {
    if (next === requested.current) return;
    requested.current = next;
    setView(next);

    const el = wrapper.current!;
    const fadedOut = new Promise<void>((resolve) => {
      gsap.to(el, {
        autoAlpha: 0,
        duration: FADE_OUT,
        ease: "power2.in",
        overwrite: true,
        onStart: () => gsap.set(el, { willChange: "opacity" }),
        onComplete: resolve,
      });
    });
    const ready = next === "filmstrip" && !Filmstrip ? loadFilmstrip() : Promise.resolve(null);

    Promise.all([fadedOut, ready]).then(([, loaded]) => {
      if (requested.current !== next) return; // a newer click took over
      if (loaded) setFilmstrip(() => loaded);
      setShown(next);
      setSwaps((n) => n + 1);
    });
  };

  // After the swap commits: re-measure for Lenis + ScrollTrigger (page height changed), then fade in.
  useEffect(() => {
    if (swaps === 0) return;
    lenis?.resize();
    ScrollTrigger.refresh();
    gsap.to(wrapper.current, {
      autoAlpha: 1,
      duration: FADE_IN,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => gsap.set(wrapper.current, { willChange: "auto" }),
    });
  }, [swaps, lenis]);

  return (
    <>
      <div ref={wrapper}>
        <div hidden={shown !== "grid"}>{grid}</div>
        {Filmstrip && (
          <div hidden={shown !== "filmstrip"}>
            <Filmstrip />
          </div>
        )}
      </div>
      <WorkToggle view={view} onChange={changeView} />
    </>
  );
}
