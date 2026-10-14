import Link from "next/link";

// Placeholder wordmark mirroring the reference's two-line lockup (small overline + wordmark).
// Swap LogoMark's contents for the real SVG logo when it exists.
// InitialLoader flies a copy of LogoMark into the nav, so both must keep the same box.
export function LogoMark() {
  return (
    <span aria-hidden="true" className="block font-display font-semibold uppercase leading-none">
      <span className="block text-[0.4375rem] tracking-tight-1">Studio</span>
      <span className="block text-[1rem] tracking-tight-3 sm:text-[1.1875rem]">Media</span>
    </span>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Home"
      className="block shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <LogoMark />
    </Link>
  );
}
