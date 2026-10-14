"use client";

import Image, { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { STICKERS } from "@/lib/content/stickers";

const SIZES = "(min-width: 768px) 380px, 45vw";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type Stamp = { id: number; index: number; x: number; y: number; w: number; h: number; leaving: boolean };

/** Longest side of a stamped sticker: ~24% of the footer width on desktop (≈340px at 1440), 45% on mobile. */
function stampSize(index: number, hostWidth: number) {
  const { width, height } = STICKERS[index];
  const longest = hostWidth < 768 ? hostWidth * 0.45 : gsap.utils.clamp(200, 380, hostWidth * 0.24);
  const k = longest / Math.max(width, height);
  return { w: width * k, h: height * k };
}

/** Warms the browser cache with the exact srcset candidate <Image> will request, so the stamp appears instantly. */
function preload(index: number) {
  const { src, width, height } = STICKERS[index];
  const { props } = getImageProps({ src, width, height, alt: "", sizes: SIZES });
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}

function StampSticker({ stamp, onGone }: { stamp: Stamp; onGone: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const sticker = STICKERS[stamp.index];

  // Pop in once the artwork has loaded (instant when it was preloaded).
  const appear = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCED_MOTION).matches) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      el,
      { autoAlpha: 0, scale: 0.6, rotation: -10 },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.55, ease: "back.out(1.7)", force3D: true },
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!stamp.leaving || !el) return;
    const tween = gsap.to(el, {
      autoAlpha: 0,
      scale: 0.85,
      duration: window.matchMedia(REDUCED_MOTION).matches ? 0 : 0.25,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => onGone(stamp.id),
    });
    return () => {
      tween.kill();
    };
  }, [stamp.leaving, stamp.id, onGone]);

  return (
    <div
      ref={ref}
      className="invisible absolute will-change-transform"
      style={{ left: stamp.x - stamp.w / 2, top: stamp.y - stamp.h / 2, width: stamp.w, height: stamp.h }}
    >
      <Image
        src={sticker.src}
        alt=""
        fill
        sizes={SIZES}
        draggable={false}
        onLoad={appear}
        className="object-contain"
      />
    </div>
  );
}

// Click-to-stamp easter egg (as on the reference site): clicking empty footer space stamps the next
// sticker at the cursor, replacing the previous one and cycling through every design.
export function StickerStamps() {
  const layer = useRef<HTMLDivElement>(null);
  const nextIndex = useRef(0);
  const nextId = useRef(0);
  const [stamps, setStamps] = useState<Stamp[]>([]);

  const removeStamp = useCallback((id: number) => {
    setStamps((current) => current.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    const host = layer.current?.parentElement;
    if (!host) return;
    preload(0);

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;
      // Leave links/buttons alone, and don't stamp at the end of a text selection.
      if (target.closest("a, button, input, textarea, select, label")) return;
      if (window.getSelection()?.toString()) return;

      const rect = host.getBoundingClientRect();
      const index = nextIndex.current;
      nextIndex.current = (index + 1) % STICKERS.length;
      const { w, h } = stampSize(index, rect.width);
      const x = gsap.utils.clamp(w / 2, rect.width - w / 2, event.clientX - rect.left);
      const y = gsap.utils.clamp(h / 2, rect.height - h / 2, event.clientY - rect.top);

      setStamps((current) => [
        ...current.map((s) => ({ ...s, leaving: true })),
        { id: ++nextId.current, index, x, y, w, h, leaving: false },
      ]);
      preload(nextIndex.current);
    };

    host.addEventListener("click", onClick);
    return () => host.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={layer} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {stamps.map((stamp) => (
        <StampSticker key={stamp.id} stamp={stamp} onGone={removeStamp} />
      ))}
    </div>
  );
}
