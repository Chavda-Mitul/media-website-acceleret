import { Fragment } from "react";

type MaskedWordsProps = {
  text: string;
  /** Attribute placed on each inner word span, used as the GSAP target. */
  target: string;
};

// Splits text into words, each clipped by its own mask so it can slide in from below.
// Words start hidden via the [data-mask-word] rule in globals.css; GSAP animates yPercent to 0.
export function MaskedWords({ text, target }: MaskedWordsProps) {
  const words = text.split(" ");

  return words.map((word, i) => (
    <Fragment key={i}>
      <span className="-mb-[0.1em] inline-block overflow-hidden pb-[0.1em] align-bottom">
        <span data-mask-word="" {...{ [target]: "" }} className="inline-block">
          {word}
        </span>
      </span>
      {i < words.length - 1 && " "}
    </Fragment>
  ));
}
