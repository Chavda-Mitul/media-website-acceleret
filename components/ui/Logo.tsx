import Link from "next/link";
import { preload } from "react-dom";
import type { CSSProperties } from "react";

// The "A + play" mark from public/AM.png, split into two transparent layers of the same size.
const MARK_A = "/brand/am-mark-a.png";
const MARK_PLAY = "/brand/am-mark-play.png";
const MASK = "absolute inset-0 bg-current [mask:var(--logo)_center/contain_no-repeat]";

/** Acceleret Media mark. The A takes the text colour; the play keeps its blue unless `mono`. Size it by height. */
export function BrandMark({ mono = false, className = "" }: { mono?: boolean; className?: string }) {
  // The loader shows the mark on first paint, so fetch both layers early.
  preload(MARK_A, { as: "image" });
  preload(MARK_PLAY, { as: "image" });
  return (
    <span aria-hidden="true" className={`relative block aspect-[469/384] ${className}`}>
      <span className={MASK} style={{ "--logo": `url(${MARK_A})` } as CSSProperties} />
      {mono ? (
        <span className={MASK} style={{ "--logo": `url(${MARK_PLAY})` } as CSSProperties} />
      ) : (
        <span className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${MARK_PLAY})` }} />
      )}
    </span>
  );
}

// Mark + two-line wordmark, after the AM.png lockup ("Acceleret" over a spaced-out "MEDIA").
// InitialLoader flies a copy of LogoMark into the nav, so both must keep the same box.
export function LogoMark() {
  return (
    <span aria-hidden="true" className="flex items-center gap-1.5 font-display leading-none">
      <BrandMark className="h-6 sm:h-7" />
      <span className="block">
        <span className="block text-[0.9375rem] font-semibold tracking-tight-3 sm:text-[1.125rem]">Acceleret</span>
        {/* Letters spread to the width of "Acceleret", as in the logo. */}
        <span className="mt-0.5 flex justify-between text-[0.4375rem] font-medium sm:text-[0.5rem]">
          {"MEDIA".split("").map((char, i) => (
            <span key={i}>{char}</span>
          ))}
        </span>
      </span>
    </span>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Acceleret Media home"
      className="block shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <LogoMark />
    </Link>
  );
}
