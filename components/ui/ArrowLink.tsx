import type { AnchorHTMLAttributes, ReactNode } from "react";
import { BentArrow } from "@/components/ui/BentArrow";

// The site's one link underline: a hairline drawn in from the left.
const LINE =
  "relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-[scale] after:duration-500 after:ease-out-cubic";

/** Underline drawn in when the parent `.group` is hovered or keyboard-focused. */
export const UNDERLINE = `${LINE} group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100`;

/** The same underline on a link that is its own hover target. */
export const UNDERLINE_SELF = `${LINE} hover:after:scale-x-100 focus-visible:after:scale-x-100`;

const SIZES = {
  md: { link: "gap-2 font-sans text-cap-1 font-medium tracking-tight-1", arrow: "sm" },
  lg: { link: "gap-3 font-display text-display-3 font-semibold", arrow: "lg" },
} as const;

type ArrowLinkProps = {
  size?: keyof typeof SIZES;
  /** Rendered after the underlined label (e.g. a count). */
  aside?: ReactNode;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">;

/** Secondary call to action: the bent "↳" arrow plus an underlined label. Colour follows the text. */
export function ArrowLink({ size = "md", aside, children, className = "", ...rest }: ArrowLinkProps) {
  const s = SIZES[size];
  return (
    <a
      className={`group inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${s.link} ${className}`}
      {...rest}
    >
      <BentArrow size={s.arrow} />
      <span className={UNDERLINE}>{children}</span>
      {aside}
    </a>
  );
}
