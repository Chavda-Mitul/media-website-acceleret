"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL, PAGE_REVEAL_OFFSET, hasInitialLoader, onIntroCue } from "@/lib/motion";
import { NAV_LINKS } from "@/lib/navigation";
import { ContactCard } from "@/components/ui/ContactCard";
import { LatestWinsDrawer } from "@/components/ui/LatestWinsDrawer";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "@/components/ui/MobileMenu";

const PILL = "rounded-sm backdrop-blur-[42px] transition-colors duration-300";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2";
/** Scroll distance (px) before the header starts hiding on scroll-down. */
const HIDE_AFTER = 80;
/** Line under the header used to detect which section it overlaps (pill height + top offset). */
const HEADER_LINE = "64px";
/** Scrolling this far (px) with the Contact card open closes it. */
const CONTACT_CLOSE_SCROLL = 80;

export function Navbar() {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();
  // Inner pages dim every link but the current one (as on the reference); the homepage shows all at full strength.
  const isInnerPage = pathname !== "/";
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [winsOpen, setWinsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactButtonRef = useRef<HTMLButtonElement>(null);
  const contactOpenedAt = useRef(0);
  // True while a [data-nav-theme="media"] element (video/imagery) sits under the header.
  const [onMedia, setOnMedia] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeWins = useCallback(() => setWinsOpen(false), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const lenis = useLenis();

  // Sections opt in with data-nav-theme="media"; the pills switch to frosted white there
  // so black text stays legible over any video frame.
  useGSAP(
    () => {
      const active = new Set<Element>();
      document.querySelectorAll('[data-nav-theme="media"]').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: `top ${HEADER_LINE}`,
          end: `bottom ${HEADER_LINE}`,
          onToggle: (self) => {
            if (self.isActive) active.add(el);
            else active.delete(el);
            setOnMedia(active.size > 0);
          },
        });
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  const pillBg = onMedia ? "bg-white/70" : "bg-tiny-pill";
  const pillHover = onMedia ? "hover:bg-white/90" : "hover:bg-tiny-pill-hover";

  // Hide on scroll down, reveal on scroll up (direction is 0 while idle, which keeps the current state).
  useLenis(
    ({ scroll, direction }) => {
      if (scroll <= HIDE_AFTER) setHidden(false);
      else if (direction === 1) setHidden(true);
      else if (direction === -1) setHidden(false);
      if (contactOpen && Math.abs(scroll - contactOpenedAt.current) > CONTACT_CLOSE_SCROLL) setContactOpen(false);
    },
    [contactOpen],
  );

  const toggleContact = () => {
    contactOpenedAt.current = lenis?.scroll ?? window.scrollY;
    setContactOpen((open) => !open);
  };

  useGSAP(
    (_context, contextSafe) => {
      const mm = gsap.matchMedia();
      // Reduced motion is handled in CSS ([data-nav-inner] stays visible).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (hasInitialLoader()) {
          // As on the reference: the pill appears centred while the loader docks the logo into it,
          // then slides into its corner as the hero reveals.
          const offNav = onIntroCue(
            "nav",
            contextSafe!(() => {
              const pill = root.current!.querySelector("[data-nav-pill]")!.getBoundingClientRect();
              gsap.set("[data-nav-pill]", { x: window.innerWidth / 2 - (pill.left + pill.width / 2) });
              gsap.set("[data-nav-logo]", { autoAlpha: 0 });
              gsap.set("[data-nav-wins]", { xPercent: 150, autoAlpha: 0 });
              gsap.set("[data-nav-inner]", { autoAlpha: 1 });
              gsap.fromTo("[data-nav-pill]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
              gsap.from("[data-nav-item]", { autoAlpha: 0, duration: 0.4, ease: "power2.out", stagger: 0.06, delay: 0.55 });
            }),
          );
          const offPage = onIntroCue(
            "page",
            contextSafe!(() => {
              // The loader's flying logo sits exactly here and is hidden in this same tick.
              gsap.set("[data-nav-logo]", { autoAlpha: 1 });
              const slide = { duration: 0.64, ease: "power3.inOut", delay: PAGE_REVEAL_OFFSET };
              gsap.to("[data-nav-pill]", { x: 0, ...slide });
              gsap.to("[data-nav-wins]", { xPercent: 0, autoAlpha: 1, ...slide });
            }),
          );
          return () => {
            offNav();
            offPage();
          };
        }

        // Starts just after the Hero's first headline line so both read as one sequence.
        const intro = gsap
          .timeline({ paused: true, delay: PAGE_REVEAL_OFFSET + 0.25 })
          .fromTo(
            "[data-nav-inner]",
            { yPercent: -120, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 1, ease: EASE_REVEAL },
          )
          .from("[data-nav-logo], [data-nav-item], [data-nav-wins]", {
            y: -8,
            autoAlpha: 0,
            duration: 0.8,
            ease: EASE_REVEAL,
            stagger: 0.04,
          }, "-=0.7");

        return onIntroCue("page", () => intro.play());
      });
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className={`fixed inset-x-0 top-0 z-header transition-transform duration-300 ease-in-out focus-within:translate-y-0 ${
        hidden && !menuOpen && !contactOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div data-nav-inner="" className="flex w-full items-start justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
        <nav
          data-nav-pill=""
          aria-label="Main navigation"
          className={`${PILL} ${pillBg} flex h-10 min-w-0 items-center gap-3 overflow-hidden py-2 pl-2.5 pr-3 sm:h-12 sm:gap-7 sm:py-[9px] sm:pl-[10px] sm:pr-[18px]`}
        >
          {/* InitialLoader measures this to land its flying logo. */}
          <div data-nav-logo="">
            <Logo />
          </div>

          <ul className="hidden items-center gap-8 text-cap-1 leading-5 font-medium tracking-tight-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label} data-nav-item="">
                {link.label === "Contact" ? (
                  <button
                    ref={contactButtonRef}
                    type="button"
                    onClick={toggleContact}
                    aria-expanded={contactOpen}
                    aria-controls="contact-card"
                    className={`cursor-pointer transition-opacity duration-200 hover:opacity-60 ${isInnerPage ? "opacity-30" : ""} ${FOCUS}`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    href={link.href}
                    aria-current={link.href === pathname ? "page" : undefined}
                    className={`transition-opacity duration-200 hover:opacity-60 ${
                      isInnerPage && link.href !== pathname ? "opacity-30" : ""
                    } ${FOCUS}`}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <button
            type="button"
            data-nav-item=""
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={`flex h-7 w-7 flex-col items-center justify-center gap-1 sm:h-8 sm:w-8 md:hidden ${FOCUS}`}
          >
            <span className="h-[1.5px] w-3.5 bg-current sm:w-4" />
            <span className="h-[1.5px] w-3.5 bg-current sm:w-4" />
          </button>
        </nav>

        <button
          type="button"
          data-nav-wins=""
          onClick={() => setWinsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={winsOpen}
          className={`${PILL} ${pillBg} ${pillHover} relative flex h-10 shrink-0 cursor-pointer items-center justify-center px-2.5 sm:h-12 sm:w-[114px] sm:px-0 ${FOCUS}`}
        >
          <span className="text-cap-2 leading-5 font-medium tracking-tight-1 sm:text-cap-1">Latest Wins</span>
          <span aria-hidden="true" className="absolute right-2 top-2 size-[7px] rounded-full bg-red-500" />
        </button>
      </div>

      <ContactCard open={contactOpen} onClose={closeContact} triggerRef={contactButtonRef} />
      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <LatestWinsDrawer open={winsOpen} onClose={closeWins} />
    </header>
  );
}
