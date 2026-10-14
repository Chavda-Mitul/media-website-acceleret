"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { media } from "@/lib/media";
import { EASE_REVEAL, EASE_SWAP, PAGE_REVEAL_OFFSET, onIntroCue } from "@/lib/motion";
import { MaskedWords } from "@/components/ui/MaskedWords";
import { ReelDialog } from "@/components/ui/ReelDialog";

type HeadlineLayer = { left: [string, string]; right: [string, string] };

// The same sentence in two word orders; the headline loops between them.
const HEADLINE_LAYERS: [HeadlineLayer, HeadlineLayer] = [
  { left: ["The only thing", "that matters"], right: ["is how you", "make them feel"] },
  { left: ["How you", "make them feel"], right: ["is the only thing", "that matters"] },
];

// Placeholder copy from the reference site — replace with your own figures.
const STATS = [
  "357% average client value growth",
  "7 unicorns and counting",
  "$10B+ raised by TinyWins portfolio companies",
];
const STAT_ALIGN = ["md:text-left", "md:text-center", "md:text-right"];

const TAGLINE = "We build brands that triumph with emotion.";
const CLOSING_DESKTOP = ["Let’s make them", "feel something"];
const CLOSING_MOBILE = ["Let’s make", "them feel", "something"];

function HeadlineLine({ text, row }: { text: string; row: number }) {
  return (
    <div className="overflow-hidden">
      {/* Original 0.68em gap; narrowed on md+ because Inter Tight sets ~15% wider than Suisse. */}
      <div data-mask-line="" data-row={row} className="flex gap-x-[0.68em] md:gap-x-[0.4em]">
        {text.split(" ").map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}

function Headline({ layer, index }: { layer: HeadlineLayer; index: number }) {
  return (
    <div
      data-layer={index}
      aria-hidden="true"
      className={`flex min-h-[calc(50vh-5.75rem)] w-full flex-col justify-between [grid-area:1/1] md:min-h-0 md:flex-row md:items-end md:justify-between ${
        index > 0 ? "motion-reduce:hidden" : ""
      }`}
    >
      <div className="flex flex-col items-end text-right md:items-start md:text-left">
        {layer.left.map((line, row) => (
          <HeadlineLine key={line} text={line} row={row} />
        ))}
      </div>
      <div className="flex flex-col items-start text-left md:items-end md:text-right">
        {layer.right.map((line, row) => (
          <HeadlineLine key={line} text={line} row={row} />
        ))}
      </div>
    </div>
  );
}

function ClosingLines({ lines, className }: { lines: string[]; className: string }) {
  return (
    <span className={className}>
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden">
          <span data-mask-line="" data-closing-line="" className="block">
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);
  const [reelOpen, setReelOpen] = useState(false);

  // Playback is started here rather than via `autoPlay` so reduced-motion users get a still frame
  // (React also doesn't render the `muted` attribute, which autoplay policies require).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.play().catch(() => {});
    }
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      // Line order for staggering: row 0 of both columns, then row 1.
      const layerLines = (i: number) => [...q(`[data-layer="${i}"] [data-row="0"]`), ...q(`[data-layer="${i}"] [data-row="1"]`)];
      const layerA = layerLines(0);
      const layerB = layerLines(1);
      const statWords = q("[data-stat-word]");
      const taglineWords = q("[data-tagline-word]");
      const closingLines = q("[data-closing-line]");

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
          const { isDesktop, reduceMotion } = ctx.conditions as { isDesktop: boolean; reduceMotion: boolean };
          if (reduceMotion) return;

          // Normalise the CSS pre-hydration offset into GSAP-managed transforms.
          gsap.set([...layerA, ...layerB, ...statWords, ...taglineWords, ...closingLines], { y: 0, yPercent: 110 });

          // --- Headline word-order loop (starts once the intro finishes) ---
          const swap = (out: Element[], inn: Element[]) =>
            gsap
              .timeline()
              .to(out, { yPercent: -110, duration: 0.9, ease: EASE_SWAP, stagger: 0.06 })
              .fromTo(
                inn,
                { yPercent: 110 },
                { yPercent: 0, duration: 0.9, ease: EASE_SWAP, stagger: 0.06, immediateRender: false },
                0.15,
              );

          const loop = gsap
            .timeline({ paused: true, repeat: -1 })
            .add(swap(layerA, layerB), "+=3.5")
            .add(swap(layerB, layerA), "+=3.5");

          let introDone = false;
          let headVisible = true;
          const syncLoop = () => (introDone && headVisible ? loop.resume() : loop.pause());

          ScrollTrigger.create({
            trigger: headRef.current,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
              headVisible = self.isActive;
              syncLoop();
            },
          });

          // --- Load reveal (from the loader hand-off): video panel rises from below, then the headline ---
          gsap.set(panelRef.current, { yPercent: 100 });
          const intro = gsap
            .timeline({ paused: true })
            .to(panelRef.current, { yPercent: 0, duration: 1.2, ease: "power4.out" })
            .to(layerA, { yPercent: 0, duration: 1.1, ease: EASE_REVEAL, stagger: 0.08 }, PAGE_REVEAL_OFFSET)
            .to(statWords, { yPercent: 0, duration: 0.9, ease: EASE_REVEAL, stagger: 0.015 }, PAGE_REVEAL_OFFSET + 0.35)
            .call(() => {
              introDone = true;
              syncLoop();
            });

          const offIntro = onIntroCue("page", () => intro.play());

          // --- Scroll: video parallax while the headline scrolls away ---
          gsap.fromTo(
            mediaRef.current,
            { yPercent: -20 },
            {
              yPercent: 0,
              ease: "none",
              scrollTrigger: { trigger: headRef.current, start: "top top", end: "bottom top", scrub: true },
            },
          );

          // --- Scroll: pinned video panel shrinks into a rounded card ---
          gsap
            .timeline({
              scrollTrigger: { trigger: trackRef.current, start: "top top", end: "bottom bottom", scrub: true },
            })
            .to(
              panelRef.current,
              { scale: isDesktop ? 0.65 : 0.86, borderRadius: 24, ease: "power1.inOut", duration: 0.68 },
              0.25,
            )
            .set({}, {}, 1);

          // --- Scroll: closing statement ---
          const closing = { trigger: closingRef.current, toggleActions: "play none none reverse" };
          gsap.to(taglineWords, {
            yPercent: 0,
            duration: 0.9,
            ease: EASE_REVEAL,
            stagger: 0.03,
            scrollTrigger: { ...closing, start: "top 75%" },
          });
          gsap.to(closingLines, {
            yPercent: 0,
            duration: 1.2,
            ease: EASE_REVEAL,
            stagger: 0.1,
            scrollTrigger: { ...closing, start: "top 55%" },
          });

          return offIntro;
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Hero" className="relative isolate">
      <h1 className="sr-only">The only thing that matters is how you make them feel</h1>

      {/* Headline + stats */}
      <div
        ref={headRef}
        className="relative z-10 flex min-h-[50vh] w-full items-end bg-tiny-white px-4 pb-3 pt-16 md:h-[70vh] md:min-h-0 md:items-stretch md:px-8 md:pb-4 md:pt-20"
      >
        <div className="w-full md:flex md:h-full md:flex-col md:justify-between">
          <div className="grid w-full font-display text-hero font-semibold uppercase md:max-lg:text-[4.8vw]">
            {HEADLINE_LAYERS.map((layer, i) => (
              <Headline key={i} layer={layer} index={i} />
            ))}
          </div>

          <div className="mt-3 flex w-full flex-col gap-1 md:mt-0 md:grid md:grid-cols-3 md:items-end md:gap-6 lg:grid-cols-[repeat(3,max-content)] lg:items-start lg:justify-between">
            {STATS.map((stat, i) => (
              <p key={stat} className={`text-stat font-semibold lg:whitespace-nowrap ${STAT_ALIGN[i]}`}>
                <MaskedWords text={stat} target="data-stat-word" />
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Pinned video panel */}
      <div ref={trackRef} className="relative h-[250vh]">
        {/* Navbar theme markers (non-sticky stand-ins for the sticky panel): the full-bleed phase at the
            top, and the shrunken card (scale 0.86 / 0.65, centred) as it scrolls away at the bottom. */}
        <div data-nav-theme="media" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-screen" />
        <div
          data-nav-theme="media"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[7vh] h-[86vh] md:bottom-[17.5vh] md:h-[65vh]"
        />
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-tiny-white">
          <div ref={panelRef} className="absolute inset-0 overflow-hidden will-change-transform">
            <div ref={mediaRef} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.2)" }}>
              <video
                ref={videoRef}
                src={media.heroVideo}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center">
              <button
                type="button"
                onClick={() => setReelOpen(true)}
                aria-haspopup="dialog"
                className="flex items-center gap-[10px] rounded-lg border-[0.8px] border-white/20 bg-black/26 px-[22px] py-[11px] backdrop-blur-[15px] transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-black"
              >
                <svg width="8" height="10" viewBox="0 0 8 10" fill="none" aria-hidden="true">
                  <path d="M0 0L8 5L0 10V0Z" fill="white" />
                </svg>
                <span className="font-sans text-[0.875rem] leading-normal tracking-[-0.0175rem] text-white">Play Reel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Closing statement */}
      <div ref={closingRef} className="relative h-screen w-full bg-tiny-white">
        <div className="absolute inset-x-0 top-0 z-20 px-6 pt-[37px] text-center md:px-12">
          <p className="font-serif text-tagline text-balance">
            <MaskedWords text={TAGLINE} target="data-tagline-word" />
          </p>
        </div>
        <h2 className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center text-mega-mobile uppercase md:px-12 md:text-mega">
          <ClosingLines lines={CLOSING_MOBILE} className="block md:hidden" />
          <ClosingLines lines={CLOSING_DESKTOP} className="hidden md:block" />
        </h2>
      </div>

      <ReelDialog open={reelOpen} onClose={() => setReelOpen(false)} />
    </section>
  );
}
