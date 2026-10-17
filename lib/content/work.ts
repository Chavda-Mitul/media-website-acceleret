// Selected Work + brand banner, in the reference site's order.
// Placeholder content (clients, copy, imagery) from the reference site — replace with your own.
import { media } from "@/lib/media";

const img = (file: string) => `/assets/images/${file}`;

export type WorkMedia = { type: "image"; src: string } | { type: "video"; src: string; poster: string };

export type WorkItem = {
  client: string;
  title: string;
  href: string;
  media: WorkMedia;
  /** Frame aspect ratio (width / height) measured on the reference at 1440px. */
  aspect: string;
};

export const WORK: Record<"cottonball" | "amesa" | "shieldAi" | "freegame" | "mienne", WorkItem> = {
  cottonball: {
    client: "Cottonball",
    title: "Cultivating a couture skincare experience",
    href: "#work",
    media: { type: "image", src: img("d8f48169548d2d2262eb13b67b53c514120c9dd4-1599x1185.jpg") },
    aspect: "730 / 541",
  },
  amesa: {
    client: "Amesa",
    title: "Pioneering engineered intelligence",
    href: "#work",
    media: { type: "video", src: media.reelVideo, poster: media.reelPoster },
    aspect: "16 / 9",
  },
  shieldAi: {
    client: "Shield AI",
    title: "Building the future of defense",
    href: "#work",
    media: { type: "image", src: img("49af5eebc557e7e0b661cbc8cfcbcb1ab374fbca-2075x1275.jpg") },
    aspect: "961 / 591",
  },
  freegame: {
    client: "FreeGame",
    title: "Redefining representation for a new era of athletes",
    href: "#work",
    media: { type: "image", src: img("6408e74e8829f15efc0ce9743b4b1aa04c936ed7-2031x1196.jpg") },
    aspect: "518 / 305",
  },
  mienne: {
    client: "Mienne",
    title: "Awakening the senses",
    href: "#work",
    media: { type: "image", src: img("d9edfc122cd3339223cd6d8cdd6d88e8687cc014-966x780.jpg") },
    aspect: "730 / 590",
  },
};

export const ALL_WORK = { label: "All work", count: 55, href: "/work" };

export const BRAND_BANNER = {
  heading: ["Independent by nature.", "Accelerated by design."],
  body: "Acceleret Media is an independent creative studio crafting thoughtful identities, campaigns, and experiences for ambitious brands.",
  link: { label: "Explore Acceleret Media", href: "#about" },
};
