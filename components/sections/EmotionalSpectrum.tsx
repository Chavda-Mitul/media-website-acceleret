"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { SPECTRUM } from "@/lib/content/spectrum";

const N = SPECTRUM.length;

// --- Layout engine -------------------------------------------------------------
// Sizes by distance from the focused card, measured on the reference at 1440×900
// (desktop) and 390×844 (mobile). `box` is the slot length along the scroll axis.
type SizeRow = { box: number; w: number; h: number; gap: number };

const SIZE_DESKTOP: SizeRow[] = [
  { box: 435, w: 435, h: 580, gap: 24 },
  { box: 296, w: 296, h: 342, gap: 24 },
  { box: 183, w: 183, h: 222, gap: 24 },
  { box: 170, w: 101, h: 125, gap: 18 },
  { box: 170, w: 56, h: 75, gap: 14 },
  { box: 170, w: 32, h: 24, gap: 14 },
];

const SIZE_MOBILE: SizeRow[] = [
  { box: 248, w: 340, h: 248, gap: 27 },
  { box: 116, w: 161, h: 116, gap: 27 },
  { box: 72, w: 86, h: 72, gap: 27 },
  { box: 36, w: 52, h: 36, gap: 27 },
  { box: 20, w: 32, h: 20, gap: 27 },
];

/** Ruler tick heights (px) by distance from the focus. */
const TICKS = [52, 36, 24, 16, 10, 7, 4];

/** Desktop stage height the size table was measured against. */
const DESKTOP_STAGE_H = 742;
/** Inset of the focused card from the stage edges at progress 0 / 1 (fraction of the scroll axis). */
const EDGE_PAD = 0.061;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Scroll progress held on the first / last card at each end of the pin, as on the reference. */
const EDGE_HOLD = 0.012;

/** Maps scroll progress in [0, 1] to a fractional focus index, linear between the end holds. */
function toIndex(progress: number) {
  return gsap.utils.clamp(0, 1, (progress - EDGE_HOLD) / (1 - 2 * EDGE_HOLD)) * (N - 1);
}

/** Inverse of `toIndex` for an integer card: the scroll progress at which card `k` settles in focus. */
function progressOf(k: number) {
  return k === 0 ? 0 : EDGE_HOLD + (k / (N - 1)) * (1 - 2 * EDGE_HOLD);
}

function lerpTable(table: SizeRow[], d: number): SizeRow {
  const i = Math.min(Math.floor(d), table.length - 1);
  const j = Math.min(i + 1, table.length - 1);
  const t = Math.min(d - i, 1);
  const a = table[i];
  const b = table[j];
  return { box: lerp(a.box, b.box, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), gap: lerp(a.gap, b.gap, t) };
}

function tickHeight(d: number) {
  const i = Math.min(Math.floor(d), TICKS.length - 1);
  const j = Math.min(i + 1, TICKS.length - 1);
  return lerp(TICKS[i], TICKS[j], Math.min(d - i, 1));
}

type Stage = { w: number; h: number; scale: number; vertical: boolean };

type Placement = { x: number; y: number; w: number; h: number; visible: boolean };

/**
 * Slot starts along the scroll axis with card `k` settled in focus: sizes by integer distance from `k`,
 * and the row shifted so the focused slot sits on a ramp from one edge inset (first card) to the other (last).
 */
function settledSlots(k: number, stage: Stage): number[] {
  const table = stage.vertical ? SIZE_MOBILE : SIZE_DESKTOP;
  const pos: number[] = [];
  let acc = 0;
  for (let i = 0; i < N; i++) {
    pos[i] = acc;
    if (i < N - 1) {
      const gapD = Math.min(Math.abs(i - k), Math.abs(i + 1 - k));
      acc += (lerpTable(table, Math.abs(i - k)).box + lerpTable(table, gapD).gap) * stage.scale;
    }
  }

  const axis = stage.vertical ? stage.h : stage.w;
  const pad = EDGE_PAD * axis;
  const target = pad + (k / (N - 1)) * (axis - 2 * pad - table[0].box * stage.scale);
  return pos.map((p) => p + target - pos[k]);
}

/**
 * Places every card for a fractional focus index `f`. Positions blend the two neighbouring settled
 * layouts, so every card moves one way only (never drifts back); sizes follow the distance from `f`.
 */
function layout(f: number, stage: Stage): Placement[] {
  const table = stage.vertical ? SIZE_MOBILE : SIZE_DESKTOP;
  const a = Math.min(Math.floor(f), N - 1);
  const b = Math.min(a + 1, N - 1);
  const from = settledSlots(a, stage);
  const to = settledSlots(b, stage);
  const axis = stage.vertical ? stage.h : stage.w;

  return Array.from({ length: N }, (_, i) => {
    const row = lerpTable(table, Math.abs(i - f));
    const w = row.w * stage.scale;
    const h = row.h * stage.scale;
    const box = row.box * stage.scale;
    const main = lerp(from[i], to[i], f - a);
    const visible = main + box > -box && main < axis + box;
    return stage.vertical
      ? { x: (stage.w - w) / 2, y: main, w, h, visible }
      : { x: main + (box - w) / 2, y: (stage.h - h) / 2, w, h, visible };
  });
}

