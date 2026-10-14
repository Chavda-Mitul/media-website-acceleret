"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { gsap, Draggable, SplitText, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { SHOWCASES } from "@/lib/content/showcases";

type Theme = "light" | "dark";

/** Image overscan on each side for the horizontal parallax (fraction of the frame width). */
const PARALLAX = 0.1;
/** Title block under each desktop card: 18px margin + 21.6px line. */
const TITLE_BLOCK = 40;

export function CategoryShowcase({ theme }: { theme: Theme }) {
  const showcase = theme === "light" ? SHOWCASES.vital : SHOWCASES.futureProof;
  const dark = theme === "dark";
  const root = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const row = rowRef.current!;
      const track = trackRef.current!;
      const q = gsap.utils.selector(root);
      const media = q<HTMLElement>("[data-showcase-media]");
      // xPercent is relative to the media element, which is (1 + 2·PARALLAX) × the frame width.
      const maxShift = (PARALLAX / (1 + 2 * PARALLAX)) * 100;
      const setMediaX = media.map((el) => gsap.quickSetter(el, "xPercent"));
      gsap.set(media, { force3D: true });

      // Desktop cards are sized in CSS from --card-h: whatever height the row has left.
      const sizeCards = () => {
        const padBottom = parseFloat(getComputedStyle(row).paddingBottom);
        track.style.setProperty("--card-h", `${Math.max(0, row.clientHeight - padBottom - TITLE_BLOCK)}px`);
      };

      // Each image drifts against its card's offset from the viewport centre.
      const parallax = () => {
        const vw = window.innerWidth;
        media.forEach((el, i) => {
          const frame = el.parentElement!.getBoundingClientRect();
          const offset = gsap.utils.clamp(-1, 1, (frame.left + frame.width / 2 - vw / 2) / vw);
          setMediaX[i](-offset * maxShift);
        });
      };

      const [drag] = Draggable.create(track, {
        type: "x",
        bounds: row,
        inertia: true,
        edgeResistance: 0.85,
        // Vertical swipes keep scrolling the page natively.
        allowNativeTouchScrolling: true,
        dragClickables: true,
        zIndexBoost: false,
        onDrag: parallax,
        onThrowUpdate: parallax,
      });

      const refresh = () => {
        sizeCards();
        drag.applyBounds(row);
        parallax();
      };
      const ro = new ResizeObserver(refresh);
      ro.observe(row);
      refresh();

      // Keyboard: bring a focused card into view by gliding the track (the row clips, never scrolls).
      const onFocusIn = (event: FocusEvent) => {
        const card = (event.target as HTMLElement).closest<HTMLElement>("[data-showcase-card]");
        if (!card) return;
        const padLeft = parseFloat(getComputedStyle(track).paddingLeft);
        const x = gsap.utils.clamp(drag.minX, drag.maxX, -(card.offsetLeft - padLeft));
        gsap.to(track, {
          x,
          duration: 0.6,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => {
            drag.update();
            parallax();
          },
        });
      };
      row.addEventListener("focusin", onFocusIn);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const trigger = { trigger: root.current, start: "top 75%", toggleActions: "play none none reverse" };
        q<HTMLElement>("[data-showcase-lines]").forEach((el, i) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1,
                ease: EASE_REVEAL,
                stagger: 0.08,
                delay: i * 0.12,
                force3D: true,
                scrollTrigger: trigger,
              }),
          });
        });
        gsap.from(q("[data-showcase-card]"), {
          autoAlpha: 0,
          x: 80,
          duration: 1.1,
          ease: EASE_REVEAL,
          stagger: 0.07,
          delay: 0.15,
          force3D: true,
          scrollTrigger: trigger,
        });
      });

      return () => {
        ro.disconnect();
        row.removeEventListener("focusin", onFocusIn);
        drag.kill();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label={showcase.heading}
      // Dark theme: the navbar switches to its frosted-white pills over this section.
      data-nav-theme={dark ? "media" : undefined}
      className={`relative flex w-full flex-col overflow-hidden md:h-screen ${
        dark ? "bg-tiny-black text-tiny-white" : "bg-tiny-white text-tiny-black"
      }`}
    >
      <div className={`shrink-0 px-6 md:px-section-x ${dark ? "pt-10 md:pt-[clamp(72px,12vh,136px)]" : ""}`}>
        {dark && <div aria-hidden="true" className="relative left-1/2 h-px w-dvw max-w-none -translate-x-1/2 bg-white/10" />}
        <div className="mt-5 flex flex-col items-start gap-3 md:mt-[clamp(20px,3vh,31px)] md:flex-row md:justify-between md:gap-8">
          <h2 data-showcase-lines="" className="font-display text-showcase font-semibold uppercase">
            {showcase.heading}
          </h2>
          <p
            data-showcase-lines=""
            className="w-full pe-12 font-serif text-[0.875rem] leading-[1.3] tracking-tight-2 md:max-w-102 md:pe-0 md:text-[1.25rem]"
          >
            {showcase.body}
          </p>
        </div>
      </div>

      {/* Drag carousel: the row clips, the track is dragged (with inertia) by GSAP Draggable */}
      <div
        ref={rowRef}
        role="region"
        aria-label={`${showcase.heading} projects`}
        className="mt-14 flex min-h-0 grow select-none items-start overflow-x-clip pb-[calc(env(safe-area-inset-bottom)+6rem)] md:mt-[clamp(40px,9vh,110px)] md:pb-35.75"
      >
        <div ref={trackRef} className="relative flex w-max items-start gap-5.5 px-6 will-change-transform md:px-section-x">
          {showcase.items.map((item) => (
            <a
              key={item.name}
              href={item.href}
              data-showcase-card=""
              draggable={false}
              className="group relative shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
              style={{ "--ar": item.aspect } as CSSProperties}
            >
              {/* Desktop: width = card height × aspect; hover grows the frame taller (reference: 531 → 577px) */}
              <div className="relative aspect-[208/270] w-52 overflow-hidden rounded-[0.2rem] bg-tiny-gray md:aspect-auto md:h-(--card-h) md:w-[calc(var(--card-h)*var(--ar))] md:rounded-lg md:transition-[height] md:duration-500 md:ease-out-cubic md:group-hover:h-[calc(var(--card-h)*1.087)]">
                <div data-showcase-media="" className="absolute inset-y-0 -left-[10%] -right-[10%] will-change-transform">
                  <Image
                    src={item.image}
                    // Decorative: the card's <h3> already names the link.
                    alt=""
                    fill
                    draggable={false}
                    sizes="(min-width: 768px) 60vw, 260px"
                    className="pointer-events-none object-cover"
                  />
                </div>
              </div>
              <h3 className="mt-3 text-[1rem] leading-[1.2] tracking-tight-2 md:mt-4.5 md:text-[1.125rem]">{item.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
