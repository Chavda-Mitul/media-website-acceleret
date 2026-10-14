"use client";

import Image from "next/image";
import { useEffect, useImperativeHandle, useRef, useState, type Ref, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FadeImage } from "@/components/ui/FadeImage";
import { FILMSTRIP, tileSrc, type FilmstripProject, type FilmstripTile } from "@/lib/content/filmstrip";
import { caseStudyHref } from "@/lib/navigation";

/** Pointer scrubbing + hover preview only with a real mouse and room for it; touch gets native swipe. */
const DESKTOP_POINTER = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

const ratioOf = (aspect: string) => {
  const [w, h] = aspect.split("/").map(Number);
  return w / h;
};

/** True once `ref` comes within a viewport-height of the screen (then stays true). */
function useNearViewport(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return near;
}

type PreviewHandle = { show: (tile: FilmstripTile) => void };

/** Large card that follows the pointer over a strip. Owns its own state so hovering never re-renders the tiles. */
function FilmstripPreview({ ref, client }: { ref: Ref<PreviewHandle>; client: string }) {
  const [tile, setTile] = useState<FilmstripTile | null>(null);
  useImperativeHandle(ref, () => ({ show: setTile }), []);

  return (
    <div
      data-preview=""
      aria-hidden="true"
      className="pointer-events-none invisible absolute left-0 top-1/2 z-10 hidden opacity-0 drop-shadow-2xl md:block"
    >
      <div
        className="relative h-[280px] overflow-hidden rounded-lg bg-[#141414] lg:h-[360px]"
        style={{ aspectRatio: tile?.[1] ?? "16 / 9" }}
      >
        {/* Same <img> across tiles: the browser keeps the last frame up until the next one decodes. */}
        {tile && (
          <Image
            src={tileSrc(tile[0])}
            alt={`${client} preview`}
            fill
            sizes="(min-width: 1024px) 640px, 500px"
            className="object-cover"
          />
        )}
      </div>
    </div>
  );
}