// --- Component -----------------------------------------------------------------

export function EmotionalSpectrum() {
  const root = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const captionClientRef = useRef<HTMLSpanElement>(null);
  const captionEmotionRef = useRef<HTMLSpanElement>(null);

  // Read lazily by the snap, so Lenis arriving after mount never rebuilds the timelines.
  const lenis = useLenis();
  const lenisRef = useRef<Lenis | undefined>(undefined);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const cards = q<HTMLElement>("[data-card]");
      const media = q<HTMLElement>("[data-card-media]");
      const ticks = q<HTMLElement>("[data-tick]");
      const stageEl = stageRef.current!;
      const word = wordRef.current!;
      const caption = captionRef.current!;

      const mm = gsap.matchMedia();

      // All three conditions so the callback runs at every width (matchMedia needs one match).
      mm.add(
        {
          isMobile: "(max-width: 767px)",
          isDesktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isMobile, reduceMotion } = ctx.conditions as { isMobile: boolean; reduceMotion: boolean };
          const stage: Stage = { w: 0, h: 0, scale: 1, vertical: isMobile };
          let active = -1;
          let wordSwap: gsap.core.Timeline | undefined;

          // Cards keep a fixed base size (the focused card's) and are only ever moved and scaled,
          // so scrolling never triggers layout or image re-rasterisation — just GPU transforms.
          const base = { w: 0, h: 0 };

          const measure = () => {
            stage.w = stageEl.clientWidth;
            stage.h = stageEl.clientHeight;
            stage.scale = isMobile
              ? Math.min(stage.w / 390, stage.h / 560)
              : Math.min(stage.h / DESKTOP_STAGE_H, stage.w / 1000);
            const focus = (isMobile ? SIZE_MOBILE : SIZE_DESKTOP)[0];
            base.w = focus.w * stage.scale;
            base.h = focus.h * stage.scale;
            // Layout only changes here (on refresh/resize), never per frame.
            gsap.set(cards, { width: base.w, height: base.h });
          };

          gsap.set(cards, { transformOrigin: "0 0", force3D: true });
          gsap.set(media, { transformOrigin: "50% 50%", force3D: true });
          gsap.set(ticks, { transformOrigin: "50% 50%", force3D: true });
          gsap.set(caption, { force3D: true });

          // One "css" quickSetter per element writes the whole transform in a single render.
          const setCard = cards.map((el) => gsap.quickSetter(el, "css"));
          const setMedia = media.map((el) => gsap.quickSetter(el, "css"));
          const setTick = ticks.map((el) => gsap.quickSetter(el, "scaleY"));
          const setCaption = gsap.quickSetter(caption, "css");
          const shown: boolean[] = [];

          const setActive = (index: number) => {
            if (index === active) return;
            const first = active === -1;
            active = index;
            const { client, emotion } = SPECTRUM[index];
            const label = emotion.toLowerCase();

            captionClientRef.current!.textContent = client;
            captionEmotionRef.current!.textContent = emotion;

            wordSwap?.kill();
            if (first || reduceMotion) {
              word.textContent = label;
              gsap.set(word, { yPercent: 0 });
              return;
            }
            wordSwap = gsap
              .timeline()
              .to(word, { yPercent: -110, duration: 0.25, ease: "power2.in" })
              .call(() => {
                word.textContent = label;
              })
              .fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: EASE_REVEAL });
            gsap.fromTo(caption, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, overwrite: true });
          };

          const render = (progress: number) => {
            const f = toIndex(progress);
            const placements = layout(f, stage);

            placements.forEach((p, i) => {
              const sx = p.w / base.w;
              const sy = p.h / base.h;
              // Uniform cover: counter-scale the image so it is scaled by max(sx, sy) and cropped.
              const k = Math.max(sx, sy);
              setCard[i]({ x: p.x, y: p.y, scaleX: sx, scaleY: sy });
              setMedia[i]({ scaleX: k / sx, scaleY: k / sy });
              if (shown[i] !== p.visible) {
                shown[i] = p.visible;
                cards[i].style.visibility = p.visible ? "visible" : "hidden";
              }
            });

            ticks.forEach((_, i) => setTick[i](tickHeight(Math.abs(i - f)) / TICKS[0]));

            const index = Math.round(f);
            const focus = placements[index];
            setCaption({ x: focus.x, y: focus.y + focus.h });
            setActive(index);
          };

          // Once scrolling rests inside the pin, glide to the nearest card so one always settles in focus.
          // The glide's own per-frame updates keep re-arming the timer, which then finds nothing to do.
          let snapTimer: ReturnType<typeof setTimeout> | undefined;
          const scheduleSnap = (self: ScrollTrigger) => {
            if (reduceMotion || !lenisRef.current) return;
            clearTimeout(snapTimer);
            snapTimer = setTimeout(() => {
              const lenis = lenisRef.current;
              if (!lenis || !self.isActive) return;
              const y = self.start + progressOf(Math.round(toIndex(self.progress))) * (self.end - self.start);
              if (Math.abs(y - self.scroll()) < 1) return;
              lenis.scrollTo(y, { duration: 0.5, easing: (t) => 1 - (1 - t) ** 3, lock: true });
            }, 140);
          };

          // Scroll drives the layout directly; Lenis already smooths wheel input.
          ScrollTrigger.create({
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              render(self.progress);
              scheduleSnap(self);
            },
            onRefresh: (self) => {
              measure();
              render(self.progress);
            },
          });

          measure();
          render(0);

          if (reduceMotion) return;

          // --- Entrance reveal as the section scrolls into view ---
          const heading = q("[data-spectrum-reveal]");
          gsap.set(heading, { y: 0, yPercent: 110 });
          gsap
            .timeline({
              scrollTrigger: { trigger: root.current, start: "top 80%", toggleActions: "play none none reverse" },
            })
            .to(heading, { yPercent: 0, duration: 0.9, ease: EASE_REVEAL, stagger: 0.08 })
            .from(
              q("[data-card-inner]"),
              { autoAlpha: 0, y: 40, duration: 1, ease: EASE_REVEAL, stagger: 0.05, force3D: true },
              0.1,
            )
            .from(q("[data-tick-inner]"), { scaleY: 0, duration: 0.8, ease: EASE_REVEAL, stagger: 0.02, force3D: true }, 0.2);

          return () => {
            wordSwap?.kill();
            clearTimeout(snapTimer);
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative" style={{ height: `calc(100vh + ${(N - 1) * 35}vh)` }}>
      <section
        aria-label="Emotional spectrum"
        className="sticky top-0 flex h-screen w-full flex-col overflow-hidden bg-tiny-white"
      >
        <h2 className="sr-only">Make them feel {SPECTRUM.map((item) => item.emotion.toLowerCase()).join(", ")}</h2>

        {/* Heading: split at the page centre, word swaps with the focused card */}
        <div aria-hidden="true" className="z-20 flex-none bg-tiny-white px-4 pb-4 pt-16 md:pt-6">
          <div className="grid w-full grid-cols-2 items-baseline font-display text-spectrum font-bold">
            <span className="justify-self-end overflow-hidden">
              <span data-spectrum-reveal="" data-mask-word="" className="inline-block whitespace-nowrap pr-[0.3em] text-tiny-black/30">
                Make them feel
              </span>
            </span>
            <span className="justify-self-start overflow-hidden">
              <span data-spectrum-reveal="" data-mask-word="" className="inline-block">
                <span ref={wordRef} className="inline-block whitespace-nowrap">
                  {SPECTRUM[0].emotion.toLowerCase()}
                </span>
              </span>
            </span>
          </div>
        </div>

        {/* Stage: cards are positioned and scaled (transforms only) by the layout engine */}
        <div ref={stageRef} className="relative w-full flex-1">
          {SPECTRUM.map((item) => (
            <figure key={item.client} data-card="" className="absolute left-0 top-0 m-0 will-change-transform">
              <div
                data-card-inner=""
                className="group relative h-full w-full overflow-hidden will-change-transform [clip-path:inset(0_round_8px)] transition-[clip-path] duration-500 ease-out-cubic hover:[clip-path:inset(6px_round_8px)]"
              >
                {/* Counter-scaled so the photo scales uniformly (object-cover) inside a non-uniformly scaled card */}
                <div data-card-media="" className="absolute inset-0 will-change-transform">
                  <Image
                    src={item.image}
                    alt={`${item.client} — ${item.emotion}`}
                    fill
                    loading="eager"
                    sizes="(min-width: 768px) 540px, 90vw"
                    className="object-cover transition-transform duration-500 ease-out-cubic group-hover:scale-110"
                  />
                </div>
              </div>
            </figure>
          ))}

          <div
            ref={captionRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 hidden px-3 pb-2 pt-[18px] font-mono text-cap-2 uppercase tracking-tight-1 will-change-transform md:block"
          >
            <span ref={captionClientRef}>{SPECTRUM[0].client}</span>{" "}
            <span ref={captionEmotionRef} className="text-tiny-black/40">
              {SPECTRUM[0].emotion}
            </span>
          </div>
        </div>

        {/* Ruler: tick heights follow the focus */}
        <div aria-hidden="true" className="z-20 flex flex-none justify-center bg-tiny-white pb-10">
          <div className="flex h-[52px] items-center gap-[9px]">
            {SPECTRUM.map((item) => (
              // Fixed 52px tick scaled on Y by the layout engine (never animates height).
              <div key={item.client} data-tick="" className="h-[52px] w-px will-change-transform">
                <div data-tick-inner="" className="h-full w-full bg-tiny-black" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
