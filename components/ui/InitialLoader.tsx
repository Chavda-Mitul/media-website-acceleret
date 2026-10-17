"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cueIntro, whenFontsReady, type IntroCue } from "@/lib/motion";
import { LogoMark } from "@/components/ui/Logo";

/** Seconds the logo holds on black before it docks (stands in for the reference's glitch-art intro). */
const BLACK_HOLD = 1.8;
/** Loader logo scale (~320px wide, as on the reference). Set in CSS so it shows before hydration. */
const MARK_SCALE = "[transform:scale(3.1)] sm:[transform:scale(2.7)]";

// Module scope survives remounts (Strict Mode, HMR), so the loader only plays on a hard load.
let played = false;

// Page-load intro: the logo on black, then it flies into the nav pill while the black lifts like a curtain
// off the homepage's white opening stage, where the mark is already waiting on its timeline (ParticleHero).
// Navbar and the hero sections hold their intros until the cues fired here (see lib/motion.ts).
export function InitialLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(played);
  const lenis = useLenis();

  // No scrolling until hand-off.
  useEffect(() => {
    if (!lenis || done) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis, done]);

  // Re-runs (and reverts) when `done` flips, so once the overlay is gone its matchMedia listeners are too:
  // a later reduced-motion change must never re-run this against a missing root, because a throw there
  // aborts GSAP's matchMedia re-run loop and leaves every later section reverted (e.g. the spectrum cards).
  useGSAP(
    () => {
      if (done || !root.current) return;

      // Cues run other components' intros (Navbar, Hero). GSAP records animations created in a tween's
      // callback into that tween's context, so fire them outside ours: reverting the loader must not undo them.
      const cue = (ctx: gsap.Context, name: IntroCue) => ctx.ignore(() => cueIntro(name));
      const finish = (ctx: gsap.Context) => {
        played = true;
        cue(ctx, "nav");
        cue(ctx, "page");
        setDone(true);
      };

      const mm = gsap.matchMedia();
      // Reduced motion: CSS already hides the overlay; just release the page.
      mm.add("(prefers-reduced-motion: reduce)", (ctx) => finish(ctx));
      mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
        const el = root.current;
        if (!el) return;
        const flyer = el.querySelector<HTMLElement>("[data-loader-flyer]")!;
        const mark = el.querySelector<HTMLElement>("[data-loader-mark]")!;
        // Where the logo must travel to land on the nav logo; measured once the pill is in place.
        // Both copies share one centre and scale, so the same move lands either of them.
        const dock = { x: 0, y: 0 };

        // The black copy only shows as the logo lands in the frosted pill.
        gsap.set(flyer, { autoAlpha: 0 });

        const intro = gsap
          .timeline({ paused: true })
          .to(mark, { autoAlpha: 1, duration: 0.6, ease: "power2.out" })
          .addLabel("dock", BLACK_HOLD)
          .call(
            () => {
              // Navbar centres its pill on this cue, so measure after it.
              cue(ctx, "nav");
              const from = flyer.getBoundingClientRect();
              const to = document.querySelector("[data-nav-logo]")?.getBoundingClientRect() ?? from;
              dock.x = to.left + to.width / 2 - (from.left + from.width / 2);
              dock.y = to.top + to.height / 2 - (from.top + from.height / 2);
            },
            undefined,
            "dock",
          )
          // The black lifts like a curtain, its rounded edge last, off the white stage below. (A fade would wash
          // grey on the way to white.) It runs as long as the logo's flight, so the edge trails the white logo.
          .to("[data-loader-base]", { yPercent: -100, duration: 0.85, ease: "power3.inOut" }, "dock")
          .to([flyer, mark], { x: () => dock.x, y: () => dock.y, scale: 1, duration: 0.85, ease: "power3.inOut" }, "dock")
          // White on black in flight, black once it's over the pill.
          .to(mark, { autoAlpha: 0, duration: 0.3, ease: "none" }, "dock+=0.55")
          .to(flyer, { autoAlpha: 1, duration: 0.3, ease: "none" }, "dock+=0.55")
          // Hand-off: Navbar shows its own logo under the flyer in the same tick, so hide the overlay now
          // rather than waiting for React to unmount it.
          .call(
            () => {
              gsap.set(el, { autoAlpha: 0 });
              finish(ctx);
            },
            undefined,
            "+=0.1",
          );

        let cancelled = false;
        whenFontsReady(() => {
          if (!cancelled) intro.play();
        });
        return () => {
          cancelled = true;
        };
      });
    },
    { scope: root, dependencies: [done], revertOnUpdate: true },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      data-initial-loader=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-loader"
    >
      {/* Reaches a sheet radius below the screen, so its rounded bottom edge only shows once it lifts. */}
      <div
        data-loader-base=""
        className="absolute inset-x-0 top-0 bottom-[calc(var(--radius-sheet)*-1)] rounded-b-sheet bg-tiny-black"
      />
      {/* Black copy (the flyer) under the white one; it takes over as the logo lands in the nav pill. */}
      <div className="absolute inset-0 flex items-center justify-center text-tiny-black">
        <div data-loader-flyer="" className={MARK_SCALE}>
          <LogoMark />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-tiny-white">
        <div data-loader-mark="" className={`opacity-0 ${MARK_SCALE}`}>
          <LogoMark />
        </div>
      </div>
    </div>
  );
}
