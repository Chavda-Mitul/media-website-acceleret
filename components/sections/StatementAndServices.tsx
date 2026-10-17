"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { SERVICES, STATEMENT } from "@/lib/content/services";
import { LogoGrid } from "@/components/ui/LogoGrid";
import { SectionLabel } from "@/components/ui/SectionLabel";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Fraction of the pinned scroll used to step through the services; the rest holds the last one. */
const STEP_SPAN = 0.9;
/** Space opened above the active service once the list has scrolled past the first one. */
const ROW_GAP_PX = 24;
/** Services further than this above the active one fade out completely. */
const FADE_AFTER = 3;

const activeForProgress = (progress: number) =>
  Math.min(SERVICES.length - 1, Math.floor((progress / STEP_SPAN) * SERVICES.length));

/** List offset that brings service `index` level with the "Our services" label. offsetTop ignores the gap transform. */
function listOffset(list: HTMLElement, index: number) {
  const [first, second] = list.children as HTMLCollectionOf<HTMLElement>;
  const pitch = second.offsetTop - first.offsetTop;
  return -(index * pitch + (index > 0 ? ROW_GAP_PX : 0));
}

function serviceTone(index: number, active: number) {
  if (index === active) return "text-tiny-black";
  if (active - index > FADE_AFTER) return "text-transparent";
  return "text-tiny-faint hover:text-tiny-black/40";
}

const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/** Line-by-line masked reveal; SplitText re-splits on resize/font load and re-creates the tween. */
function revealStatement(el: HTMLElement) {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: EASE_REVEAL,
        stagger: 0.08,
        force3D: true,
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
      }),
  });
}

function Statement({ indent = false, className = "" }: { indent?: boolean; className?: string }) {
  return (
    <h2 data-statement="" className={`font-serif text-statement font-normal text-pretty ${className}`}>
      {/* Desktop: the first line starts on the services column below (where the numbers begin): the services
          grid's first column (1fr of its 5fr, after three 24px gaps and the 233px image) plus one gap. Keep in
          step with that grid. A spacer, not text-indent: SplitText's word boxes would inherit the indent. */}
      {indent && <span aria-hidden="true" className="inline-block w-[calc((100%-4.5rem-14.5625rem)/5+1.5rem)]" />}
      {STATEMENT}
    </h2>
  );
}

function SubServices({ subs }: { subs: string[] }) {
  return subs.map((sub) => (
    <li key={sub} className="overflow-hidden">
      <span data-sub-line="" className="block">
        {sub}
      </span>
    </li>
  ));
}

// --- Desktop: pinned, scroll-driven, services clickable ---------------------------

