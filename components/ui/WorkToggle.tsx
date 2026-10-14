"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export type WorkView = "grid" | "filmstrip";

const OPTIONS: { value: WorkView; label: string; icon: ReactNode }[] = [
  {
    value: "grid",
    label: "Grid",
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
        <rect width="4" height="4" rx="2" />
        <rect y="6" width="4" height="4" rx="2" />
        <rect x="6" width="4" height="4" rx="2" />
        <rect x="6" y="6" width="4" height="4" rx="2" />
      </svg>
    ),
  },
  {
    value: "filmstrip",
    label: "Filmstrip",
    icon: (
      <svg
        width="15"
        height="10"
        viewBox="0 0 15 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="13.75" y1="2.5" x2="13.75" y2="7" />
        <rect x="4" y="0.75" width="7" height="8" rx="1" />
        <line x1="0.75" y1="2.5" x2="0.75" y2="7" />
      </svg>
    ),
  },
];

type WorkToggleProps = {
  view: WorkView;
  onChange: (view: WorkView) => void;
};

/** Offset of the active button from the first one (button size and gap change at md). */
function activeOffset(group: HTMLElement | null) {
  const buttons = group?.querySelectorAll<HTMLElement>("button");
  if (!buttons?.length) return 0;
  const active = [...buttons].find((b) => b.getAttribute("aria-pressed") === "true") ?? buttons[0];
  return active.offsetLeft - buttons[0].offsetLeft;
}

// Floating frosted pill, bottom-centre. A black square slides behind the active icon.
export function WorkToggle({ view, onChange }: WorkToggleProps) {
  const root = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      const x = activeOffset(root.current);
      if (first.current) {
        first.current = false;
        gsap.set(indicator.current, { x });
      } else {
        gsap.to(indicator.current, { x, duration: 0.3, ease: "power3.out", overwrite: true });
      }
    },
    { dependencies: [view], scope: root },
  );

  // Keep the square under the active icon across the md breakpoint.
  useEffect(() => {
    const onResize = () => gsap.set(indicator.current, { x: activeOffset(root.current) });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="fixed left-1/2 z-30 -translate-x-1/2"
      style={{ bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <div
        ref={root}
        role="group"
        aria-label="Layout"
        className="relative flex h-10 items-center gap-[2px] rounded-lg border border-tiny-black/10 bg-white/70 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-[15px] md:h-auto md:gap-1"
      >
        <span
          ref={indicator}
          aria-hidden="true"
          className="pointer-events-none absolute left-1 top-1 h-8 w-[34px] rounded-sm bg-tiny-black will-change-transform md:h-10 md:w-10 md:rounded-[6px]"
        />
        {OPTIONS.map((option) => {
          const active = option.value === view;
          return (
            <button
              key={option.value}
              type="button"
              aria-label={option.label}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`relative z-10 flex h-8 w-[34px] cursor-pointer items-center justify-center rounded-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tiny-black md:h-10 md:w-10 md:rounded-[6px] ${
                active ? "text-tiny-white" : "text-tiny-black"
              }`}
            >
              {option.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
