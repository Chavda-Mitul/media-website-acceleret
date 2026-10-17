import type { ReactNode } from "react";

export type Chapter = { id: string; label: string };

/**
 * One chapter of the homepage story (Intro → The feeling → The work → The process → Let's talk).
 * A plain block with no styles, so the sticky tracks inside behave exactly as before. StoryRail reads it.
 */
export function Act({ chapter, children }: { chapter: Chapter; children: ReactNode }) {
  return (
    <div id={`chapter-${chapter.id}`} data-act={chapter.id}>
      {children}
    </div>
  );
}
