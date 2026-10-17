import type { ElementType, HTMLAttributes, ReactNode } from "react";

/** The one section label: a small plain caption (the site's original "Our services" style). Colour follows the text. */
export const SECTION_LABEL = "block font-sans text-cap-2 font-medium tracking-tight-1";

type SectionLabelProps = { as?: ElementType; children: ReactNode } & HTMLAttributes<HTMLElement>;

// Rendered as an h2 it still keeps these utilities: they win over the base heading rule in globals.css.
export function SectionLabel({ as: Tag = "p", className = "", children, ...rest }: SectionLabelProps) {
  return (
    <Tag className={`${SECTION_LABEL} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
