import type { CSSProperties } from "react";

// The reference's "↳" arrow: on hover of the parent `.group`, the head slides right and the
// shaft stretches to meet it. Geometry from the reference; animated with CSS transforms.
const VARIANTS = {
  lg: {
    viewBox: "0 0 30.6822 21.2627",
    strokeWidth: 3,
    stem: "M1.5 1.5V11.5006",
    shaft: "M1.5 11.5006H15.3542",
    head: "M10.5195 5.17969L17.097 11.411L10.5195 17.6422",
    headShift: 10.81,
    shaftScale: 1.805,
    // Sized to a 24px line like the reference (0.9 → 1.45 line-heights wide).
    wrapper: "w-[1.35rem] group-hover:w-[2.175rem]",
    svg: "h-6 w-auto",
  },
  sm: {
    viewBox: "0 0 12 11",
    strokeWidth: 1.2,
    stem: "M1 0.600098V5.50938",
    shaft: "M1 5.50938H9.75",
    head: "M6.69531 1.29541L10.8495 5.44959L6.69531 9.60376",
    headShift: 8,
    shaftScale: 1.943,
    wrapper: "w-3 group-hover:w-[1.2rem]",
    svg: "h-[1lh] w-3",
  },
} as const;

const MOTION = "transition-[translate,scale] duration-500 ease-out-cubic";

export function BentArrow({ size = "lg" }: { size?: keyof typeof VARIANTS }) {
  const v = VARIANTS[size];
  const vars = { "--head-shift": `${v.headShift}px`, "--shaft-scale": v.shaftScale } as CSSProperties;

  return (
    <span className={`inline-flex shrink-0 transition-[width] duration-500 ease-out-cubic ${v.wrapper}`}>
      <svg
        viewBox={v.viewBox}
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={`block shrink-0 overflow-visible ${v.svg}`}
        style={vars}
      >
        <g stroke="currentColor" strokeWidth={v.strokeWidth} strokeLinecap="square">
          <path d={v.stem} />
          <path d={v.shaft} className={`origin-left [transform-box:fill-box] group-hover:scale-x-(--shaft-scale) ${MOTION}`} />
          <path d={v.head} className={`group-hover:translate-x-(--head-shift) ${MOTION}`} />
        </g>
      </svg>
    </span>
  );
}
