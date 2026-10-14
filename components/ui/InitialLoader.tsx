"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cueIntro, whenFontsReady } from "@/lib/motion";
import { LogoMark } from "@/components/ui/Logo";

/** Seconds the logo holds on black before the wipe (stands in for the reference's glitch-art intro). */
const BLACK_HOLD = 1.4;
/** Loader logo scale (~300px wide, as on the reference). Set in CSS so it shows before hydration. */
const MARK_SCALE = "[transform:scale(6.4)] sm:[transform:scale(5.4)]";

// Module scope survives remounts (Strict Mode, HMR), so the loader only plays on a hard load.
let played = false;

// Page-load intro mirroring the reference: logo on black, a white wipe down, then the logo flies into
// the nav pill. Navbar and Hero hold their intros until the cues fired here (see lib/motion.ts).
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

  useGSAP(
    () => {
      if (!root.current) return;

      const finish = () => {
        played = true;
        cueIntro("nav");
        cueIntro("page");
        setDone(true);
      };

      const mm = gsap.matchMedia();
      // Reduced motion: CSS already hides the overlay; just release the page.
      mm.add("(prefers-reduced-motion: reduce)", finish);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const flyer = root.current!.querySelector<HTMLElement>("[data-loader-flyer]")!;
        // Where the flyer must travel to land on the nav logo; measured once the pill is in place.
        const dock = { x: 0, y: 0 };

        // Normalise the CSS pre-hydration offset into GSAP-managed transforms.
        gsap.set("[data-loader-panel]", { y: 0, yPercent: -100 });

        const intro = gsap
          .timeline({ paused: true })
          .to("[data-loader-mark]", { autoAlpha: 1, duration: 0.6, ease: "power2.out" })
          .to("[data-loader-panel]", { yPercent: 0, duration: 0.57, ease: "power3.inOut" }, BLACK_HOLD)
          .to("[data-loader-mark]", { autoAlpha: 0, duration: 0.2, ease: "none" }, ">-0.2")
          .addLabel("dock")
          .call(() => {
            // Navbar centres its pill on this cue, so measure after it.
            cueIntro("nav");
            const from = flyer.getBoundingClientRect();
            const to = document.querySelector("[data-nav-logo]")?.getBoundingClientRect() ?? from;
            dock.x = to.left + to.width / 2 - (from.left + from.width / 2);
            dock.y = to.top + to.height / 2 - (from.top + from.height / 2);
          })
          .set("[data-loader-base]", { autoAlpha: 0 }, "dock")
          .to("[data-loader-panel]", { autoAlpha: 0, duration: 0.55, ease: "power2.out" }, "dock")
          .to(flyer, { x: () => dock.x, y: () => dock.y, scale: 1, duration: 0.85, ease: "power3.inOut" }, "dock")
          // Hand-off: Navbar shows its own logo under the flyer in the same tick, so hide the overlay now
          // rather than waiting for React to unmount it.
          .call(
            () => {
              gsap.set(root.current, { autoAlpha: 0 });
              finish();
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
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      data-initial-loader=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-loader"
    >
      <div data-loader-base="" className="absolute inset-0 bg-tiny-black" />
      <div data-loader-panel="" className="absolute inset-0 bg-tiny-white [transform:translateY(-100%)]" />
      {/* Black copy (the flyer) sits under the white one and shows once the white copy fades over the wipe. */}
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
