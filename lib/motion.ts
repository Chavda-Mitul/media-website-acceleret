// Shared motion language, so independent components (Navbar, Hero, …) intro on one clock.
import { gsap } from "@/lib/gsap";

export const EASE_REVEAL = "expo.out";

/** Seconds after fonts are ready before the page intro starts, on pages without the initial loader. */
export const INTRO_DELAY = 0.15;

/** Seconds after the loader hand-off before the headline rises and the nav pill slides into its corner. */
export const PAGE_REVEAL_OFFSET = 0.26;

/** Rounded top corners driven by `--arrive` (1 → 0); put it on the element `sheetArrive` animates. */
export const SHEET_ARRIVE = "rounded-t-[calc(var(--radius-sheet)*var(--arrive,1))]";

/**
 * Chapter edge for a full-bleed section that rises over the one before it: its top corners start rounded
 * (SHEET_ARRIVE) and square off as `trigger` scrolls from the bottom of the screen to the top.
 * Scroll-linked rather than autonomous motion, so it also runs with reduced motion.
 */
export function sheetArrive(el: Element, trigger: Element) {
  return gsap.fromTo(
    el,
    { "--arrive": 1 },
    { "--arrive": 0, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "top top", scrub: true } },
  );
}

/** Runs `cb` once webfonts are loaded, so masked reveals measure against final glyphs. */
export function whenFontsReady(cb: () => void) {
  document.fonts.ready.then(cb);
}

/**
 * Intro cues, fired by <InitialLoader> as its timeline reaches them:
 * - "nav": the logo starts docking, so the nav pill appears (centred).
 * - "page": hand-off. The hero reveals and the pill slides into its corner.
 * Pages without the loader get both cues INTRO_DELAY after fonts are ready.
 */
export type IntroCue = "nav" | "page";

const firedCues = new Set<IntroCue>();
const waitingCues = new Map<IntroCue, Set<() => void>>();

/** True while the initial loader is in the DOM. Its markup is server-rendered, so this holds from hydration on. */
export function hasInitialLoader() {
  return document.querySelector("[data-initial-loader]") !== null;
}

export function cueIntro(cue: IntroCue) {
  firedCues.add(cue);
  const waiting = waitingCues.get(cue);
  waitingCues.delete(cue);
  waiting?.forEach((cb) => cb());
}

/** Runs `cb` at `cue` (right away if it already fired). Returns a canceller for effect cleanup. */
export function onIntroCue(cue: IntroCue, cb: () => void) {
  let cancelled = false;
  let delayed: gsap.core.Tween | undefined;
  const run = () => {
    if (!cancelled) cb();
  };

  whenFontsReady(() => {
    if (cancelled) return;
    if (firedCues.has(cue)) {
      run();
    } else if (hasInitialLoader()) {
      if (!waitingCues.has(cue)) waitingCues.set(cue, new Set());
      waitingCues.get(cue)!.add(run);
    } else {
      delayed = gsap.delayedCall(INTRO_DELAY, run);
    }
  });

  return () => {
    cancelled = true;
    delayed?.kill();
    waitingCues.get(cue)?.delete(run);
  };
}
