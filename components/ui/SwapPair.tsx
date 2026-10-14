"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";

/** Flex-grow ratio of the large and small slots (837px / 412px at 1440). */
const GROW = { large: 1169, small: 576 } as const;
/** Large slot as a share of the row width (excluding the 1rem gap). */
const LARGE_SHARE = GROW.large / (GROW.large + GROW.small);
/** Caption block under each card: 1rem top padding + two 1.1-leading lines. */
const CAPTION_H = "3.2rem";

const SWAP_QUERY = "(min-width: 768px) and (hover: hover)";

type SwapPairProps = {
  items: [ReactNode, ReactNode];
  /** CSS aspect-ratio of each card's media ("w / h"). */
  aspects: [string, string];
  largeIndex: 0 | 1;
};

const ratioOf = (aspect: string) => {
  const [w, h] = aspect.split("/").map(Number);
  return w / h;
};

// Two cards sharing a row. On desktop the hovered card takes the large slot (the reference's swap);
// leaving the row restores the default. Stacks on mobile.
// The row reserves its tallest state (whichever card is taller at the large width) so the swap never
// moves the page. 100cqw is the width of the nearest inline-size container: the parent column.
export function SwapPair({ items, aspects, largeIndex }: SwapPairProps) {
  const root = useRef<HTMLDivElement>(null);
  const tallest = Math.max(...aspects.map((aspect) => 1 / ratioOf(aspect)));
  const minHeight = `calc((100cqw - 1rem) * ${(LARGE_SHARE * tallest).toFixed(5)} + ${CAPTION_H})`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(SWAP_QUERY, () => {
        const row = root.current!;
        const cells = gsap.utils.toArray<HTMLElement>("[data-pair-cell]", row);

        const makeLarge = (large: number) =>
          cells.forEach((cell, i) =>
            gsap.to(cell, {
              flexGrow: i === large ? GROW.large : GROW.small,
              duration: 0.65,
              ease: EASE_REVEAL,
              overwrite: true,
            }),
          );

        const onCellEnter = cells.map((_, i) => () => makeLarge(i));
        const onRowLeave = () => makeLarge(largeIndex);

        cells.forEach((cell, i) => cell.addEventListener("pointerenter", onCellEnter[i]));
        row.addEventListener("pointerleave", onRowLeave);
        return () => {
          cells.forEach((cell, i) => cell.removeEventListener("pointerenter", onCellEnter[i]));
          row.removeEventListener("pointerleave", onRowLeave);
          gsap.killTweensOf(cells);
          gsap.set(cells, { clearProps: "flexGrow" });
        };
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="flex flex-col gap-10 md:min-h-(--pair-min-h) md:flex-row md:items-start md:gap-4"
      style={{ "--pair-min-h": minHeight } as CSSProperties}
    >
      {items.map((item, i) => (
        <div
          key={i}
          data-pair-cell=""
          className={`min-w-0 md:basis-0 ${i === largeIndex ? "md:grow-[1169]" : "md:grow-[576]"}`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
