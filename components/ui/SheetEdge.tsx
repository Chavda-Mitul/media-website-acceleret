// A chapter edge: the next tone's sheet arrives with rounded top corners over the previous one.
// It's a plain strip in normal flow, so it never shifts a neighbour's sticky track or ScrollTrigger range.
const TONES = {
  ink: "bg-tiny-black",
  paper: "bg-tiny-white",
} as const;

export type SheetTone = keyof typeof TONES;

type SheetEdgeProps = {
  from: SheetTone;
  to: SheetTone;
  /** Mark dark strips for the navbar's frosted pills (see Navbar), so the pill doesn't blink between dark sections. */
  navMarker?: boolean;
  className?: string;
};

export function SheetEdge({ from, to, navMarker = true, className = "" }: SheetEdgeProps) {
  return (
    <div
      aria-hidden="true"
      data-nav-theme={navMarker && to === "ink" ? "media" : undefined}
      // 1px overlaps on both sides hide sub-pixel seams (the radius is fluid, so the strip's height is fractional).
      className={`relative -my-px ${TONES[from]} ${className}`}
    >
      <div className={`h-(--radius-sheet) rounded-t-sheet ${TONES[to]}`} />
    </div>
  );
}
