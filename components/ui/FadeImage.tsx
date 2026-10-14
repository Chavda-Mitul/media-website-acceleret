"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type FadeImageProps = Omit<ImageProps, "src"> & { src: string };

/**
 * next/image that fades in (700ms) once its pixels have loaded, so slow tiles never pop.
 * Animated GIFs skip the optimizer (it would flatten them to one frame).
 * No-JS visitors see it immediately via the [data-fade] rule in app/layout.tsx.
 */
export function FadeImage({ src, alt, className = "", onLoad, unoptimized, ...props }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={unoptimized ?? src.endsWith(".gif")}
      data-fade=""
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={`${className} transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}
