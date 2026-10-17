"use client";

import { Fragment, useEffect, useId, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  PROCESS_INTRO,
  PROCESS_STEPS,
  type ProcessIntro,
  type ProcessStep,
  type RichText,
} from "@/lib/content/process";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** Tailwind `lg`: pinned row with the rolling wheel. Below it the cards stack. */
const DESKTOP = "(min-width: 1024px)";

// Desktop scroll timing, as fractions of the 500vh track's progress ("start end" → "end end", so the
// stage pins at 0.2). Converted from the reference's Webflow keyframes and canvas scroll offset.
const COVER_START = 0.03;
/** Card 1's cover is full here and the last card's at COVER_LAST_END; the ones between are spaced evenly. */
const COVER_FIRST_END = 0.381;
const COVER_LAST_END = 0.9075;
/** The wheel rolls across the last three quarters of the pin. */
const WHEEL_START = 0.4;
/** Stands in for the reference's per-frame lerp (0.2). Skipped with reduced motion. */
const SPRING = { stiffness: 400, damping: 40, restDelta: 0.0005 };

// Wheel geometry, ported from the reference canvas.
const N_MIN = 4;
const N_MAX = 12;
/** Share of the morph spent adding sides (4 → 12); the rest rounds the 12-gon into a circle. */
const PHASE2 = 0.3;
/** Wheel radius as a share of the smaller viewport side… */
const RADIUS_SCALE = 0.13;
/** …capped as a share of the card row's height, for short viewports. */
const MAX_RADIUS = 0.22;
/** Axle height as a share of the card row (measured from the recording: road settles at ~49%). */
const AXLE_Y = 0.32;
const CIRCLE_SAMPLES = 120;

type Geom = { w: number; h: number; r: number };

