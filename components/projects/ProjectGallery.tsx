"use client";

import { useRef } from "react";
import { gsap, Draggable, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import type { Project } from "@/lib/content/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CursorBubble } from "@/components/ui/CursorBubble";

/** Image overscan on each side for the horizontal parallax (fraction of the frame width), see ProjectCard. */
const PARALLAX = 0.1;
/** A click this soon (ms) after a drag ends is the drag's release, not a click on the card. */
const CLICK_AFTER_DRAG = 80;

const pad = (n: number) => String(n).padStart(2, "0");

function Arrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 ${flip ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8h12M9 3l5 5-5 5" />
    </svg>
  );
}

// /work gallery: a drag carousel (GSAP Draggable + inertia, the CategoryShowcase pattern) of project cards,
// with prev/next buttons, a position counter and a cursor "View" bubble.
export function ProjectGallery({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const row = rowRef.current!;
      const track = trackRef.current!;
      const counter = counterRef.current!;
      const prev = prevRef.current!;
      const next = nextRef.current!;
      const q = gsap.utils.selector(root);
      const cards = q<HTMLElement>("[data-project-card]");
      const media = q<HTMLElement>("[data-project-card] [data-project-media]");
      // xPercent is relative to the media element, which is (1 + 2·PARALLAX) × the frame width.
      const maxShift = (PARALLAX / (1 + 2 * PARALLAX)) * 100;
      const setMediaX = media.map((el) => gsap.quickSetter(el, "xPercent"));
      gsap.set(media, { force3D: true });

      const padLeft = () => parseFloat(getComputedStyle(track).paddingLeft);
      /** Track x that puts card `i` at the row's left padding. */
      const xFor = (i: number) => gsap.utils.clamp(drag.minX, drag.maxX, -(cards[i].offsetLeft - padLeft()));

      let active = -1;
      // Counter + button states follow the card nearest the left edge. Written to the DOM directly
      // so dragging never re-renders React.
      const sync = () => {
        const x = gsap.getProperty(track, "x") as number;
        let nearest = 0;
        cards.forEach((card, i) => {
          if (Math.abs(card.offsetLeft - padLeft() + x) < Math.abs(cards[nearest].offsetLeft - padLeft() + x)) nearest = i;
        });
        // At the right bound the last cards can't reach the left edge; count the last one as current.
        if (x <= drag.minX + 1) nearest = cards.length - 1;
        if (nearest !== active) {
          active = nearest;
          counter.textContent = pad(nearest + 1);
        }
        prev.disabled = x >= drag.maxX - 1;
        next.disabled = x <= drag.minX + 1;
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
      const update = () => {
        parallax();
        sync();
      };

      let dragEndedAt = 0;
      const [drag] = Draggable.create(track, {
        type: "x",
        bounds: row,
        inertia: true,
        edgeResistance: 0.85,
        // Vertical swipes keep scrolling the page natively.
        allowNativeTouchScrolling: true,
        dragClickables: true,
        zIndexBoost: false,
        onDrag: update,
        onThrowUpdate: update,
        onDragEnd: () => {
          dragEndedAt = performance.now();
        },
      });

      // Releasing a drag over a card must not open it.
      const onClickCapture = (event: MouseEvent) => {
        if (performance.now() - dragEndedAt < CLICK_AFTER_DRAG) {
          event.preventDefault();
          event.stopPropagation();
        }
      };
      row.addEventListener("click", onClickCapture, true);

      const glideTo = (x: number) =>
        gsap.to(track, {
          x,
          duration: 0.8,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => {
            drag.update();
            update();
          },
        });

      const refresh = () => {
        drag.applyBounds(row);
        update();
      };
      const ro = new ResizeObserver(refresh);
      ro.observe(row);
      refresh();

      const step = (dir: 1 | -1) => () => glideTo(xFor(gsap.utils.clamp(0, cards.length - 1, active + dir)));
      const onPrev = step(-1);
      const onNext = step(1);
      prev.addEventListener("click", onPrev);
      next.addEventListener("click", onNext);

      // Keyboard: bring a focused card into view by gliding the track (the row clips, never scrolls).
      // Keyboard only: a mouse click also focuses the card, and gliding then would move it mid-morph.
      const onFocusIn = (event: FocusEvent) => {
        const card = (event.target as HTMLElement).closest<HTMLElement>("[data-project-card]");
        if (card?.matches(":focus-visible")) glideTo(xFor(cards.indexOf(card)));
      };
      row.addEventListener("focusin", onFocusIn);

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(cards, {
          autoAlpha: 0,
          x: 120,
          duration: 1.2,
          ease: EASE_REVEAL,
          stagger: 0.07,
          force3D: true,
          scrollTrigger: { trigger: row, start: "top 85%" },
        });
      });

      return () => {
        ro.disconnect();
        row.removeEventListener("click", onClickCapture, true);
        row.removeEventListener("focusin", onFocusIn);
        prev.removeEventListener("click", onPrev);
        next.removeEventListener("click", onNext);
        // Glides start from event handlers, outside this context, so they aren't reverted with it.
        gsap.killTweensOf(track);
        drag.kill();
      };
    },
    { scope: root },
  );

  const button =
    "flex size-12 cursor-pointer items-center justify-center rounded-full bg-tiny-pill transition-[background-color,opacity] duration-300 hover:bg-tiny-pill-hover disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <section ref={root} aria-label="Projects" className="relative w-full pb-24 md:pb-40">
      <div className="flex items-end justify-between gap-6 px-6 md:px-section-x">
        <p className="font-serif text-tagline tracking-tight-1">Selected projects</p>
        <div className="flex items-center gap-5">
          <p className="text-cap-1 font-medium tabular-nums tracking-tight-1">
            <span ref={counterRef}>01</span>
            <span className="text-tiny-muted"> / {pad(projects.length)}</span>
          </p>
          <div className="flex gap-2">
            <button ref={prevRef} type="button" aria-label="Previous project" className={button}>
              <Arrow flip />
            </button>
            <button ref={nextRef} type="button" aria-label="Next project" className={button}>
              <Arrow />
            </button>
          </div>
        </div>
      </div>

      {/* Drag carousel: the row clips, the track is dragged (with inertia) by GSAP Draggable */}
      <div ref={rowRef} role="region" aria-label="Projects carousel" className="mt-8 select-none overflow-x-clip md:mt-12">
        <div ref={trackRef} className="relative flex w-max gap-4 px-6 will-change-transform md:gap-6 md:px-section-x">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>

      <CursorBubble scope={rowRef} target="[data-project-card]" label="View" />
    </section>
  );
}
