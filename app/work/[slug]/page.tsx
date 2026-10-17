import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS, getNextProject, getProject } from "@/lib/content/projects";
import { ProjectTemplate } from "@/components/projects/ProjectTemplate";

// Every case study is prerendered, so client navigations render it in the same commit and the cover morphs.
// (No loading.tsx here: a Suspense fallback in between would break the morph pair.)
export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      {/* No-JS: captions skip their reveal (see lib/reveal.ts). */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      {/* z-10 + solid background, like every page (the site-wide footer is hidden on case studies). */}
      <main className="relative z-10 bg-tiny-white">
        <ProjectTemplate project={project} next={getNextProject(slug)} />
      </main>
    </>
  );
}
