"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { BRAND_NAME, CONTACT_EMAIL, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/navigation";
import { StickerStamps } from "@/components/ui/StickerStamps";

const SHIPYARD_LOGO = "/assets/logos/shipyard-logo.svg";

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
    // ~27vw is close to the fitted size, so there is no visible jump before hydration.
    <span ref={ref} className={`inline-block whitespace-nowrap text-[27vw] ${className}`}>
      {children}
    </span>
  );
}

// Animated underline (draws in from the left on hover); position/thickness set per use.
const UNDERLINE =
  "relative w-fit after:absolute after:left-0 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-[scale] after:duration-500 after:ease-out-cubic hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2";
const LINK = `${UNDERLINE} after:-bottom-0.5 after:h-px`;

// Curtain reveal: the footer sticks to the viewport bottom *behind* <main> (z-10, white), so
// scrolling the last section away uncovers it. White background, so no navbar theme marker needed.
export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const footer = root.current!;
      // The footer itself is sticky (unreliable to measure), so drive the reveal from <main>'s bottom edge.
      const main = footer.previousElementSibling;
      if (!main) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: main,
              start: "bottom bottom",
              end: () => `+=${footer.offsetHeight}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .from(q("[data-footer-item]"), { y: 60, autoAlpha: 0, stagger: 0.06, duration: 0.5, ease: "power2.out", force3D: true }, 0)
          .from(q("[data-footer-mark]"), { yPercent: 35, duration: 1, ease: "none", force3D: true }, 0);
      });
    },
    { scope: root },
  );

  return (
    <footer
      ref={root}
      className="sticky bottom-0 z-0 flex w-full flex-col overflow-hidden bg-tiny-white text-tiny-black md:h-svh"
    >
      <div className="mx-auto w-full max-w-[120rem] px-4 pt-5 md:px-section-x md:pt-[clamp(20px,4svh,32px)]">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div data-footer-item="" className="font-display text-[1.5rem] font-semibold leading-none tracking-tight-5 md:text-[2.5rem]">
            <p className="text-tiny-black/20">Let&rsquo;s win together</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className={`mt-1 block ${UNDERLINE} after:-bottom-1 after:h-[0.06em]`}>
              {CONTACT_EMAIL}
            </a>
          </div>

          <div data-footer-item="" className="grid grid-cols-2 gap-x-4 text-cap-1 capitalize leading-[1.2] tracking-tight-1 md:flex md:items-start">
            <div className="md:ml-21 md:w-[4.5rem]">
              <p className="whitespace-nowrap text-tiny-black/50">{BRAND_NAME}</p>
              <nav aria-label="Footer" className="mt-[0.335rem] flex flex-col items-start gap-1 md:mt-5.75">
                {FOOTER_LINKS.map((link) => (
                  <a key={link.label} href={link.href} className={`whitespace-nowrap ${LINK}`}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="md:ml-25.75">
              <p className="whitespace-nowrap text-tiny-black/50">Connect on</p>
              <ul className="mt-[0.335rem] flex flex-col gap-2 md:mt-5.75">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={`whitespace-nowrap ${LINK}`}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Flexible gap keeps the footer exactly one viewport tall on desktop */}
      <div aria-hidden="true" className="h-40 md:h-auto md:min-h-10 md:flex-1" />

      <div data-footer-mark="" className="px-4 pb-5 will-change-transform">
        {/* Shipyard mark (placeholder): its SVG uses currentColor, so render it as a black mask */}
        <span
          role="img"
          aria-label="Shipyard"
          className="mb-[1.2vw] block aspect-[250.513/62.0609] w-[21.5vw] bg-tiny-black [mask:var(--logo)_left/contain_no-repeat]"
          style={{ "--logo": `url(${SHIPYARD_LOGO})` } as CSSProperties}
        />
        <p className="w-full overflow-hidden">
          <FitText className="font-display font-semibold uppercase leading-[0.74] tracking-tight-5">{BRAND_NAME}</FitText>
        </p>
      </div>

      {/* Click empty footer space to stamp a sticker */}
      <StickerStamps />
    </footer>
  );
}
