"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SPECTRUM } from "@/lib/content/spectrum";

const N = SPECTRUM.length;

// --- Layout engine -------------------------------------------------------------
// Desktop numbers are the reference's own (its HomeHorizontalCards component); mobile ones were
// measured on the reference at 390×844.
type Size = { w: number; h: number };

/** Desktop card size by distance from the focused card, at dimension scale 1. */
const SIZE_DESKTOP: Size[] = [
  { w: 435, h: 580 },
  { w: 296, h: 342 },
  { w: 183, h: 222 },
  { w: 101, h: 125 },
  { w: 44, h: 75 },
];
/** Size from five cards out, where the card has already faded into its emotion word. */
const SIZE_DESKTOP_FAR: Size = { w: 80, h: 24 };
/** Fixed inset of the focused slot from the stage edge at the first / last card. */
const EDGE_INSET = 87;
/** Space reserved around the widest emotion word, so far slots fit their word. */
const WORD_SLOT_PAD = 32;

/** Mobile rows; `box` is the slot length along the (vertical) scroll axis. */
type SizeRow = Size & { box: number; gap: number };

const SIZE_MOBILE: SizeRow[] = [
  { box: 248, w: 340, h: 248, gap: 27 },
  { box: 116, w: 161, h: 116, gap: 27 },
  { box: 72, w: 86, h: 72, gap: 27 },
  { box: 36, w: 52, h: 36, gap: 27 },
  { box: 20, w: 32, h: 20, gap: 27 },
];
/** Mobile inset of the focused card from the stage edges at the first / last card (fraction of the height). */
const EDGE_PAD_MOBILE = 0.061;

/** Ruler tick heights (px) by distance from the focus. */
const TICKS = [52, 36, 24, 16, 10, 7, 4];

