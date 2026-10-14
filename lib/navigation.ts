// Placeholder targets until the real pages exist.
export const CONTACT_EMAIL = "hello@example.com";

export const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Approach", href: "#approach" },
  { label: "About", href: "#about" },
  { label: "Careers", href: "#careers" },
  { label: "News", href: "#news" },
  { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
] as const;

export const LATEST_WINS_HREF = "#news";

/** Brand label used in the footer (pairs with the placeholder wordmark in components/ui/Logo.tsx). */
export const BRAND_NAME = "Media";

export const FOOTER_LINKS = [
  { label: "Work", href: "/work" },
  { label: "About", href: "#about" },
  { label: "Approach", href: "#approach" },
  { label: "News", href: "#news" },
  { label: "Careers", href: "#careers" },
] as const;

// Placeholder profiles — point these at your own accounts.
export const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "X", href: "#" },
] as const;

/** Flip once case-study pages exist (the reference site uses /works/<slug>). */
const CASE_STUDIES_LIVE = false;
export const caseStudyHref = (slug: string) => (CASE_STUDIES_LIVE ? `/works/${slug}` : "#");
