"use client";

import { useEffect, useRef } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type WorkVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

/** Muted loop that only plays while on screen (and never for reduced-motion users). */
export function WorkVideo({ src, poster, className = "absolute inset-0 h-full w-full object-cover" }: WorkVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia(REDUCED_MOTION).matches) return;
    video.muted = true;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={className}
    />
  );
}
