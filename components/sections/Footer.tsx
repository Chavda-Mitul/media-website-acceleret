"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { BRAND_NAME, CONTACT_EMAIL, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/navigation";
import { UNDERLINE_SELF } from "@/components/ui/ArrowLink";
import { StickerStamps } from "@/components/ui/StickerStamps";

const PILL_LABEL = "Contact Us";

// Social icons as filled tiles with the glyph knocked out (evenodd), like the reference footer's.
// LinkedIn and the X glyph (scaled to half size inside its tile) are from Simple Icons, CC0.
const SOCIAL_ICONS: Record<(typeof SOCIAL_LINKS)[number]["label"], ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" className="size-full">
      <path d="M6 0h12a6 6 0 0 1 6 6v12a6 6 0 0 1 -6 6h-12a6 6 0 0 1 -6 -6v-12a6 6 0 0 1 6 -6ZM9 4.5h6a4.5 4.5 0 0 1 4.5 4.5v6a4.5 4.5 0 0 1 -4.5 4.5h-6a4.5 4.5 0 0 1 -4.5 -4.5v-6a4.5 4.5 0 0 1 4.5 -4.5ZM9 6.3h6a2.7 2.7 0 0 1 2.7 2.7v6a2.7 2.7 0 0 1 -2.7 2.7h-6a2.7 2.7 0 0 1 -2.7 -2.7v-6a2.7 2.7 0 0 1 2.7 -2.7ZM8.4 12a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0ZM10.1 12a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0ZM14.85 8.1a1.05 1.05 0 1 0 2.1 0a1.05 1.05 0 1 0 -2.1 0Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-full">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" className="size-full">
      <path d="M2.5 0h19a2.5 2.5 0 0 1 2.5 2.5v19a2.5 2.5 0 0 1 -2.5 2.5h-19a2.5 2.5 0 0 1 -2.5 -2.5v-19a2.5 2.5 0 0 1 2.5 -2.5ZM15.45 6.577h1.84l-4.02 4.595L18 17.423h-3.703l-2.9 -3.792 -3.319 3.792H6.237l4.3 -4.915L6 6.577h3.797l2.622 3.466ZM14.805 16.322h1.02L9.243 7.62H8.149Z" />
    </svg>
  ),
};

