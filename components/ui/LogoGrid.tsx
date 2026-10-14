"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CLIENT_LOGOS } from "@/lib/content/services";

const CELLS = 6;
/** Seconds each set of logos stays up (reference: ~2.5s). */
const CYCLE_SECONDS = 2.5;
const FADE_SECONDS = 0.6;
const CELL_JUSTIFY = [
  "md:justify-start",
  "md:justify-center",
  "md:justify-center",
  "md:justify-center",
  "md:justify-center",
  "md:justify-end",
];

/** Logo shown in `cell` at `step`; each step advances every cell by a full row, cycling all clients. */
function logoAt(cell: number, step: number) {
  const n = CLIENT_LOGOS.length;
  return CLIENT_LOGOS[(((cell + CELLS * step) % n) + n) % n];
}

// Two stacked layers per cell: the incoming layer gets its new logo while invisible, then cross-fades in.
export function LogoGrid() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  // Advance on GSAP's ticker (pauses with the tab), and only while the grid is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let call: gsap.core.Tween | undefined;
    let preloaded = false;
    const schedule = () => {
      call = gsap.delayedCall(CYCLE_SECONDS, () => {
        setStep((s) => s + 1);
        schedule();
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!preloaded) {
          preloaded = true;
          CLIENT_LOGOS.forEach(({ src }) => {
            new window.Image().src = src;
          });
        }
        if (!call) schedule();
      } else {
        call?.kill();
        call = undefined;
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      call?.kill();
    };
  }, []);

  useGSAP(
    () => {
      if (step === 0) return;
      const q = gsap.utils.selector(root);
      const shared = { duration: FADE_SECONDS, ease: "power2.inOut", stagger: 0.08, overwrite: true };
      gsap.to(q(`[data-layer="${step % 2}"]`), { ...shared, autoAlpha: 1 });
      gsap.to(q(`[data-layer="${(step + 1) % 2}"]`), { ...shared, autoAlpha: 0 });
    },
    { dependencies: [step], scope: root },
  );

  return (
    <div ref={root}>
      <p className="sr-only">Selected clients: {CLIENT_LOGOS.map((logo) => logo.name).join(", ")}</p>
      <div
        aria-hidden="true"
        className="grid w-full grid-cols-3 items-center justify-items-center gap-y-6 md:grid-cols-6 md:justify-items-stretch"
      >
        {Array.from({ length: CELLS }, (_, cell) => (
          <div key={cell} className="relative h-16 w-full md:h-22">
            {[0, 1].map((layer) => {
              const logo = logoAt(cell, step % 2 === layer ? step : step - 1);
              return (
                <div
                  key={layer}
                  data-layer={layer}
                  className={`absolute inset-0 flex items-center justify-center ${CELL_JUSTIFY[cell]} ${
                    layer === 1 ? "invisible opacity-0" : ""
                  }`}
                >
                  <div className="relative h-13 w-38.5 md:h-18 md:w-57.5">
                    <Image src={logo.src} alt="" fill unoptimized className="object-contain opacity-90 grayscale" />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
