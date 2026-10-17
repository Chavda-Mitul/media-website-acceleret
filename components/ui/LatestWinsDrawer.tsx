"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { NEWS } from "@/lib/content/news";

type LatestWinsDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Side drawer of recent wins. Native <dialog> gives focus trapping; Escape is routed through
// onClose so the exit animation plays before the dialog actually closes.
export function LatestWinsDrawer({ open, onClose }: LatestWinsDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const q = gsap.utils.selector(dialog);
    const reduce = window.matchMedia(REDUCED_MOTION).matches;

    if (open) {
      if (!dialog.open) dialog.showModal();
      lenis?.stop();
      gsap.fromTo(q("[data-wins-fade]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.3, overwrite: true });
      gsap.fromTo(
        q("[data-wins-item]"),
        { autoAlpha: 0, scale: 0.95, y: 30 },
        { autoAlpha: 1, scale: 1, y: 0, duration: reduce ? 0 : 0.5, ease: "power3.out", stagger: 0.08, delay: reduce ? 0 : 0.05, overwrite: true, force3D: true },
      );
    } else if (dialog.open) {
      gsap.to(q("[data-wins-fade], [data-wins-item]"), {
        autoAlpha: 0,
        duration: reduce ? 0 : 0.25,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          dialog.close();
          lenis?.start();
        },
      });
    }
  }, [open, lenis]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Latest wins"
      data-lenis-prevent=""
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden bg-transparent p-0 text-tiny-black backdrop:bg-transparent"
    >
      {/* Dim + blur the page; clicking it closes the drawer */}
      <div data-wins-fade="" onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-[10px]" />

      <button
        type="button"
        data-wins-fade=""
        onClick={onClose}
        aria-label="Close latest wins"
        className="absolute bottom-6 left-1/2 z-30 flex size-10 -translate-x-1/2 items-center justify-center rounded-lg bg-tiny-black text-tiny-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tiny-black md:bottom-auto md:left-auto md:right-4 md:top-4 md:size-8 md:translate-x-0"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      <div className="absolute left-1/2 top-4 z-10 flex max-h-[calc(100dvh-6rem)] w-[340px] max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col gap-2 overflow-y-auto overscroll-contain pb-4 [scrollbar-width:none] md:left-auto md:right-[60px] md:top-[15px] md:h-[calc(100dvh-30px)] md:max-h-none md:w-[min(421px,calc(100vw-108px))] md:max-w-none md:translate-x-0 md:gap-[7px]">
        {NEWS.map((item) => (
          <article
            key={item.title}
            data-wins-item=""
            className="shrink-0 rounded-[12px] border border-black/10 bg-white/70 backdrop-blur-[42px] transition-colors duration-200 hover:bg-white/90 md:rounded-[16px]"
          >
            <a
              href={item.href}
              onClick={onClose}
              className="grid h-[110px] w-full grid-cols-[80px_1fr] items-center gap-4 rounded-[inherit] p-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 md:h-[136px] md:grid-cols-[100px_1fr] md:gap-[18px] md:px-4 md:py-[18px]"
            >
              <div className="relative size-[81px] overflow-hidden rounded-lg md:size-[100px]">
                <Image src={item.image} alt="" fill sizes="100px" className="object-cover" />
              </div>
              <div className="flex h-[81px] flex-col justify-between self-start pt-1 md:h-[100px] md:pt-[3px]">
                <p className="max-w-[197px] text-[0.75rem] leading-[1.2] tracking-tight-1 md:max-w-[244px] md:text-[0.875rem]">
                  {item.title}
                </p>
                <p className="text-[0.5rem] leading-[1.4] text-black/40 md:text-[0.625rem]">{item.category}</p>
              </div>
            </a>
          </article>
        ))}
      </div>
    </dialog>
  );
}