/** Scales a single line of text so it spans its container's full width. */
function FitText({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const fit = () => {
      el.style.fontSize = "100px";
      el.style.fontSize = `${(100 * parent.clientWidth) / el.scrollWidth}px`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    document.fonts.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  return (
    // Close to the fitted size of the wordmark, so there is no visible jump before hydration.
    <span ref={ref} className={`inline-block whitespace-nowrap text-[11.5vw] md:text-[9.1vw] lg:text-[10vw] ${className}`}>
      {children}
    </span>
  );
}

// The site's link underline (draws in from the left on hover).
const LINK = `w-fit ${UNDERLINE_SELF} focus-visible:outline-2 focus-visible:outline-offset-2`;

// Site-wide (rendered by the root layout). Curtain reveal: the footer sticks to the viewport bottom
// *behind* each page's <main> (z-10, solid background), so scrolling the last section away uncovers it.
// It's black, so it opts into the navbar's media theme.
export function Footer() {
  const root = useRef<HTMLElement>(null);
  // The layout persists across navigations, so rebuild against each page's <main>.
  const pathname = usePathname();
  // Case studies end in their "Keep scrolling" handoff to the next project, so they have no footer.
  const hidden = /^\/work\/[^/]+/.test(pathname);

  useGSAP(
    () => {
      const footer = root.current;
      if (!footer) return;
      // The footer itself is sticky (unreliable to measure), so drive the reveal from <main>'s bottom edge.
      const main = document.querySelector("main");
      if (!main) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // Bottom row and rule come in first (the curtain uncovers the bottom edge first), then the
      // wordmark grows up from below while its letters rise out of their mask.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: main,
              start: "bottom bottom",
              end: () => `+=${footer.offsetHeight}`,
              scrub: true,
              // No invalidateOnRefresh: the values are static, and invalidating drops the from-state of
              // staggered tweens that haven't started yet (later letters would sit fully risen).
            },
          })
          .from(q("[data-footer-item]"), { y: 40, autoAlpha: 0, stagger: 0.06, duration: 0.4, ease: "power2.out", force3D: true }, 0)
          .from(q("[data-footer-rule]"), { scaleX: 0, duration: 0.5, ease: "power2.out" }, 0)
          .from(q("[data-footer-mark]"), { scale: 0.82, yPercent: 18, transformOrigin: "50% 100%", duration: 1, ease: "none", force3D: true }, 0)
          // Stagger by total amount, so any brand name length finishes rising ~70% into the reveal.
          .from(q("[data-footer-rise]"), { yPercent: 110, stagger: { amount: 0.35 }, duration: 0.35, ease: "power2.out", force3D: true }, 0);
      });

      // "Contact Us" pill trails the cursor over the wordmark; black on black, so it only shows where it cuts the letters.
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const link = q("[data-footer-link]")[0] as HTMLAnchorElement;
        const pill = q("[data-footer-pill]")[0];
        const pillBg = q("[data-footer-pill-bg]")[0];
        const track = q("[data-footer-pill-track]")[0];

        gsap.set(pill, { xPercent: -50, yPercent: -50, scale: 0.4, autoAlpha: 0 });
        const xTo = gsap.quickTo(pill, "x", { duration: 0.55, ease: "power3.out" });
        const yTo = gsap.quickTo(pill, "y", { duration: 0.55, ease: "power3.out" });
        const stretchTo = gsap.quickTo(pillBg, "scaleX", { duration: 0.35, ease: "power3.out" });
        const marquee = gsap.to(track, { xPercent: -50, duration: 3.5, ease: "none", repeat: -1, paused: true });

        // Stretch the background (not the text) with horizontal speed, so the pill smears as it trails.
        let lastX = 0;
        const stretch = () => {
          const x = gsap.getProperty(pill, "x") as number;
          const speed = Math.abs(x - lastX) / gsap.ticker.deltaRatio();
          lastX = x;
          stretchTo(1 + gsap.utils.clamp(0, 0.8, speed / 30));
        };

        const point = (e: PointerEvent) => {
          const r = footer.getBoundingClientRect();
          return [e.clientX - r.left, e.clientY - r.top];
        };
        const onMove = (e: PointerEvent) => {
          const [x, y] = point(e);
          xTo(x);
          yTo(y);
        };
        const onEnter = (e: PointerEvent) => {
          const [x, y] = point(e);
          xTo(x, x);
          yTo(y, y);
          lastX = x;
          marquee.play();
          gsap.ticker.add(stretch);
          gsap.to(pill, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        };
        const onLeave = () => {
          gsap.ticker.remove(stretch);
          stretchTo(1);
          gsap.to(pill, { autoAlpha: 0, scale: 0.4, duration: 0.3, ease: "power2.in", overwrite: "auto", onComplete: () => marquee.pause() });
        };

        link.addEventListener("pointerenter", onEnter);
        link.addEventListener("pointermove", onMove);
        link.addEventListener("pointerleave", onLeave);
        return () => {
          gsap.ticker.remove(stretch);
          link.removeEventListener("pointerenter", onEnter);
          link.removeEventListener("pointermove", onMove);
          link.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  if (hidden) return null;

  return (
    <footer
      ref={root}
      data-nav-theme="media"
      className="sticky bottom-0 z-0 flex w-full flex-col overflow-hidden bg-tiny-black text-tiny-white md:h-svh"
    >
      <div className="mx-auto flex w-full max-w-[120rem] flex-1 flex-col px-gutter">
        {/* Wordmark, centred in the space above the rule (the top padding clears the floating nav) */}
        <div className="flex flex-1 items-center justify-center pb-12 pt-28 md:pb-[clamp(40px,7svh,72px)] md:pt-[clamp(96px,16svh,180px)]">
          <div data-footer-mark="" className="w-full will-change-transform md:w-[85%]">
            <a
              data-footer-link=""
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label="Contact us"
              className="block focus-visible:outline-2 focus-visible:outline-offset-8"
            >
              <span className="block w-full overflow-hidden">
                {/* The tight leading keeps the rise mask snug below; Sora's ascenders (~0.78em) need the top padding */}
                <FitText className="pt-[0.2em] font-footer font-extrabold leading-[0.82] tracking-tight-6">
                  {/* Spaces stay plain text: a space alone in an inline-block collapses to zero width */}
                  {BRAND_NAME.split("").map((char, i) =>
                    char === " " ? (
                      " "
                    ) : (
                      <span key={i} data-footer-rise="" className="inline-block">
                        {char}
                      </span>
                    ),
                  )}
                </FitText>
              </span>
            </a>
          </div>
        </div>

        <div data-footer-rule="" aria-hidden="true" className="h-px w-full bg-tiny-white/65" />

        {/* Socials · links · contact, as one row on desktop and centred stacks on mobile; small Sora print */}
        <div className="grid justify-items-center gap-7 pb-10 pt-8 font-footer text-[0.8125rem] leading-[1.6] md:grid-cols-[1fr_auto_1fr] md:items-center md:justify-items-stretch md:px-[5%] md:pb-[clamp(40px,10svh,96px)] md:pt-10">
          <ul data-footer-item="" className="flex items-center gap-8">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-label={link.label}
                  className="block size-7 transition-opacity duration-300 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {SOCIAL_ICONS[link.label]}
                </a>
              </li>
            ))}
          </ul>

          <nav data-footer-item="" aria-label="Footer" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={`whitespace-nowrap ${LINK}`}>
                {link.label}
              </a>
            ))}
          </nav>

          <div data-footer-item="" className="flex flex-col items-center text-xs leading-[1.6] md:items-end">
            <p>Let&rsquo;s win together</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      {/* Cursor pill, positioned by GSAP; the background layer stretches separately so the text stays crisp */}
      <div data-footer-pill="" aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 z-20">
        <div data-footer-pill-bg="" className="absolute inset-0 rounded-full bg-tiny-black" />
        <div className="relative flex h-9 w-34 items-center overflow-hidden rounded-full font-footer text-[0.8125rem]">
          <div data-footer-pill-track="" className="flex w-max">
            {[0, 1].map((half) => (
              <span key={half} className="flex shrink-0">
                <span className="whitespace-nowrap pl-4">{PILL_LABEL}</span>
                <span className="whitespace-nowrap pl-4">{PILL_LABEL}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Click empty footer space to stamp a sticker */}
      <StickerStamps />
    </footer>
  );
}
