"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { CONTACT_EMAIL } from "@/lib/navigation";
import { CONTACT_ILLUSTRATION } from "@/lib/content/stickers";

type ContactCardProps = {
  open: boolean;
  onClose: () => void;
  /** The navbar "Contact" button: excluded from outside-click and refocused on Escape. */
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Frosted contact card that drops down under the nav pill (desktop). Non-modal disclosure:
// Escape or a click outside closes it; the navbar also closes it when the page scrolls.
export function ContactCard({ open, onClose, triggerRef }: ContactCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia(REDUCED_MOTION).matches;
    if (open) {
      // Fade opacity only (not autoAlpha) so the card stays focusable during the entry animation.
      gsap.set(el, { display: "block", visibility: "visible" });
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.975, y: -5 },
        { opacity: 1, scale: 1, y: 0, duration: reduce ? 0 : 0.3, ease: "power3.out", transformOrigin: "0% 0%", overwrite: true },
      );
      el.querySelector<HTMLButtonElement>("[data-contact-copy]")?.focus({ preventScroll: true });
    } else {
      gsap.to(el, {
        autoAlpha: 0,
        scale: 0.985,
        y: -4,
        duration: reduce ? 0 : 0.18,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          gsap.set(el, { display: "none" });
        },
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onClose();
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!ref.current?.contains(target) && !triggerRef.current?.contains(target)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, triggerRef]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
    } catch {
      // Clipboard unavailable (permissions / insecure context): fall back to the mail app.
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  return (
    <div
      ref={ref}
      id="contact-card"
      role="dialog"
      aria-label="Contact"
      style={{ display: "none" }}
      className="absolute left-3 top-[3.75rem] z-60 h-[548px] max-h-[calc(100dvh-88px)] w-[min(35.625rem,calc(100vw-2rem))] overflow-hidden rounded-sm bg-white/88 text-tiny-black backdrop-blur-[42px] sm:left-4 sm:top-[4.5rem]"
    >
      <p className="absolute left-[15px] top-[12px] text-[10px] leading-[1.4]">Talk to us</p>
      <p className="absolute left-[205px] top-[16px] text-[20px] leading-[1.3] tracking-[-0.03em] opacity-40">
        Let&rsquo;s work together
      </p>
      <button
        type="button"
        data-contact-copy=""
        onClick={copyEmail}
        aria-label={`Copy ${CONTACT_EMAIL} to clipboard`}
        className="absolute left-[205px] top-[37px] cursor-pointer text-[20px] leading-[1.3] tracking-[-0.03em] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {CONTACT_EMAIL}
      </button>
      <p
        role="status"
        className={`absolute left-[205px] top-[66px] text-[12px] leading-[1.2] tracking-tight-2 transition-opacity duration-300 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        {copied ? "Copied to clipboard!" : ""}
      </p>
      <div aria-hidden="true" className="absolute left-[79px] top-[89px] h-[439px] w-[364px] max-w-[calc(100%-95px)]">
        <Image
          src={CONTACT_ILLUSTRATION.src}
          alt=""
          fill
          sizes="364px"
          className="pointer-events-none object-contain"
        />
      </div>
    </div>
  );
}
