import Link from "next/link";
import type { ReactNode } from "react";
import type { Project } from "@/lib/content/projects";
import { NextProject } from "@/components/projects/NextProject";
import { ProjectBlocks } from "@/components/projects/ProjectBlocks";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectStatement } from "@/components/projects/ProjectStatement";
import { RevealGroup } from "@/components/projects/RevealGroup";

const LABEL = "text-cap-1 font-medium tracking-tight-1 text-tiny-muted";

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div data-reveal="" className="flex flex-col gap-2">
      <dt className={LABEL}>{label}</dt>
      <dd className="text-sub-1 font-medium leading-[1.3] tracking-tight-2">{children}</dd>
    </div>
  );
}

// Case-study page body for any project: hero, facts, testimonial + deliverables, the brief, imagery,
// then "Keep scrolling" into `next`. All content comes from lib/content/projects.ts.
export function ProjectTemplate({ project, next }: { project: Project; next: Project }) {
  return (
    <>
      <Link
        href="/work"
        aria-label="Back to all work"
        className="fixed left-3 top-17 z-40 flex size-11 items-center justify-center rounded-full bg-tiny-black text-tiny-white transition-transform duration-300 ease-out-cubic hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 sm:left-4 sm:top-20 md:top-auto md:bottom-10 md:left-10 md:size-14"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M14 8H2M7 3 2 8l5 5" />
        </svg>
      </Link>

      <ProjectHero project={project} />

      <RevealGroup>
        <section aria-label="Project details" className="px-6 pt-16 md:px-section-x md:pt-24">
          <div className="mx-auto max-w-[1761px]">
            <div className="h-px w-full bg-tiny-faint" />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 pt-8 md:grid-cols-[repeat(5,1fr)_auto] md:items-start md:gap-10 md:pt-10">
              <MetaItem label="Client">{project.client}</MetaItem>
              <MetaItem label="Industry">{project.industry}</MetaItem>
              <MetaItem label="Year">{project.year}</MetaItem>
              <MetaItem label="Timeline">{project.duration}</MetaItem>
              <MetaItem label="Services">
                <ul>
                  {project.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </MetaItem>
              {project.website && (
                <div data-reveal="" className="col-span-2 md:col-span-1">
                  <a
                    href={project.website}
                    className="inline-flex items-center gap-2 rounded-full bg-tiny-black px-5 py-3 text-cap-1 font-medium tracking-tight-1 text-tiny-white transition-opacity duration-300 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Visit website
                    <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M3 9 9 3M4 3h5v5" />
                    </svg>
                  </a>
                </div>
              )}
            </dl>
          </div>
        </section>

        <section aria-label="Testimonial and deliverables" className="px-3 pt-16 sm:px-4 md:pt-24">
          <div className="grid gap-3 md:grid-cols-[3fr_2fr] md:gap-4">
            <figure data-reveal="" className="flex flex-col justify-between gap-10 rounded-lg bg-tiny-black p-8 text-tiny-white md:p-12">
              <blockquote className="font-serif text-serif-md leading-[1.2] md:text-serif-lg md:leading-[1.15]">
                &ldquo;{project.testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 text-cap-1 tracking-tight-1">
                <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-tiny-brand font-medium">
                  {project.testimonial.name.charAt(0)}
                </span>
                <span>
                  {project.testimonial.name}
                  <span className="text-white/60"> · {project.testimonial.role}</span>
                </span>
              </figcaption>
            </figure>

            <div data-reveal="" className="rounded-lg bg-tiny-light-purple p-8 md:p-12">
              <h2 className={LABEL}>Delivered</h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {project.deliverables.map((item) => (
                  <li key={item} className="rounded-full border border-tiny-faint bg-tiny-white px-4 py-2 text-cap-1 font-medium tracking-tight-1">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <ProjectStatement statement={project.statement} body={project.body} />
      </RevealGroup>

      <ProjectBlocks blocks={project.blocks} />

      <NextProject project={next} />
    </>
  );
}
