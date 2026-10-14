"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { EASE_REVEAL } from "@/lib/motion";
import { formatNewsDate, NEWS, NEWS_HEADING, NEWS_INTRO, NEWS_MORE } from "@/lib/content/news";
import { BentArrow } from "@/components/ui/BentArrow";

export function NewsSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Heading + intro unmask line by line (re-split on resize / font load).
        q<HTMLElement>("[data-news-lines]").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: EASE_REVEAL,
                stagger: 0.08,
                force3D: true,
                scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
              }),
          });
        });

        gsap.from(q("[data-news-more]"), {
          autoAlpha: 0,
          y: 16,
          duration: 0.8,
          ease: EASE_REVEAL,
          delay: 0.2,
          scrollTrigger: { trigger: q("[data-news-more]")[0], start: "top 90%", toggleActions: "play none none reverse" },
        });

        // Rows fade + rise in, staggered by whichever ones enter together.
        const rows = q<HTMLElement>("[data-news-row]");
        gsap.set(rows, { autoAlpha: 0, y: 48 });
        ScrollTrigger.batch(rows, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: EASE_REVEAL, stagger: 0.1, force3D: true }),
        });

        // Images drift inside their frames as rows cross the viewport.
        q<HTMLElement>("[data-news-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -8, scale: 1.2 },
            {
              yPercent: 8,
              scale: 1.2,
              ease: "none",
              force3D: true,
              scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="news" aria-label="News" className="relative isolate z-0 w-full overflow-x-clip bg-tiny-white">
      <div className="w-full px-6 py-20 md:px-section-x md:py-32">
        <h2
          data-news-lines=""
          className="mx-auto max-w-[120rem] font-display text-showcase font-semibold uppercase"
        >
          {NEWS_HEADING}
        </h2>
      </div>

      <div className="border-b border-tiny-black px-6 pb-20 md:px-section-x md:pb-32">
        <div aria-hidden="true" className="relative left-1/2 h-px w-dvw max-w-none -translate-x-1/2 bg-black/10" />

        <div className="mx-auto mt-8 flex max-w-[120rem] flex-col gap-10 md:flex-row md:gap-0">
          {/* Intro sticks beside the list while it scrolls (clears the 64px navbar) */}
          <div className="shrink-0 md:sticky md:top-24 md:w-85 md:self-start">
            <p data-news-lines="" className="font-serif text-[1.5rem] leading-[1.2] tracking-tight-2">
              {NEWS_INTRO}
            </p>
            <a
              href={NEWS_MORE.href}
              data-news-more=""
              className="group mt-6 inline-flex items-center gap-2 text-cap-1 leading-none tracking-tight-1 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <BentArrow size="sm" />
              <span className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-[scale] after:duration-500 after:ease-out-cubic group-hover:after:scale-x-100">
                {NEWS_MORE.label}
              </span>
            </a>
          </div>

          <ul className="flex min-w-0 flex-1 flex-col">
            {NEWS.map((item) => (
              <li key={item.title} data-news-row="">
                <a
                  href={item.href}
                  className="group block min-w-0 rounded-sm py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tiny-black md:py-5"
                >
                  <article className="flex min-w-0 flex-col md:flex-row md:items-start">
                    <div aria-hidden="true" className="hidden shrink-0 md:block md:w-[8.9375rem]" />
                    <div className="relative aspect-[313/346] w-full shrink-0 overflow-hidden rounded-sm bg-tiny-white [clip-path:inset(0_round_4px)] transition-[clip-path] duration-500 ease-out-cubic group-hover:[clip-path:inset(4px_round_4px)] md:aspect-auto md:h-86.5 md:w-78.25">
                      <div data-news-parallax="" className="absolute inset-0 will-change-transform">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 313px, 100vw"
                          className="object-cover transition-[scale] duration-700 ease-out-cubic group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 pt-3 md:pl-8 md:pt-1">
                      <p className="flex items-center gap-4 text-[0.75rem] capitalize leading-[1.2] tracking-tight-1">
                        <span>{item.category}</span>
                        <time dateTime={item.date} className="opacity-50">
                          {formatNewsDate(item.date)}
                        </time>
                      </p>
                      <h3 className="mt-3 max-w-90 text-[1.125rem] leading-[1.2] tracking-tight-2">{item.title}</h3>
                    </div>
                  </article>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
