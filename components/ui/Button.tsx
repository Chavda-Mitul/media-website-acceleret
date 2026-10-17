import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

// The site's one button: a pill. Its tone follows the surface it sits on.
export type ButtonTone = "ink" | "paper" | "glass";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-sans text-cap-1 font-medium tracking-tight-1 transition-colors duration-300 ease-out-cubic focus-visible:outline-2 focus-visible:outline-offset-2";

const TONES: Record<ButtonTone, string> = {
  // On paper.
  ink: "bg-tiny-black text-tiny-white hover:bg-tiny-brand focus-visible:outline-tiny-black",
  // On ink or the brand blue.
  paper: "bg-tiny-white text-tiny-black hover:bg-tiny-black hover:text-tiny-white focus-visible:outline-tiny-white",
  // Over photos and video.
  glass:
    "border border-white/20 bg-black/25 text-white backdrop-blur-[15px] hover:bg-black active:bg-black focus-visible:outline-white",
};

const SIZES: Record<ButtonSize, string> = {
  md: "h-11 px-5",
  sm: "h-9 px-4",
};

export function buttonClass({ tone = "ink", size = "md" }: { tone?: ButtonTone; size?: ButtonSize } = {}) {
  return `${BASE} ${TONES[tone]} ${SIZES[size]}`;
}

/** The ▶ from the logo, for media actions (play, start). Takes the text colour. */
export function PlayGlyph() {
  return (
    <svg viewBox="0 0 8 10" aria-hidden="true" focusable="false" className="h-2.5 w-2 shrink-0">
      <path d="M0 0L8 5L0 10V0Z" fill="currentColor" />
    </svg>
  );
}

type Shared = { tone?: ButtonTone; size?: ButtonSize; icon?: ReactNode; children: ReactNode };

export function Button({
  tone,
  size,
  icon,
  children,
  className = "",
  type = "button",
  ...rest
}: Shared & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button type={type} className={`${buttonClass({ tone, size })} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  tone,
  size,
  icon,
  children,
  className = "",
  ...rest
}: Shared & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">) {
  return (
    <a className={`${buttonClass({ tone, size })} ${className}`} {...rest}>
      {icon}
      {children}
    </a>
  );
}
