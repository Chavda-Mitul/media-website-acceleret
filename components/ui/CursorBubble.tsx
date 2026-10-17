"use client";

import { useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type CursorBubbleProps = {
  /** Element whose pointer events drive the bubble. */
  scope: RefObject<HTMLElement | null>;
  /** The bubble shows while the pointer is over an element matching this selector. */
  target: string;
  label: string;
};

// A round label that trails the cursor over `target` elements (same feel as the footer's Contact pill:
// quickTo 0.55s, scales in from 0.4). Decorative: the links underneath carry the accessible names.
export function CursorBubble({ scope, target, label }: CursorBubbleProps) {
  const bubble = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const area = scope.current;
        const el = bubble.current;
        if (!area || !el) return;

        // Fixed to the viewport, so clientX/Y can be used as-is.
        gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.4, autoAlpha: 0 });
        const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
        let shown = false;

        const show = (x: number, y: number) => {
          shown = true;
          xTo(x, x);
          yTo(y, y);
          gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        };
        const hide = () => {
          shown = false;
          gsap.to(el, { autoAlpha: 0, scale: 0.4, duration: 0.3, ease: "power2.in", overwrite: "auto" });
        };

        const onMove = (e: PointerEvent) => {
          const over = (e.target as Element).closest(target) !== null;
          if (over && !shown) show(e.clientX, e.clientY);
          else if (!over && shown) hide();
          xTo(e.clientX);
          yTo(e.clientY);
        };
        const onLeave = () => {
          if (shown) hide();
        };

        area.addEventListener("pointermove", onMove);
        area.addEventListener("pointerleave", onLeave);
        return () => {
          area.removeEventListener("pointermove", onMove);
          area.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { dependencies: [target] },
  );

  return (
    <div
      ref={bubble}
      aria-hidden="true"
      className="pointer-events-none invisible fixed left-0 top-0 z-30 flex size-24 items-center justify-center gap-1 rounded-full bg-tiny-brand text-cap-1 font-medium tracking-tight-1 text-tiny-white"
    >
      {label}
      <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9 9 3M4 3h5v5" />
      </svg>
    </div>
  );
}
