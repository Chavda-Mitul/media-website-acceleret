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
/** Phones: px the strip glides sideways per px of page scroll, once it's fully in view. */
const GLIDE = 0.5;

// Text colours are inherited from the root (never set per element), so each theme is one class on the root.
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

      // Phones: once the strip is fully in view it glides sideways as the page scrolls on (smoothed), and the
      // images drift in their frames. A swipe or keyboard glide still moves it; the scroll carries on from there.
      const glideWithScroll = () => {
        const setX = gsap.quickSetter(track, "x", "px");
        const scroll = { x: 0 }; // the scroll's share of the track's x
        let x = gsap.getProperty(track, "x") as number; // where the glide last put the track
        let own = x; // the visitor's share, on top of the scroll's
        const render = () => {
          // Hands off while a swipe, throw or keyboard glide moves the track.
          if (drag.isDragging || gsap.isTweening(track)) return;
          // Moved by something else since the last frame? Carry on from wherever it was left.
          const current = gsap.getProperty(track, "x") as number;
          if (Math.abs(current - x) > 0.5) own = current - scroll.x;
          // The ends are walls: what the scroll pushes past one is dropped, so the strip turns back at once.
          x = gsap.utils.clamp(drag.minX, drag.maxX, scroll.x + own);
          own = x - scroll.x;
          setX(x);
          parallax();
        };
        gsap.fromTo(
          scroll,
          { x: 0 },
          {
            // bottom bottom → bottom top is exactly one viewport of scroll.
            x: () => -window.innerHeight * GLIDE,
            ease: "none",
            invalidateOnRefresh: true,
            scrollTrigger: { trigger: track, start: "bottom bottom", end: "bottom top", scrub: 0.5 },
            onUpdate: render,
          },
        );
      };

      const mm = gsap.matchMedia();
      // matchMedia only runs the callback when at least one condition matches,
      // so isMobile/isDesktop together guarantee it runs at every width.
      mm.add(
        {
          isMobile: "(max-width: 767px)",
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isMobile, reduceMotion } = ctx.conditions as { isMobile: boolean; reduceMotion: boolean };
          if (reduceMotion) return;

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
          // On phones the strip is still below the fold when the title reveals, so its cards wait until it shows.
          gsap.from(q("[data-showcase-card]"), {
            autoAlpha: 0,
            x: 80,
            duration: 1.1,
            ease: EASE_REVEAL,
            stagger: 0.07,
            delay: isMobile ? 0 : 0.15,
            force3D: true,
            scrollTrigger: isMobile
              ? { trigger: track, start: "top 90%", toggleActions: "play none none reverse" }
              : trigger,
          });
          if (isMobile) glideWithScroll();
        },
      );

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
      // The navbar switches to its frosted-white pills over this section.
      data-nav-theme={dark ? "media" : undefined}
      className={`relative flex w-full flex-col overflow-hidden md:h-screen ${
        dark ? "bg-tiny-black text-tiny-white" : "bg-tiny-white text-tiny-black"
      }`}
    >
      {/* Both themes open the same way: breathing room, a full-bleed hairline, then the title row. */}
      <div className="shrink-0 px-gutter pt-10 md:pt-[clamp(72px,12vh,136px)]">
        <div aria-hidden="true" className="relative left-1/2 h-px w-dvw max-w-none -translate-x-1/2 bg-current/10" />
        <div className="mt-5 flex flex-col items-start gap-3 md:mt-[clamp(20px,3vh,31px)] md:flex-row md:justify-between md:gap-8">
          <h2 data-showcase-lines="" className="font-serif text-statement font-normal">
            {showcase.heading}
          </h2>
          <p
            data-showcase-lines=""
            className="w-full pe-12 font-serif text-serif-sm tracking-tight-1 md:max-w-102 md:pe-0"
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
        <div ref={trackRef} className="relative flex w-max items-start gap-5.5 px-gutter will-change-transform">
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
              <h3 className="mt-3 text-sub-2 tracking-tight-2 md:mt-4.5 md:text-sub-1">{item.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