/** Emotion-word opacity by whole cards from the focus (0.1 beyond); the nearer cards still show images. */
const WORD_OPACITY: Partial<Record<number, number>> = { 5: 0.7, 6: 0.5, 7: 0.28, 8: 0.2 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = gsap.utils.clamp(0, 1);

/** Sizes step in 0.002 increments of the focus index, as on the reference. */
const quantize = (f: number) => Math.round(f / 0.002) * 0.002;

/** Image opacity by distance from the focus: full up to 4 cards away, gone by 4.35. */
const imageMode = (d: number) => clamp01((4.35 - d) / 0.35);

function desktopSize(d: number): Size {
  if (d >= SIZE_DESKTOP.length) return SIZE_DESKTOP_FAR;
  const i = Math.floor(d);
  const a = SIZE_DESKTOP[i];
  const b = SIZE_DESKTOP[i + 1] ?? SIZE_DESKTOP_FAR;
  return { w: lerp(a.w, b.w, d - i), h: lerp(a.h, b.h, d - i) };
}

/** Gap between two neighbouring slots, from their cards' distances to the focus. */
function desktopGap(da: number, db: number) {
  const far = Math.max(da, db);
  if (far >= 4.2) return 14;
  if (far >= 3.35 && Math.min(da, db) >= 2.85) return 18;
  return 24;
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

type Stage = { w: number; h: number; scale: number; vertical: boolean; wordMin: number };

type Placement = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Slot along the scroll axis (desktop): the card is centred in it, and so is its emotion word. */
  slotX: number;
  slotW: number;
  /** Image opacity (1 on mobile). */
  image: number;
  visible: boolean;
};

/**
 * Slot starts along the scroll axis with card `k` settled in focus: sizes by integer distance from `k`,
 * and the row shifted so the focused slot sits on a ramp from one edge inset (first card) to the other (last).
 */
function settledSlots(k: number, stage: Stage): number[] {
  const pos: number[] = [];

  if (stage.vertical) {
    let acc = 0;
    for (let i = 0; i < N; i++) {
      pos[i] = acc;
      if (i < N - 1) {
        const gapD = Math.min(Math.abs(i - k), Math.abs(i + 1 - k));
        acc += (lerpTable(SIZE_MOBILE, Math.abs(i - k)).box + lerpTable(SIZE_MOBILE, gapD).gap) * stage.scale;
      }
    }
    const pad = EDGE_PAD_MOBILE * stage.h;
    const target = pad + (k / (N - 1)) * (stage.h - 2 * pad - SIZE_MOBILE[0].box * stage.scale);
    return pos.map((p) => p + target - pos[k]);
  }

  const slots = Array.from({ length: N }, (_, i) => Math.max(desktopSize(Math.abs(i - k)).w * stage.scale, stage.wordMin));
  let acc = EDGE_INSET;
  for (let i = 0; i < N; i++) {
    pos[i] = acc;
    if (i < N - 1) acc += slots[i] + desktopGap(Math.abs(i - k), Math.abs(i + 1 - k));
  }
  const end = Math.max(EDGE_INSET, stage.w - EDGE_INSET - slots[k]);
  const target = EDGE_INSET + (k / (N - 1)) * (end - EDGE_INSET);
  return pos.map((p) => p + target - pos[k]);
}

/**
 * Places every card for a fractional focus index `f`. Positions blend the two neighbouring settled
 * layouts, so every card moves one way only (never drifts back); sizes follow the distance from `f`.
 */
function layout(f: number, stage: Stage): Placement[] {
  const a = Math.min(Math.floor(f), N - 1);
  const b = Math.min(a + 1, N - 1);
  const from = settledSlots(a, stage);
  const to = settledSlots(b, stage);
  const fq = quantize(f);

  return Array.from({ length: N }, (_, i) => {
    const d = Math.abs(i - fq);
    const main = lerp(from[i], to[i], f - a);

    if (stage.vertical) {
      const row = lerpTable(SIZE_MOBILE, d);
      const w = row.w * stage.scale;
      const h = row.h * stage.scale;
      const box = row.box * stage.scale;
      const visible = main + box > -box && main < stage.h + box;
      return { x: (stage.w - w) / 2, y: main, w, h, slotX: main, slotW: w, image: 1, visible };
    }

    const size = desktopSize(d);
    const w = size.w * stage.scale;
    const h = size.h * stage.scale;
    const slotW = Math.max(w, stage.wordMin);
    const visible = main + slotW > -slotW && main < stage.w + slotW;
    return { x: main + (slotW - w) / 2, y: (stage.h - h) / 2, w, h, slotX: main, slotW, image: imageMode(d), visible };
  });
}

type Edge = "start" | "middle" | "end";

/**
 * Maps scroll progress to [0, 1], held at 0 / 1 inside the edge windows. Leaving a held edge takes an
 * extra 0.004 of progress, so the first and last cards don't flicker at the boundary (reference behaviour).
 */
function remap(progress: number, edge: number, state: Edge): { value: number; state: Edge } {
  const t = clamp01(progress);
  let next = state;
  if ((state === "start" && t > edge + 0.004) || (state === "end" && t < 1 - edge - 0.004)) next = "middle";
  else if (state === "middle" && t < edge - 0.004) next = "start";
  else if (state === "middle" && t > 1 - edge + 0.004) next = "end";

  if (next === "start") return { value: 0, state: next };
  if (next === "end") return { value: 1, state: next };
  return { value: t <= edge ? 0 : t >= 1 - edge ? 1 : (t - edge) / (1 - 2 * edge), state: next };
}

// --- Component -----------------------------------------------------------------

export function EmotionalSpectrum() {
  const root = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

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
      const clips = q<HTMLElement>("[data-card-clip]");
      const media = q<HTMLElement>("[data-card-media]");
      const words = q<HTMLElement>("[data-card-word]");
      const captions = q<HTMLElement>("[data-caption]");
      const captionTexts = q<HTMLElement>("[data-caption-text]");
      const ticks = q<HTMLElement>("[data-tick]");
      const stageEl = stageRef.current!;
      const word = wordRef.current!;

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
          const stage: Stage = { w: 0, h: 0, scale: 1, vertical: isMobile, wordMin: 0 };
          const edge = isMobile ? 0.016 : 0.012;
          let edgeState: Edge = "start";
          let focus = 0;
          let active = -1;
          let hovered = -1;
          let alive = true;

          /** Inverse of the remap for an integer card: the scroll progress at which card `k` settles in focus. */
          const progressOf = (k: number) => (k === 0 ? 0 : edge + (k / (N - 1)) * (1 - 2 * edge));

          // Cards keep a fixed base size (the focused card's) and are only ever moved and scaled,
          // so scrolling never triggers layout or image re-rasterisation — just GPU transforms.
          const base = { w: 0, h: 0 };

          const measure = () => {
            stage.w = stageEl.clientWidth;
            stage.h = stageEl.clientHeight;
            stage.scale = isMobile
              ? Math.min(stage.w / 390, stage.h / 560)
              : gsap.utils.clamp(0.72, 1, (stage.h - 56) / SIZE_DESKTOP[0].h);
            stage.wordMin = isMobile ? 0 : Math.ceil(Math.max(...words.map((el) => el.offsetWidth))) + WORD_SLOT_PAD;
            const focusSize = isMobile ? SIZE_MOBILE[0] : SIZE_DESKTOP[0];
            base.w = focusSize.w * stage.scale;
            base.h = focusSize.h * stage.scale;
            // Layout only changes here (on refresh/resize), never per frame.
            gsap.set(cards, { width: base.w, height: base.h });
            gsap.set(words, { y: stage.h / 2 });
          };

          gsap.set(cards, { transformOrigin: "0 0", force3D: true });
          gsap.set(media, { transformOrigin: "50% 50%", force3D: true });
          gsap.set(ticks, { transformOrigin: "50% 50%", force3D: true });
          gsap.set(words, { xPercent: -50, yPercent: -50, force3D: true });
          gsap.set(captions, { force3D: true });

          // One "css" quickSetter per element writes the whole transform in a single render.
          const setCard = cards.map((el) => gsap.quickSetter(el, "css"));
          const setMedia = media.map((el) => gsap.quickSetter(el, "css"));
          const setWord = words.map((el) => gsap.quickSetter(el, "css"));
          const setCaption = captions.map((el) => gsap.quickSetter(el, "css"));
          // Ticks ease towards their height, trailing the scroll slightly as on the reference.
          const setTick = ticks.map((el) =>
            reduceMotion ? gsap.quickSetter(el, "scaleY") : gsap.quickTo(el, "scaleY", { duration: 0.4, ease: "power3.out" }),
          );
          const cardShown: boolean[] = [];
          const wordShown: boolean[] = [];

          // The focused card's caption is shown, plus the hovered card's (as on the reference).
          const syncCaptions = () => {
            captionTexts.forEach((el, i) => {
              const on = i === active || i === hovered;
              if (on !== el.hasAttribute("data-on")) el.toggleAttribute("data-on", on);
            });
          };

          const setActive = (index: number) => {
            if (index === active) return;
            active = index;
            // The reference swaps the word outright, so it never lags behind the cards.
            word.textContent = SPECTRUM[index].emotion.toLowerCase();
            syncCaptions();
          };

          const render = (progress: number) => {
            const remapped = remap(progress, edge, edgeState);
            edgeState = remapped.state;
            focus = remapped.value * (N - 1);
            const index = Math.round(quantize(focus));
            const placements = layout(focus, stage);

            placements.forEach((p, i) => {
              const sx = p.w / base.w;
              const sy = p.h / base.h;
              // Uniform cover: counter-scale the image so it is scaled by max(sx, sy) and cropped.
              const k = Math.max(sx, sy);
              setCard[i]({ x: p.x, y: p.y, scaleX: sx, scaleY: sy, opacity: p.image });
              setMedia[i]({ scaleX: k / sx, scaleY: k / sy });
              // Corner radius in screen px (8 on desktop, 2–8 by width on mobile, as on the reference),
              // divided back out of the card's own scale so small cards stay rounded too.
              const radius = stage.vertical ? gsap.utils.clamp(2, 8, Math.round(0.025 * p.w)) : 8;
              clips[i].style.borderRadius = `${radius / sx}px / ${radius / sy}px`;
              const showCard = p.visible && p.image > 0.001;
              if (cardShown[i] !== showCard) {
                cardShown[i] = showCard;
                cards[i].style.visibility = showCard ? "visible" : "hidden";
              }
              if (stage.vertical) return;

              const wordOpacity = (WORD_OPACITY[Math.abs(i - index)] ?? 0.1) * (1 - p.image);
              setWord[i]({ x: p.slotX + p.slotW / 2, opacity: wordOpacity });
              const showWord = p.visible && wordOpacity > 0.001;
              if (wordShown[i] !== showWord) {
                wordShown[i] = showWord;
                words[i].style.visibility = showWord ? "visible" : "hidden";
              }
              setCaption[i]({ x: p.slotX, y: p.y + p.h });
            });

            ticks.forEach((_, i) => setTick[i](tickHeight(Math.abs(i - quantize(focus))) / TICKS[0]));
            setActive(index);
          };

          // Once scrolling rests inside the pin, glide to the nearest card so one always settles in focus.
          // No re-arming while the glide itself is scrolling.
          let snapTimer: ReturnType<typeof setTimeout> | undefined;
          let snapUntil = 0;
          const scheduleSnap = (self: ScrollTrigger) => {
            if (reduceMotion || !lenisRef.current || performance.now() < snapUntil) return;
            clearTimeout(snapTimer);
            snapTimer = setTimeout(() => {
              const lenis = lenisRef.current;
              if (!lenis || !self.isActive) return;
              const y = self.start + progressOf(Math.round(focus)) * (self.end - self.start);
              if (Math.abs(y - self.scroll()) < 1) return;
              snapUntil = performance.now() + 550;
              lenis.scrollTo(y, { duration: 0.5, easing: (t) => 1 - (1 - t) ** 3, lock: true });
            }, 140);
          };

          // Scroll drives the layout directly; Lenis already smooths wheel input.
          const trigger = ScrollTrigger.create({
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

          // Far slots are sized by the widest emotion word, so re-measure once the web font is in.
          document.fonts?.ready.then(() => {
            if (!alive) return;
            measure();
            render(trigger.progress);
          });

          const hoverOff: (() => void)[] = [];
          cards.forEach((el, i) => {
            const enter = () => {
              hovered = i;
              syncCaptions();
            };
            const leave = () => {
              if (hovered === i) hovered = -1;
              syncCaptions();
            };
            el.addEventListener("pointerenter", enter);
            el.addEventListener("pointerleave", leave);
            hoverOff.push(() => {
              el.removeEventListener("pointerenter", enter);
              el.removeEventListener("pointerleave", leave);
            });
          });

          // --- Heading reveal as the section scrolls into view (the cards are simply there) ---
          if (!reduceMotion) {
            const heading = q("[data-spectrum-reveal]");
            gsap.set(heading, { y: 0, yPercent: 110 });
            gsap.to(heading, {
              yPercent: 0,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.09,
              scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
            });
          }

          return () => {
            alive = false;
            clearTimeout(snapTimer);
            hoverOff.forEach((off) => off());
          };
        },
      );
    },
    { scope: root },
  );

  return (
    // Pin length is the reference's (pinEndVh + 100vh).
    <div ref={root} className="relative h-[540vh] md:h-[620vh]">
      <section
        aria-label="Emotional spectrum"
        className="sticky top-0 flex h-screen w-full flex-col overflow-hidden bg-tiny-white"
      >
        <h2 className="sr-only">Make them feel {SPECTRUM.map((item) => item.emotion.toLowerCase()).join(", ")}</h2>

        {/* Heading: the whole phrase is centred; word swaps with the focused card */}
        <div aria-hidden="true" className="z-20 flex-none bg-tiny-white px-gutter pb-4 pt-16 md:pt-6">
          <div className="flex w-full items-center justify-center text-center font-display text-spectrum-mobile font-semibold md:items-baseline md:text-spectrum">
            <span className="overflow-hidden">
              <span data-spectrum-reveal="" data-mask-word="" className="inline-block whitespace-nowrap opacity-20 md:pr-[0.3em] md:opacity-35">
                Make them feel
              </span>
            </span>
            <span className="ml-1 overflow-hidden md:ml-0">
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
              {/* Rounded by the layout engine (border-radius); the clip-path is only for the hover inset */}
              <div
                data-card-clip=""
                className="group relative h-full w-full overflow-hidden [clip-path:inset(0_round_8px)] transition-[clip-path] duration-500 ease-out-cubic hover:[clip-path:inset(6px_round_8px)]"
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

          {/* Far cards fade into their emotion word (desktop); kept outside the scaled cards so the text never distorts */}
          {SPECTRUM.map((item) => (
            <span
              key={item.client}
              data-card-word=""
              aria-hidden="true"
              className="pointer-events-none invisible absolute left-0 top-0 hidden whitespace-nowrap text-base leading-none tracking-[-0.02em] text-tiny-black will-change-transform md:block"
            >
              {item.emotion}
            </span>
          ))}

          {/* One caption per card, following it; the focused (or hovered) card's fades up into view */}
          {SPECTRUM.map((item) => (
            <div
              key={item.client}
              data-caption=""
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 hidden will-change-transform md:block"
            >
              <p
                data-caption-text=""
                className="translate-y-[14px] whitespace-nowrap px-3 pb-2 pt-[18px] font-mono text-cap-2 uppercase tracking-wide-1 opacity-0 transition-[opacity,translate] duration-300 ease-[ease] data-[on]:translate-y-0 data-[on]:opacity-100 motion-reduce:transition-none"
              >
                {item.client} <span className="text-tiny-black/40">{item.emotion}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Ruler: tick heights follow the focus */}
        <div aria-hidden="true" className="z-20 flex flex-none justify-center bg-tiny-white pb-10">
          <div className="flex h-[52px] items-center gap-[9px]">
            {SPECTRUM.map((item) => (
              // Fixed 52px tick scaled on Y by the layout engine (never animates height).
              <div key={item.client} data-tick="" className="h-[52px] w-px bg-tiny-black will-change-transform" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
