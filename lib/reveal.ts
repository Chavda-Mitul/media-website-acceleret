import type { DependencyList, RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";

/**
 * Fades every [data-reveal] inside `scope` up into place as it scrolls into view, staggered across
 * whichever ones enter together. Elements inside a `hidden` subtree are skipped (they have no layout);
 * when `deps` change the reveals reset and re-run, so a newly shown subtree animates in.
 * Starting state lives in app/globals.css so there is no flash before hydration.
 */
export function useStaggerReveal(scope: RefObject<HTMLElement | null>, deps: DependencyList = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils
          .toArray<HTMLElement>("[data-reveal]", scope.current)
          .filter((el) => !el.closest("[hidden]"));
        if (!items.length) return;

        ScrollTrigger.batch(items, {
          start: "top 92%",
          // Anything already above the fold line (e.g. after a view swap mid-page) reveals right away.
          end: "max",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: EASE_REVEAL, stagger: 0.08, overwrite: true }),
        });
      });
    },
    { scope, dependencies: [...deps], revertOnUpdate: true },
  );
}