function DesktopStatementServices() {
  const root = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const firstRender = useRef(true);
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const lenis = useLenis();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        triggerRef.current = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => setActive(activeForProgress(self.progress)),
          // The service size is fluid, so re-measure the row pitch on resize.
          onRefresh: () => {
            if (listRef.current) gsap.set(listRef.current, { y: listOffset(listRef.current, activeRef.current) });
          },
        });
        return () => {
          triggerRef.current = null;
        };
      });

      mm.add(`(min-width: 768px) and (prefers-reduced-motion: no-preference)`, () => {
        revealStatement(q<HTMLElement>("[data-statement]")[0]);
        gsap.from(q("[data-service-row]"), {
          yPercent: 110,
          duration: 0.9,
          ease: EASE_REVEAL,
          stagger: 0.05,
          force3D: true,
          scrollTrigger: { trigger: q("[data-services]")[0], start: "top 95%", toggleActions: "play none none reverse" },
        });
      });
    },
    { scope: root },
  );

  // Active service: scroll the list so it sits level with the label, clip-reveal its image
  // (stacked over the previous ones) and swap the sub-services.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const instant = firstRender.current || prefersReducedMotion();
      firstRender.current = false;
      activeRef.current = active;

      if (listRef.current) {
        gsap.to(listRef.current, {
          y: listOffset(listRef.current, active),
          duration: instant ? 0 : 0.4,
          ease: "power2.out",
          overwrite: true,
        });
      }

      q("[data-service-image]").forEach((el, i) => {
        const open = i <= active;
        gsap.to(el, { "--reveal": open ? 0 : 50, duration: instant ? 0 : 0.9, ease: EASE_REVEAL, overwrite: true });
        if (open && i === active && !instant) {
          gsap.fromTo(el.firstElementChild, { scale: 1.15 }, { scale: 1, duration: 1.2, ease: EASE_REVEAL, force3D: true });
        }
      });

      q("[data-sub-layer]").forEach((layer, i) => {
        if (i === active) {
          // overwrite: a fade-out started a step earlier (fast scroll / click jump) must not win.
          gsap.set(layer, { autoAlpha: 1, overwrite: true });
          gsap.fromTo(
            layer.querySelectorAll("[data-sub-line]"),
            { yPercent: instant ? 0 : 110 },
            { yPercent: 0, duration: instant ? 0 : 0.7, ease: EASE_REVEAL, stagger: 0.04, overwrite: true, force3D: true },
          );
        } else {
          gsap.to(layer, { autoAlpha: 0, duration: instant ? 0 : 0.2, overwrite: true });
        }
      });
    },
    { dependencies: [active], scope: root },
  );

  // Clicking a service scrolls to the point in the pinned range where it becomes active.
  const goTo = (index: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const progress = ((index + 0.5) / SERVICES.length) * STEP_SPAN;
    const target = st.start + progress * (st.end - st.start);
    if (lenis) lenis.scrollTo(target, { duration: 1.2, immediate: prefersReducedMotion() });
    else window.scrollTo({ top: target });
  };

  return (
    <div ref={root} className="relative hidden h-[370vh] md:block">
      <section
        aria-label="Brand statement and services"
        className="sticky top-0 flex h-screen w-full flex-col overflow-hidden bg-tiny-white"
      >
        {/* Hairlines (ink/10) above and below the statement, as everywhere on the page. Opaque and on top,
            so the service rows that scroll up past the active one slide under the statement, not over it. */}
        <div className="relative z-10 flex-1 border-t border-tiny-black/10 bg-tiny-white px-gutter">
          <Statement indent className="mt-10" />
        </div>

        <div className="w-full shrink-0 border-t border-tiny-black/10" />

        <div data-services="" className="shrink-0 px-gutter pb-8 pt-2.5">
          <div className="grid grid-cols-[1fr_3fr_14.5625rem_1fr] items-start gap-x-6">
            <SectionLabel>Our services</SectionLabel>

            <ol ref={listRef} className="flex flex-col will-change-transform">
              {SERVICES.map((service, i) => (
                <li
                  key={service.name}
                  className="overflow-hidden"
                  style={active > 0 && i >= active ? { transform: `translateY(${ROW_GAP_PX}px)` } : undefined}
                >
                  <button
                    type="button"
                    data-service-row=""
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "true" : undefined}
                    className={`grid grid-cols-[0.6em_auto] gap-x-[35px] text-left font-display text-display-3 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 ${serviceTone(i, active)}`}
                  >
                    <span>{i + 1}</span>
                    <span className="whitespace-nowrap">{service.name}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="relative h-70 w-58.25 overflow-hidden rounded-lg bg-tiny-black/5">
              {SERVICES.map((service, i) => (
                <div
                  key={service.name}
                  data-service-image=""
                  className={`absolute inset-0 overflow-hidden [clip-path:inset(calc(var(--reveal)*1%))] ${
                    i === 0 ? "[--reveal:0]" : "[--reveal:50]"
                  }`}
                >
                  <div className="absolute inset-0 will-change-transform">
                    <Image src={service.image} alt="" fill sizes="233px" className="object-cover" />
                  </div>
                </div>
              ))}
            </div>

            <div className="relative text-cap-2 capitalize tracking-tight-1">
              {SERVICES.map((service, i) => (
                <ul
                  key={service.name}
                  data-sub-layer=""
                  aria-hidden={i !== active}
                  aria-label={`${service.name} services`}
                  className={`absolute inset-x-0 top-0 flex flex-col gap-[3px] ${i === 0 ? "" : "invisible opacity-0"}`}
                >
                  <SubServices subs={service.subs} />
                </ul>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-gutter py-4">
          <LogoGrid />
        </div>
      </section>
    </div>
  );
}

// --- Mobile: tap-to-expand accordion -----------------------------------------------

function MobileStatementServices() {
  const root = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const [open, setOpen] = useState(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        revealStatement(q<HTMLElement>("[data-statement]")[0]);
      });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const instant = firstRender.current || prefersReducedMotion();
      firstRender.current = false;

      q("[data-acc-panel]").forEach((panel, i) => {
        const isOpen = i === open;
        gsap.to(panel, {
          height: isOpen ? "auto" : 0,
          duration: instant ? 0 : 0.5,
          ease: "power3.inOut",
          overwrite: true,
          // Page height changed: re-measure triggers further down.
          onComplete: isOpen && !instant ? () => ScrollTrigger.refresh() : undefined,
        });
        if (isOpen && !instant) {
          gsap.fromTo(
            panel.querySelectorAll("[data-sub-line]"),
            { yPercent: 110 },
            { yPercent: 0, duration: 0.6, ease: EASE_REVEAL, stagger: 0.04, delay: 0.1, force3D: true },
          );
        }
      });
    },
    { dependencies: [open], scope: root },
  );

  return (
    <section ref={root} aria-label="Brand statement and services" className="bg-tiny-white pb-12 md:hidden">
      <div className="mt-4 w-full border-t border-tiny-black/10" />
      <Statement className="px-gutter pt-4" />

      <div className="mt-18 px-gutter">
        <SectionLabel className="ml-14">Our services</SectionLabel>
        <ul className="-mx-gutter mt-1.75 border-t border-tiny-black/10 px-gutter pt-4">
          {SERVICES.map((service, i) => {
            const isOpen = i === open;
            return (
              <li key={service.name}>
                <button
                  type="button"
                  onClick={() => setOpen((current) => (current === i ? -1 : i))}
                  aria-expanded={isOpen}
                  aria-controls={`service-panel-${i}`}
                  className={`grid w-full grid-cols-[40px_minmax(0,1fr)] gap-x-4 py-2 text-left font-display text-display-3 font-semibold transition-colors duration-150 focus-visible:outline-2 ${
                    isOpen ? "text-tiny-black" : "text-tiny-faint"
                  }`}
                >
                  <span>{i + 1}</span>
                  <span>{service.name}</span>
                </button>
                <div
                  id={`service-panel-${i}`}
                  data-acc-panel=""
                  // Initial state only (the first service starts open); GSAP owns the height after that.
                  className={`overflow-hidden ${i === 0 ? "" : "h-0"}`}
                >
                  <ul className="ml-14 flex flex-col pb-6 pt-1 text-cap-2 capitalize tracking-tight-1">
                    <SubServices subs={service.subs} />
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-10 px-gutter">
        <LogoGrid />
      </div>
    </section>
  );
}

export function StatementAndServices() {
  return (
    <>
      <DesktopStatementServices />
      <MobileStatementServices />
    </>
  );
}
