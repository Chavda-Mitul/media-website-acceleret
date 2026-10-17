import Image from "next/image";
import { ViewTransition, type ReactNode } from "react";
import { COVER_SIZES, PROJECT_MORPH, type ProjectImage } from "@/lib/content/projects";

type ProjectMediaProps = {
  image: ProjectImage;
  /** Shared view-transition name (projectVtName). Leave unset to keep this frame out of any morph. */
  name?: string;
  /** Above-the-fold hero: fetch first instead of lazily. */
  eager?: boolean;
  /** Frame classes: size, radius, background. */
  className?: string;
  /** Position classes for the image's wrapper (default `inset-0`); scroll effects scale/translate it. */
  mediaClassName?: string;
  /** Extra layers (gradients) painted over the image, inside the frame. */
  children?: ReactNode;
};

// A project cover that can morph across pages. The gallery card, the case-study hero and the
// "Keep scrolling" preview all render one; when a navigation tagged PROJECT_MORPH unmounts one and
// mounts another with the same name, the browser animates between their boxes.
// Untagged navigations (default: "none") leave it alone, so a cover never flies in from off-screen.
export function ProjectMedia({ image, name, eager = false, className = "", mediaClassName = "inset-0", children }: ProjectMediaProps) {
  return (
    <ViewTransition name={name} share={{ [PROJECT_MORPH]: PROJECT_MORPH, default: "none" }} default="none">
      <div className={`relative overflow-hidden bg-tiny-gray ${className}`}>
        <div data-project-media="" className={`absolute ${mediaClassName}`}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            draggable={false}
            sizes={COVER_SIZES}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            className="pointer-events-none object-cover"
          />
        </div>
        {children}
      </div>
    </ViewTransition>
  );
}