type Scene = {
  wheelX: number;
  axleY: number;
  /** Height of the road's arch peaks (and of the flat road once the wheel is a circle). */
  roadY: number;
  /** Continuous side count. */
  nf: number;
  /** Side length, which is also the width of one road arch. */
  s: number;
  /** Apothem: axle-to-side distance. */
  a: number;
  /** 0 = polygon, 1 = circle on a flat road. */
  circT: number;
  rotation: number;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const fmt = (n: number) => n.toFixed(1);

const unitPolygons = new Map<number, Float64Array>();

/** Regular n-gon of circumradius r as flat [x0, y0, x1, y1, …], vertex 0 pointing straight down. */
function idealVerts(n: number, r: number) {
  let unit = unitPolygons.get(n);
  if (!unit) {
    unit = new Float64Array(n * 2);
    for (let i = 0; i < n; i++) {
      const angle = Math.PI / 2 + (2 * Math.PI * i) / n;
      unit[i * 2] = Math.cos(angle);
      unit[i * 2 + 1] = Math.sin(angle);
    }
    unitPolygons.set(n, unit);
  }
  return unit.map((v) => v * r);
}

/** A polygon with a fractional side count: the floor(nf)-gon grows a vertex that eases out onto the next n-gon. */
function continuousVerts(nf: number, r: number) {
  const nLo = Math.floor(nf);
  const frac = nf - nLo;
  const base = idealVerts(nLo, r);
  if (frac < 1e-9) return base;

  const nHi = nLo + 1;
  // Insert the midpoint of edge 0–1 as the new vertex 1.
  const start = new Float64Array(nHi * 2);
  start[0] = base[0];
  start[1] = base[1];
  start[2] = (base[0] + base[2]) / 2;
  start[3] = (base[1] + base[3]) / 2;
  for (let i = 2; i < nHi; i++) {
    start[i * 2] = base[(i - 1) * 2];
    start[i * 2 + 1] = base[(i - 1) * 2 + 1];
  }
  // Both polygons start at the bottom vertex, so their indices already line up.
  const target = idealVerts(nHi, r);
  return start.map((v, i) => lerp(v, target[i], frac));
}

/**
 * Where the wheel is at roll progress `t`. Ported from the reference canvas: the road is cosh arches one
 * side-length wide and the rotation is linear in distance, which approximates the exact catenary roll
 * (polygon wheels on inverted catenaries); kept as-is because it is what the recording shows.
 */
function sceneAt(t: number, { w, h, r }: Geom): Scene {
  const xLeft = -r;
  const span = w; // xRight (w − r) − xLeft
  const wheelX = xLeft + t * span;

  // The morph starts once the wheel has rolled fully into view.
  const tEntry = (2 * r) / span;
  const tMorph = smoothstep(clamp01((t - tEntry) / (1 - tEntry)));
  const tPoly = Math.min(tMorph / PHASE2, 1);
  const circT = smoothstep(clamp01((tMorph - PHASE2) / (1 - PHASE2)));

  const nf = N_MIN + tPoly * (N_MAX - N_MIN);
  const nLo = Math.floor(nf);
  const nHi = Math.min(N_MAX, nLo + 1);
  const frac = nf - nLo;
  const s = lerp(2 * r * Math.sin(Math.PI / nLo), 2 * r * Math.sin(Math.PI / nHi), frac);
  const a = lerp(r * Math.cos(Math.PI / nLo), r * Math.cos(Math.PI / nHi), frac);

  const roadY = h * AXLE_Y + a;
  const axleY = roadY - (a + (r - a) * circT);
  const rotation = ((t * span) / s) * ((2 * Math.PI) / nf) - Math.PI / nf;

  return { wheelX, axleY, roadY, nf, s, a, circT, rotation };
}

/** The bumpy road: a row of cosh arches under the wheel, flattening as it becomes a circle. */
function roadPath({ s, a, circT, roadY }: Scene, { w, r }: Geom) {
  if (circT >= 0.999) return `M0 ${fmt(roadY)}H${fmt(w)}`;

  // Arch peaks sit at xLeft + k·s, so the wheel starts flat on a peak.
  const firstPeak = -r + Math.ceil((r - s) / s) * s;
  const arches = Math.ceil((w + 2 * s) / s) + 2;
  const steps = Math.max(16, Math.round(s / 4));
  const bump = 1 - circT;

  let d = "";
  for (let i = 0; i < arches; i++) {
    const peak = firstPeak + i * s;
    for (let j = i === 0 ? 0 : 1; j <= steps; j++) {
      const x = peak - s / 2 + (j / steps) * s;
      const y = roadY + (a * Math.cosh((x - peak) / a) - a) * bump;
      d += `${d ? "L" : "M"}${fmt(x)} ${fmt(y)}`;
    }
  }
  return d;
}

/** The wheel outline in world space (no SVG transform, so no transform-origin quirks). */
function wheelPath({ wheelX: cx, axleY: cy, nf, circT, rotation }: Scene, r: number) {
  if (circT >= 0.999) {
    return `M${fmt(cx - r)} ${fmt(cy)}a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(2 * r)} 0a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-2 * r)} 0Z`;
  }

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const verts = continuousVerts(nf, r);
  const count = verts.length / 2;
  // Bare vertices while it is a polygon; evenly sampled edges once it starts bulging into a circle.
  const samples = circT > 0 ? CIRCLE_SAMPLES : count;

  let d = "";
  for (let i = 0; i < samples; i++) {
    const v = (i * count) / samples;
    const i0 = Math.floor(v) % count;
    const i1 = (i0 + 1) % count;
    const k = v - Math.floor(v);
    let x = lerp(verts[i0 * 2], verts[i1 * 2], k);
    let y = lerp(verts[i0 * 2 + 1], verts[i1 * 2 + 1], k);
    if (circT > 0) {
      const len = Math.hypot(x, y);
      const scale = lerp(len, r, circT) / len;
      x *= scale;
      y *= scale;
    }
    d += `${i ? "L" : "M"}${fmt(cx + x * cos - y * sin)} ${fmt(cy + x * sin + y * cos)}`;
  }
  return `${d}Z`;
}

// Runs render as plain text: one type system, so no serif-italic accents inside sentences.
function Rich({ runs }: { runs: RichText }) {
  return runs.map((run, i) => <Fragment key={i}>{run.text}</Fragment>);
}

type ProcessCardProps = {
  step: ProcessStep;
  index: number;
  count: number;
  /** Desktop track progress (smoothed). */
  progress: MotionValue<number>;
  isDesktop: MotionValue<boolean>;
};

// White type on a black cover that rises from the bottom. Until the cover reaches it, the type is white on
// the white page, so each number and line "appears" as the card fills (as on the reference). The cover is a
// rounded card sliding up inside the card's rounded clip (scaling would squash its corners), so the black
// keeps round corners all the way up.
function ProcessCard({ step, index, count, progress, isDesktop }: ProcessCardProps) {
  const ref = useRef<HTMLLIElement>(null);
  // Stacked layout: each card fills as it scrolls in, full by the time its top reaches 60% of the viewport.
  const { scrollYProgress: ownProgress } = useScroll({ target: ref, offset: ["start end", "start 0.6"] });

  const coverEnd = count > 1 ? lerp(COVER_FIRST_END, COVER_LAST_END, index / (count - 1)) : COVER_FIRST_END;
  // useTransform(() => …) subscribes to the values read on each run, so read them all unconditionally.
  const fill = useTransform(() => {
    const desktop = isDesktop.get();
    const pinned = clamp01((progress.get() - COVER_START) / (coverEnd - COVER_START));
    const stacked = ownProgress.get();
    return desktop ? pinned : stacked;
  });
  const coverY = useTransform(fill, (v) => `${(1 - v) * 100}%`);

  return (
    // Desktop: rows come from the list's subgrid, so titles and bodies line up across cards whatever the copy length.
    <li
      ref={ref}
      className="relative isolate flex min-h-[24rem] flex-col overflow-hidden rounded-xl p-5 text-tiny-white lg:row-span-4 lg:grid lg:min-h-0 lg:grid-rows-subgrid"
    >
      <motion.div
        aria-hidden="true"
        data-process-cover=""
        className="absolute inset-0 -z-10 rounded-[inherit] bg-tiny-black"
        style={{ y: coverY }}
      />
      <span className="font-mono text-cap-2 uppercase leading-none tracking-wide-1">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-auto w-[90%] pt-16 font-display text-display-3 font-semibold lg:row-start-3 lg:mt-0 lg:w-full lg:pt-0">
        {step.title}
        <br />
        <span className="text-white/70">{step.titleItalic}</span>
      </h3>
      <p className="mt-5 w-[90%] text-balance font-sans text-body lg:row-start-4 lg:w-full">
        <Rich runs={step.body} />
      </p>
    </li>
  );
}

type ProcessSectionProps = {
  steps?: ProcessStep[];
  intro?: ProcessIntro;
  className?: string;
};

// "Our process" (after neutomni.com). Desktop: a 500vh track pins the stage while black covers rise card by card
// and a white wheel rolls across them, morphing from a square to a circle as its bumpy road flattens. A dashed
// axle line draws in behind it and a dot marks its centre. Below `lg` the cards stack, fill as they scroll
// in, and a vertical dashed line with a dot tracks progress down the stack.
export function ProcessSection({ steps = PROCESS_STEPS, intro = PROCESS_INTRO, className = "" }: ProcessSectionProps) {
  const track = useRef<HTMLDivElement>(null);
  const rowWrap = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^\w-]/g, "");
  const headingId = `process-heading-${uid}`;
  const maskId = `process-line-${uid}`;

  const isDesktop = useMotionValue(false);
  const geom = useMotionValue<Geom>({ w: 0, h: 0, r: 0 });

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP);
    const sync = () => isDesktop.set(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [isDesktop]);

  useEffect(() => {
    const el = rowWrap.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const r = Math.min(RADIUS_SCALE * Math.min(window.innerWidth, window.innerHeight), MAX_RADIUS * h);
      geom.set({ w, h, r });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [geom]);

  // Desktop: one progress value for the whole pinned track.
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start end", "end end"] });
  const smoothed = useSpring(scrollYProgress, SPRING);
  const progress = reduceMotion ? scrollYProgress : smoothed;
  const roll = useTransform(progress, [WHEEL_START, 1], [0, 1]);

  const scene = useTransform(() => {
    const desktop = isDesktop.get();
    const t = roll.get();
    const g = geom.get();
    return desktop && g.w > 0 && g.r > 0 ? sceneAt(t, g) : null;
  });
  const roadD = useTransform(() => {
    const sc = scene.get();
    const g = geom.get();
    return sc ? roadPath(sc, g) : "";
  });
  const wheelD = useTransform(() => {
    const sc = scene.get();
    const g = geom.get();
    return sc ? wheelPath(sc, g.r) : "";
  });
  const axleD = useTransform(() => {
    const sc = scene.get();
    const g = geom.get();
    return sc ? `M0 ${fmt(sc.axleY)}H${fmt(g.w)}` : "";
  });
  // The dashed line is drawn from the left edge up to the dot.
  const lineReveal = useTransform(() => {
    const sc = scene.get();
    const g = geom.get();
    return sc ? clamp01(sc.wheelX / g.w) : 0;
  });
  const dotX = useTransform(() => scene.get()?.wheelX ?? 0);
  const dotY = useTransform(() => scene.get()?.axleY ?? 0);

  // Stacked layout: a vertical line down the cards, its tip (and the dot) at 60% of the viewport.
  const { scrollYProgress: stackProgress } = useScroll({ target: rowWrap, offset: ["start 0.6", "end 0.6"] });
  const stackHidden = useTransform(stackProgress, [0, 1], [100, 0]);
  const stackClip = useMotionTemplate`inset(0 0 ${stackHidden}% 0)`;
  const stackTip = useTransform(stackProgress, [0, 1], ["0%", "100%"]);

  return (
    <section aria-labelledby={headingId} className={`relative bg-tiny-white ${className}`}>
      <div ref={track} className="relative lg:h-[500vh]">
        {/* Full-screen stage: the header keeps the page gutter; the cards sit in a thin margin as wide as the
            gaps between them, so every rounded corner shows. */}
        <div className="flex flex-col gap-8 pb-16 pt-20 lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:pb-3">
          <div className="flex flex-col gap-5 px-gutter">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionLabel as="h2" id={headingId}>
                {intro.label}
              </SectionLabel>
              {/* The process chapter's narrator line. */}
              <p className="max-w-[24ch] text-balance font-serif text-tagline md:text-right">
                <Rich runs={intro.tagline} />
              </p>
            </div>
            {/* The road the wheel travels, A to B across the cards: dashed like the wheel's axle line. */}
            <p aria-hidden="true" className="flex items-center gap-3 font-sans text-cap-2 font-medium leading-none">
              <span>{intro.from}</span>
              <span className="flex-1 border-t border-dashed border-current/30" />
              <span>{intro.to}</span>
            </p>
          </div>

          <div ref={rowWrap} className="relative mx-3 lg:min-h-0 lg:flex-1">
            {/* Desktop rows: number · open space for the wheel · title · body. */}
            <ol className="flex flex-col gap-3 lg:grid lg:h-full lg:auto-cols-fr lg:grid-flow-col lg:grid-rows-[auto_1fr_auto_auto] lg:gap-x-3 lg:gap-y-0">

              {steps.map((step, i) => (
                <ProcessCard
                  key={step.title}
                  step={step}
                  index={i}
                  count={steps.length}
                  progress={progress}
                  isDesktop={isDesktop}
                />
              ))}
            </ol>

            {/* Desktop wheel. White strokes only show over the black covers. User units are CSS px (no viewBox). */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden size-full overflow-hidden lg:block"
              fill="none"
              stroke="white"
            >
              <defs>
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                  {/* pathLength drives the reveal; the visible line keeps its own dash pattern. */}
                  <motion.path d={axleD} strokeWidth={4} style={{ pathLength: lineReveal }} />
                </mask>
              </defs>
              <motion.path d={roadD} strokeWidth={1.5} strokeLinejoin="round" />
              <motion.path d={wheelD} strokeWidth={1.5} strokeLinejoin="round" />
              <motion.path d={axleD} strokeWidth={1} strokeDasharray="5 10" mask={`url(#${maskId})`} />
              <motion.circle cx={dotX} cy={dotY} r={3} fill="white" stroke="none" />
            </svg>

            {/* Stacked tracker. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-5 w-px lg:hidden">
              <motion.div
                className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,#fff_0_5px,transparent_5px_15px)]"
                style={{ clipPath: stackClip }}
              />
              <motion.div
                className="absolute left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tiny-white"
                style={{ top: stackTip }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