function FilmstripRow({ project }: { project: FilmstripProject }) {
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const preview = useRef<PreviewHandle>(null);
  // Tiles get their images only near the viewport: native lazy-loading never fires for tiles
  // clipped horizontally, which would leave blanks while scrubbing.
  const near = useNearViewport(root);
  const href = caseStudyHref(project.slug);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(DESKTOP_POINTER, () => {
        const stripEl = strip.current!;
        const trackEl = track.current!;
        const previewEl = stripEl.querySelector<HTMLElement>("[data-preview]")!;
        const tiles = [...trackEl.children] as HTMLElement[];

        const xTo = gsap.quickTo(trackEl, "x", { duration: 0.9, ease: "power3.out" });
        const previewXTo = gsap.quickTo(previewEl, "x", { duration: 0.5, ease: "power3.out" });
        gsap.set(previewEl, { xPercent: -50, yPercent: -50, scale: 0.96 });

        // Layout is read once per hover, never per move.
        let stripLeft = 0;
        let stripWidth = 0;
        let maxShift = 0;
        let previewHeight = 0;
        let lefts: number[] = [];
        let widths: number[] = [];
        let pointerX = 0;
        let hovered = -1;
        let halfPreview = 0;

        const measure = () => {
          const rect = stripEl.getBoundingClientRect();
          stripLeft = rect.left;
          stripWidth = rect.width;
          lefts = tiles.map((t) => t.offsetLeft);
          widths = tiles.map((t) => t.offsetWidth);
          // One full sequence; the copies after it keep the strip filled at any offset.
          const period = lefts[project.tiles.length] ?? trackEl.offsetWidth;
          maxShift = Math.max(0, Math.min(period, trackEl.offsetWidth - stripWidth));
          previewHeight = previewEl.offsetHeight;
        };

        /** Index of the tile under strip-relative x, or -1 when over a gap. */
        const tileAt = (x: number) => {
          let lo = 0;
          let hi = lefts.length - 1;
          while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (lefts[mid] <= x) lo = mid;
            else hi = mid - 1;
          }
          return x >= lefts[lo] && x < lefts[lo] + widths[lo] ? lo : -1;
        };

        const previewX = () => gsap.utils.clamp(halfPreview, stripWidth - halfPreview, pointerX - stripLeft);

        // Runs every frame while hovered, so the preview tracks the tile under a still pointer as the strip glides.
        const syncTile = () => {
          const i = tileAt(pointerX - stripLeft - (gsap.getProperty(trackEl, "x") as number));
          if (i === -1 || i === hovered) return;
          hovered = i;
          const tile = project.tiles[i % project.tiles.length];
          preview.current?.show(tile);
          halfPreview = (previewHeight * ratioOf(tile[1])) / 2;
          previewXTo(previewX());
        };

        const onEnter = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          measure();
          pointerX = e.clientX;
          hovered = -1;
          syncTile();
          const x = previewX();
          previewXTo(x, x); // jump, don't glide in from the last row position
          gsap.to(previewEl, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" });
          gsap.ticker.add(syncTile);
        };

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          pointerX = e.clientX;
          // Pointer position across the viewport maps linearly onto one sequence of the strip.
          xTo(-(pointerX / window.innerWidth) * maxShift);
          previewXTo(previewX());
        };

        // The strip keeps its offset on leave, as on the reference.
        const onLeave = () => {
          gsap.ticker.remove(syncTile);
          gsap.to(previewEl, { autoAlpha: 0, scale: 0.96, duration: 0.25, ease: "power2.out", overwrite: "auto" });
        };

        stripEl.addEventListener("pointerenter", onEnter);
        stripEl.addEventListener("pointermove", onMove);
        stripEl.addEventListener("pointerleave", onLeave);
        return () => {
          gsap.ticker.remove(syncTile);
          stripEl.removeEventListener("pointerenter", onEnter);
          stripEl.removeEventListener("pointermove", onMove);
          stripEl.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col gap-4 pb-16 md:pb-24">
      <div className="px-6 md:px-section-x">
        <div className="mx-auto flex max-w-[1761px] items-end justify-between gap-3 md:grid md:grid-cols-[200px_minmax(0,1fr)_max-content] md:gap-2">
          <a
            href={href}
            className="min-w-0 text-sub-1 tracking-tight-2 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tiny-black md:text-[1.25rem] md:leading-[1.1] md:tracking-[-0.6px]"
          >
            <span data-reveal="" className="block truncate">
              {project.client}
            </span>
          </a>
          <p className="hidden min-w-0 text-[1.25rem] leading-[1.1] tracking-[-0.6px] text-tiny-muted md:block">
            <span data-reveal="" className="block truncate">
              {project.tagline}
            </span>
          </p>
          <div className="flex items-center justify-end gap-8 text-[0.625rem] leading-[1.2]">
            <p className="hidden whitespace-nowrap md:block md:min-w-[150px]">
              <span data-reveal="" className="block">
                <span className="text-tiny-black/40">Feeling</span> {project.feeling}
              </span>
            </p>
            <p className="whitespace-nowrap md:min-w-[170px]">
              <span data-reveal="" className="block">
                <span className="text-tiny-black/30">Industry</span> {project.industry}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div ref={strip} className="relative">
        {/* Mobile: native horizontal swipe. md+: clipped, and the track is scrubbed by the pointer instead. */}
        <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [contain:layout_paint] [scrollbar-width:none] md:overflow-hidden [&::-webkit-scrollbar]:hidden">
          <div ref={track} className="flex w-max items-center gap-1.5 will-change-transform md:gap-2">
            {Array.from({ length: project.repeats }, (_, copy) =>
              project.tiles.map((tile, i) => (
                // The header link is the one accessible link per project; tiles are pointer shortcuts.
                <a
                  key={`${copy}-${i}`}
                  href={href}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="relative h-[50px] shrink-0 overflow-hidden md:h-[80px]"
                  style={{ aspectRatio: tile[1] }}
                >
                  {near && (
                    <FadeImage
                      src={tileSrc(tile[0])}
                      alt=""
                      fill
                      loading="eager"
                      sizes="(max-width: 768px) 120px, 160px"
                      className="object-cover"
                    />
                  )}
                </a>
              )),
            )}
          </div>
        </div>
        <FilmstripPreview ref={preview} client={project.client} />
      </div>
    </div>
  );
}

// Filmstrip view: one row per case study with a pointer-scrubbed strip of its imagery.
export function WorkFilmstrip() {
  return (
    <section aria-label="Work filmstrip" className="border-b border-tiny-black pb-28 md:pb-36 md:pt-10">
      <h2 className="sr-only">Case studies</h2>
      <div className="flex flex-col gap-24 md:gap-32">
        {FILMSTRIP.map((project) => (
          <FilmstripRow key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
