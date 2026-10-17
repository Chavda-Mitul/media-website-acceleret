"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

// Drives Lenis from GSAP's ticker (one RAF loop) and keeps ScrollTrigger in sync.
function GsapLenisBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const offScroll = lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.refresh();

    return () => {
      offScroll();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

// Client navigations swap the page under a persistent Lenis instance. Re-sync it to wherever the router left
// the window (top for a push, the restored position for back/forward), so a smooth scroll still in flight
// can't carry the old page's target onto the new one, and re-measure the new page's triggers.
function RouteScrollSync() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    lenis.resize();
    ScrollTrigger.refresh();
  }, [lenis, pathname]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: !reducedMotion,
      }}
    >
      <GsapLenisBridge />
      <RouteScrollSync />
      {children}
    </ReactLenis>
  );
}
