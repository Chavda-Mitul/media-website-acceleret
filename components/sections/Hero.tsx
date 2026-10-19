"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { media } from "@/lib/media";
import { EASE_REVEAL, SHEET_ARRIVE, onIntroCue, sheetArrive } from "@/lib/motion";
import { Button, PlayGlyph } from "@/components/ui/Button";
import { ReelDialog } from "@/components/ui/ReelDialog";

const TAGLINE = "We build brands that triumph with emotion.";
const CLOSING_DESKTOP = ["Let’s make them", "feel something"];
const CLOSING_MOBILE = ["Let’s make", "them feel", "something"];

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

// The reel, straight after the hook: it rises over the opening stage as a rounded sheet, fills the screen,
// then shrinks into a card on paper, and the feeling chapter's closing statement follows.
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const [reelOpen, setReelOpen] = useState(false);

  // The reel only starts downloading once the intro hands the page over, so it never competes with the first
  // screen, and it only plays (decodes) while on screen. Portrait screens get a 3:4 centre crop: object-cover only
  // ever shows the middle of the wide frame there. Reduced motion keeps the poster as a still frame. Playback is
  // started here rather than via `autoPlay` (React also doesn't render the `muted` attribute, which autoplay needs).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let io: IntersectionObserver | undefined;
    const off = onIntroCue("page", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Effects re-run (Strict Mode, back navigation): setting the same src again would restart the download.
      if (!video.getAttribute("src")) {
        video.src = window.matchMedia("(max-aspect-ratio: 3/4)").matches
          ? media.heroVideo.portrait
          : media.heroVideo.landscape;
      }
      video.muted = true;
      // By ratio, not isIntersecting: at the top of the page the reel's edge touches the bottom of the screen,
      // which counts as intersecting.
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio > 0) video.play().catch(() => {});
          else video.pause();
        },
        { threshold: [0, 0.01] },
      );
      io.observe(video);
    });
    return () => {
      off();
      io?.disconnect();
      video.pause();
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const closingLines = q("[data-closing-line]");

      // The reel's rounded top squares off as it reaches the top of the screen (scroll-linked, so always on).
      sheetArrive(stageRef.current!, trackRef.current!);

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
          gsap.set(closingLines, { y: 0, yPercent: 110 });

          // --- Scroll: video parallax while the reel rises into view ---
          gsap.fromTo(
            mediaRef.current,
            { yPercent: -20 },
            {
              yPercent: 0,
              ease: "none",
              scrollTrigger: { trigger: trackRef.current, start: "top bottom", end: "top top", scrub: true },
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
          // Tagline, scrubbed across the block's entry as on the reference: its lines rise out of their
          // masks, then the text fades to 0.4 as it travels up the screen (re-split on resize / font load).
          SplitText.create(taglineRef.current!, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap
                .timeline({
                  scrollTrigger: { trigger: closingRef.current, start: "top bottom", end: "top top", scrub: true },
                })
                .fromTo(self.lines, { yPercent: 100 }, { yPercent: 0, duration: 0.5, stagger: 0.22, ease: "power2.out" }, 0)
                .to(self.lines, { autoAlpha: 0.4, duration: 1, ease: "none" }, ">"),
          });

          const closing = { trigger: closingRef.current, toggleActions: "play none none reverse" };
          gsap.to(closingLines, {
            yPercent: 0,
            duration: 1.2,
            ease: EASE_REVEAL,
            stagger: 0.1,
            scrollTrigger: { ...closing, start: "top 55%" },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Showreel" className="relative isolate">
      {/* Pinned video panel. Paper behind it, so the corners of its rounded arrival show the hook's white. */}
      <div ref={trackRef} className="relative h-[250vh] bg-tiny-white">
        {/* Navbar theme markers (non-sticky stand-ins for the sticky panel): the full-bleed phase at the
            top, and the shrunken card (scale 0.86 / 0.65, centred) as it scrolls away at the bottom. */}
        <div data-nav-theme="media" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-screen" />
        <div
          data-nav-theme="media"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[7vh] h-[86vh] md:bottom-[17.5vh] md:h-[65vh]"
        />
        <div ref={stageRef} className={`sticky top-0 h-screen w-full overflow-hidden bg-tiny-white ${SHEET_ARRIVE}`}>
          <div ref={panelRef} className="absolute inset-0 overflow-hidden will-change-transform">
            <div ref={mediaRef} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.2)" }}>
              {/* src is set on the "page" intro cue (see above); the poster is its first frame. */}
              <video
                ref={videoRef}
                poster={media.heroVideo.poster}
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center">
              <Button tone="glass" icon={<PlayGlyph />} onClick={() => setReelOpen(true)} aria-haspopup="dialog">
                Play reel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Closing statement */}
      <div ref={closingRef} className="relative h-screen w-full bg-tiny-white">
        <div className="absolute inset-x-0 top-0 z-20 px-gutter pt-[37px] text-center">
          {/* The feeling chapter's narrator line. */}
          <p ref={taglineRef} className="font-serif text-tagline text-balance">
            {TAGLINE}
          </p>
        </div>
        <h2 className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-gutter text-center font-display text-display-1-mobile font-semibold uppercase md:text-display-1">
          <ClosingLines lines={CLOSING_MOBILE} className="block md:hidden" />
          <ClosingLines lines={CLOSING_DESKTOP} className="hidden md:block" />
        </h2>
      </div>

      <ReelDialog open={reelOpen} onClose={() => setReelOpen(false)} />
    </section>
  );
}
