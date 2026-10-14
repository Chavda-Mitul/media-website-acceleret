import type { ReactNode } from "react";
import { getImageProps } from "next/image";
import { FadeImage } from "@/components/ui/FadeImage";
import { SwapPair } from "@/components/ui/SwapPair";
import { WorkVideo } from "@/components/ui/WorkVideo";
import type { WorkMedia } from "@/lib/content/work";
import { FEATURED_ROWS, SNAPSHOTS, WORK_GRID, type FeaturedCard, type IndexCard } from "@/lib/content/workIndex";
import { caseStudyHref } from "@/lib/navigation";

const SIZES = {
  large: "(min-width: 768px) 58vw, 100vw",
  small: "(min-width: 768px) 29vw, 100vw",
} as const;

/** Grid + Snapshots share one frame: 3:2, cropped (the reference ignores each source's ratio here). */
const GRID_ASPECT = "3 / 2";
const GRID = "grid grid-cols-1 items-start gap-10 md:grid-cols-3 md:gap-x-4 md:gap-y-[178px]";
const CAPTION = "pt-4 text-sub-2 tracking-tight-2";

/**
 * Video posters are 1–4K originals; route them through the image optimizer too.
 * getImageProps' src is its 2x candidate, so `cssWidth` 540 → 1080w and 960 → 1920w.
 */
function posterSrc(src: string, cssWidth: number) {
  return getImageProps({ src, alt: "", width: cssWidth, height: cssWidth }).props.src;
}

function MediaFrame({
  media,
  aspect,
  sizes,
  posterWidth,
  eager = false,
}: {
  media: WorkMedia;
  aspect: string;
  sizes: string;
  posterWidth: number;
  /** Above the fold (the first featured row holds the LCP image). */
  eager?: boolean;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-[#141414]" style={{ aspectRatio: aspect }}>
      {media.type === "video" ? (
        <WorkVideo src={media.src} poster={posterSrc(media.poster, posterWidth)} />
      ) : (
        // Decorative: the caption beside it names the work.
        <FadeImage
          src={media.src}
          alt=""
          fill
          sizes={sizes}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
          className="object-cover"
        />
      )}
    </div>
  );
}

/** One caption line. The reveal sits on the inner span so its inline opacity never fights the hover dim. */
function CaptionLine({ children, className = "", lineClassName = "" }: { children: string; className?: string; lineClassName?: string }) {
  return (
    <p className={`transition-opacity group-hover:opacity-70 ${className}`}>
      <span data-reveal="" className={`block ${lineClassName}`}>
        {children}
      </span>
    </p>
  );
}

function CaseStudyCard({
  card,
  aspect,
  sizes,
  posterWidth,
  featured = false,
  eager = false,
}: {
  card: IndexCard;
  aspect: string;
  sizes: string;
  posterWidth: number;
  featured?: boolean;
  eager?: boolean;
}) {
  return (
    <a
      href={caseStudyHref(card.slug)}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tiny-black"
    >
      <article className="flex flex-col">
        <MediaFrame media={card.media} aspect={aspect} sizes={sizes} posterWidth={posterWidth} eager={eager} />
        {/* Featured captions sit in a narrow column: one truncated name, one unwrapped title. */}
        <div className={`${CAPTION} ${featured ? "max-w-[249px]" : ""}`}>
          <CaptionLine lineClassName={featured ? "truncate" : "break-words"}>{card.client}</CaptionLine>
          {card.title && (
            <CaptionLine className="text-tiny-muted" lineClassName={featured ? "whitespace-nowrap" : "break-words text-pretty"}>
              {card.title}
            </CaptionLine>
          )}
        </div>
      </article>
    </a>
  );
}

/** Large + small card sharing a row, top-aligned; hovering either one gives it the large slot. */
function FeaturedPair({ row, eager = false }: { row: [FeaturedCard, FeaturedCard]; eager?: boolean }) {
  const cards = row.map((card) => (
    // Either card can take the large slot, so both load at the large size.
    <CaseStudyCard
      key={card.slug}
      card={card}
      aspect={card.aspect}
      sizes={SIZES.large}
      posterWidth={960}
      featured
      eager={eager}
    />
  )) as [ReactNode, ReactNode];

  return (
    <SwapPair
      items={cards}
      aspects={[row[0].aspect, row[1].aspect]}
      largeIndex={row[0].size === "large" ? 0 : 1}
    />
  );
}

// Grid view: featured pairs, the case-study grid, then a hairline and the unlinked Snapshot archive.
export function WorkGrid() {
  return (
    <section aria-label="Work" className="border-b border-tiny-black pb-28 md:pb-36">
      <h2 className="sr-only">Case studies</h2>
      <div className="px-6 md:px-section-x">
        <div className="mx-auto flex max-w-[1761px] flex-col gap-10 [container-type:inline-size] md:gap-[178px]">
          {FEATURED_ROWS.map((row, i) => (
            <FeaturedPair key={row[0].slug} row={row} eager={i === 0} />
          ))}
          <div className={GRID}>
            {WORK_GRID.map((card) => (
              <CaseStudyCard key={card.slug} card={card} aspect={GRID_ASPECT} sizes={SIZES.small} posterWidth={540} />
            ))}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="mt-10 h-px w-full bg-tiny-black/10 md:mt-[178px]" />

      <div className="px-6 pt-20 md:px-section-x md:pt-[178px]">
        <h2 className="sr-only">Snapshots</h2>
        <div className={`mx-auto max-w-[1761px] ${GRID}`}>
          {SNAPSHOTS.map((snap) => (
            <article key={snap.client} className="flex min-w-0 flex-col">
              <MediaFrame media={snap.media} aspect={GRID_ASPECT} sizes={SIZES.small} posterWidth={540} />
              <div className={`flex items-end justify-between gap-4 ${CAPTION}`}>
                <p className="min-w-0 flex-1 break-words">
                  <span data-reveal="" className="block">
                    {snap.client}
                  </span>
                </p>
                <p aria-hidden="true" className="shrink-0 text-right text-tiny-muted">
                  <span data-reveal="" className="block">
                    Snapshot
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
