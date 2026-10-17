"use client";

import { useRef, type ReactNode } from "react";
import { useStaggerReveal } from "@/lib/reveal";

// Lets server-rendered content use the [data-reveal] fade-up (lib/reveal.ts) without becoming a client component.
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useStaggerReveal(root);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
