"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { CONTACT_EMAIL, NAV_LINKS } from "@/lib/navigation";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

const MENU_LINKS = NAV_LINKS.filter((link) => link.label !== "Contact");

// Full-width top drawer for < md. Native <dialog> provides focus trapping and Esc-to-close.
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  // Whether this menu stopped Lenis, so closing only undoes its own lock (not, e.g., the initial loader's).
  const lockedScroll = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
      if (lenis) {
        lenis.stop();
        lockedScroll.current = true;
      }
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(panelRef.current, { yPercent: -100 }, { yPercent: 0, duration: 0.9, ease: EASE_REVEAL });
        gsap.fromTo(
          dialog.querySelectorAll("[data-menu-item]"),
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, ease: EASE_REVEAL, stagger: 0.05, delay: 0.15 },
        );
      }
    } else {
      if (dialog.open) dialog.close();
      if (lockedScroll.current) {
        lenis?.start();
        lockedScroll.current = false;
      }
    }
  }, [open, lenis]);

  // The drawer only exists below md; close it if the viewport grows past that.
  useEffect(() => {
    if (!open) return;
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => mql.matches && onClose();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [open, onClose]);

  return (
    <dialog
      ref={dialogRef}
      id="mobile-menu"
      aria-label="Menu"
      data-lenis-prevent=""
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/20 backdrop:backdrop-blur-xl"
    >
      <div ref={panelRef} className="flex flex-col bg-[#111] px-6 pb-12 pt-4 text-tiny-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="-mr-2 ml-auto flex size-10 items-center justify-center transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </button>

        <nav aria-label="Mobile navigation" className="mt-16">
          <ul className="flex flex-col font-display text-[1.5rem] leading-tight tracking-tight-4">
            {MENU_LINKS.map((link) => (
              <li key={link.label} className="overflow-hidden">
                <a
                  href={link.href}
                  onClick={onClose}
                  data-menu-item=""
                  className="block transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-20 overflow-hidden text-cap-1 font-medium tracking-tight-2">
          <div data-menu-item="">
            <p className="text-white/40">Let&rsquo;s work together</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-opacity hover:opacity-60">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
