import Link from "next/link";
import { PROJECT_MORPH, projectHref, projectVtName, type Project } from "@/lib/content/projects";
import { ProjectMedia } from "@/components/projects/ProjectMedia";

// Gallery card. Its cover carries the project's shared view-transition name, so opening it grows the
// image into the case-study hero (the link is tagged PROJECT_MORPH).
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={projectHref(project.slug)}
      transitionTypes={[PROJECT_MORPH]}
      data-project-card=""
      draggable={false}
      className="group relative block w-[82vw] shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tiny-black md:w-[44vw]"
    >
      {/* Hover insets the frame 6px (as on the homepage work cards). The clip sits on this wrapper,
          not the named frame, so the morph snapshot is never clipped. */}
      <div className="relative [clip-path:inset(0_round_8px)] transition-[clip-path] duration-500 ease-out-cubic group-hover:[clip-path:inset(6px_round_8px)]">
        <ProjectMedia
          image={project.cover}
          name={projectVtName(project.slug)}
          className="aspect-[4/5] rounded-lg md:aspect-[3/2]"
          // Overscanned for the horizontal parallax driven by the gallery.
          mediaClassName="inset-y-0 -left-[10%] -right-[10%] will-change-transform"
        />

        <div className="pointer-events-none absolute inset-0 rounded-lg bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 text-tiny-white md:p-8">
          <h3 className="font-display text-[2rem] font-semibold leading-none tracking-tight-5 md:text-[clamp(2rem,3.4vw,4rem)]">
            {project.title}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-white/15 px-3 py-1.5 text-cap-2 font-medium tracking-tight-1 backdrop-blur-md md:text-cap-1"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
}
