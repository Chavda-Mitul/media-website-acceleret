// Case studies for the /work gallery and the /work/[slug] template.
// Dummy content: fictional projects over placeholder imagery from public/assets — replace with your own.
const img = (file: string) => `/assets/images/${file}`;

export type ProjectImage = { src: string; alt: string };

/** Image blocks on a case study, in page order. */
export type ProjectBlock =
  | { type: "full"; image: ProjectImage }
  | { type: "pair"; images: [ProjectImage, ProjectImage] }
  | { type: "wide"; image: ProjectImage };

export type Project = {
  slug: string;
  title: string;
  client: string;
  /** One line, shown on the hero and the next-project preview. */
  summary: string;
  industry: string;
  year: string;
  duration: string;
  services: string[];
  /** Short chips on the gallery card. */
  tags: string[];
  deliverables: string[];
  website?: string;
  testimonial: { quote: string; name: string; role: string };
  /** Large scroll-lit statement under "The brief". */
  statement: string;
  body: string;
  cover: ProjectImage;
  blocks: ProjectBlock[];
};

export const PROJECTS: Project[] = [
  {
    slug: "fernway",
    title: "Fernway",
    client: "Fernway Travel",
    summary: "A slower way to see the world, told through a calmer travel brand.",
    industry: "Travel",
    year: "2026",
    duration: "10 weeks",
    services: ["Brand identity", "Web design", "Campaign"],
    tags: ["Branding", "Web", "Campaign"],
    deliverables: ["Strategy", "Logo", "Type system", "Art direction", "Website", "OOH", "Social kit"],
    website: "#",
    testimonial: {
      quote: "They found the feeling we couldn't put into words, then built a whole brand around it.",
      name: "Maya Lindqvist",
      role: "Founder",
    },
    statement: "A travel company that sells the journey, not the destination, deserves a brand that slows you down.",
    body: "Fernway plans unhurried trips by rail, sea and road. We rebuilt the identity around long horizons and quiet type, then carried it from the booking flow to the billboards at the stations their trips leave from.",
    cover: { src: img("17534c0015f7d60167f3fea746595329b433d2a2-4400x2475.jpg"), alt: "A traveller watching a city skyline from a plane window" },
    blocks: [
      { type: "full", image: { src: img("e41102101ae8b72fa82e3392395423df19cb13d2-2560x1439.jpg"), alt: "Fernway billboards across a city street" } },
      {
        type: "pair",
        images: [
          { src: img("56f48d09747db1f6e36d80d2a0683984e44774ab-1920x1080.jpg"), alt: "Street-level billboard with commuters" },
          { src: img("acec85430b1aac496e65d1f99cea52e9f19c23dd-2560x1395.jpg"), alt: "Outdoor poster beside a historic house" },
        ],
      },
      { type: "wide", image: { src: img("2850fc1748925139c2d1faab8791fdad86467fbb-3680x2070.jpg"), alt: "Purple dusk over a desert lake" } },
    ],
  },
  {
    slug: "tideline-energy",
    title: "Tideline Energy",
    client: "Tideline",
    summary: "Making renewable power feel as dependable as the grid it replaces.",
    industry: "Energy",
    year: "2026",
    duration: "8 weeks",
    services: ["Web design", "Development", "Motion"],
    tags: ["Web", "Development", "Motion"],
    deliverables: ["UX", "UI", "Design system", "CMS", "Data viz", "Motion"],
    website: "#",
    testimonial: {
      quote: "Our investors finally understand what we do in the first ten seconds on the site.",
      name: "Daniel Okafor",
      role: "CEO",
    },
    statement: "Clean energy is a story about trust, so every page had to feel steady, legible and calm.",
    body: "Tideline builds wind and storage projects for regional grids. We designed a site that turns live output data into simple, honest charts, and a motion language that moves like weather rather than marketing.",
    cover: { src: img("7d74dcbcfd6f02d973a8c43076811d6696f67cbc-4096x2731.jpg"), alt: "Wind turbines on golden hills at dusk" },
    blocks: [
      { type: "full", image: { src: img("614ca6c0a9fc75e9adddc79afcedf4a51dd8c207-2560x1395.jpg"), alt: "Website on a laptop in a dark studio" } },
      {
        type: "pair",
        images: [
          { src: img("e49a3e6469bf4bbbd6a60d3aab5a106f3859b3ba-2966x1744.jpg"), alt: "Laptop showing the product site" },
          { src: img("669a25d2853f0ff91c342a4436f85899119b7f57-1920x1080.jpg"), alt: "Blue gradient platform page" },
        ],
      },
      { type: "wide", image: { src: img("192b12ea1c0aa2337302d2022fc009a1e4551cf5-1920x1080.jpg"), alt: "Dark architectural doorway" } },
    ],
  },
  {
    slug: "juniper-and-salt",
    title: "Juniper & Salt",
    client: "Juniper & Salt",
    summary: "A pantry brand for long lunches and the people who linger over them.",
    industry: "Food & drink",
    year: "2025",
    duration: "12 weeks",
    services: ["Brand identity", "Packaging", "E-commerce"],
    tags: ["Branding", "Packaging", "Shop"],
    deliverables: ["Naming", "Logo", "Packaging", "Photography", "Shopify", "Recipes"],
    website: "#",
    testimonial: {
      quote: "Sales doubled in the first quarter, but the best part is how proud the team is of the shelf.",
      name: "Sofia Marchetti",
      role: "Co-founder",
    },
    statement: "Good food is shared slowly, so the brand had to taste like an afternoon that runs late.",
    body: "Juniper & Salt makes small-batch preserves, oils and crackers. We named the range, designed packaging that looks good half-eaten on a table, and built a shop that sells by the occasion instead of the aisle.",
    cover: { src: img("004f1a52dc874f343f861c1c897577f7fc507a77-2560x1440.jpg"), alt: "A picnic spread with bread, cheese and wine" },
    blocks: [
      { type: "full", image: { src: img("c41e5ded5b9b5f7d6ce819cd5154b9fd8efc7c21-1920x1080.jpg"), alt: "Poster in a planted courtyard" } },
      {
        type: "pair",
        images: [
          { src: img("dadce7c00376ac4292f0acb324a47a351f45cea4-1920x1080.jpg"), alt: "Yellow confetti pattern" },
          { src: img("613c260173fd651a9c589975c0fa9705253e192d-1920x1080.jpg"), alt: "Bold yellow graphic shape" },
        ],
      },
      { type: "wide", image: { src: img("0a05cc60ad914a7840ae605a672a2fa485d54fe6-2560x1395.jpg"), alt: "Portrait in warm orange light" } },
    ],
  },
  {
    slug: "halcyon",
    title: "Halcyon",
    client: "Halcyon Wellness",
    summary: "A wellness app that feels like a deep breath instead of another notification.",
    industry: "Health",
    year: "2025",
    duration: "14 weeks",
    services: ["Product design", "Brand", "Development"],
    tags: ["App", "Brand", "Development"],
    deliverables: ["Research", "iOS app", "Android app", "Design system", "Illustration", "Launch site"],
    website: "#",
    testimonial: {
      quote: "Retention is up 40%, and people keep telling us the app makes them feel lighter.",
      name: "Priya Raman",
      role: "Head of Product",
    },
    statement: "Most health apps shout. We wanted one that waits, listens and makes room for the person using it.",
    body: "Halcyon pairs short guided practices with a gentle daily check-in. We designed the product end to end, from onboarding that asks one question at a time to a palette drawn from open skies.",
    cover: { src: img("5ee5d7651bd8c86ee865aa9d351f980418cd8efc-4096x2776.png"), alt: "A woman reaching towards an open sky" },
    blocks: [
      { type: "full", image: { src: img("5f19ea5664a913d1a4d8690a1d74dffe02aea68a-1920x1080.jpg"), alt: "Circle of portraits around a headline" } },
      {
        type: "pair",
        images: [
          { src: img("2bf3a18802ac628a505e7cfd06334bd77ebc3ba6-3840x2160.jpg"), alt: "The app on a phone resting on a desk" },
          { src: img("88191150fb2715ae6a7147f77ba24a713ef46717-1920x1080.jpg"), alt: "Learning platform landing page" },
        ],
      },
      { type: "wide", image: { src: img("4aa0a6ab84991559a67b60e7ccc1bdb6f77692f7-2944x1656.png"), alt: "Billboard with a portrait and headline" } },
    ],
  },
  {
    slug: "sprout-soda",
    title: "Sprout Soda",
    client: "Sprout Beverages",
    summary: "A loud little soda with less sugar and a lot more personality.",
    industry: "Beverage",
    year: "2025",
    duration: "6 weeks",
    services: ["Campaign", "Social", "Packaging"],
    tags: ["Campaign", "Social", "Packaging"],
    deliverables: ["Concept", "Can design", "Film", "OOH", "Social", "Influencer kit"],
    website: "#",
    testimonial: {
      quote: "The launch sold out in three weeks. We're still catching up on orders.",
      name: "Leo Brandt",
      role: "Marketing Director",
    },
    statement: "Healthier soda usually looks like medicine. Sprout needed to look like the most fun thing in the fridge.",
    body: "Sprout is a prebiotic soda for people who still want the fizz. We built a launch campaign around bright cans, bold type and a cast of real fans, and rolled it out across city walls and social in six weeks.",
    cover: { src: img("7c224c4e882efb107ebf2e0799fb6a3c8be51f03-4000x2250.png"), alt: "A woman leaning on a table beside a green can" },
    blocks: [
      { type: "full", image: { src: img("c41e5ded5b9b5f7d6ce819cd5154b9fd8efc7c21-1920x1080.jpg"), alt: "Poster in a planted courtyard" } },
      {
        type: "pair",
        images: [
          { src: img("613c260173fd651a9c589975c0fa9705253e192d-1920x1080.jpg"), alt: "Bold yellow graphic shape" },
          { src: img("dadce7c00376ac4292f0acb324a47a351f45cea4-1920x1080.jpg"), alt: "Yellow confetti pattern" },
        ],
      },
      { type: "wide", image: { src: img("e41102101ae8b72fa82e3392395423df19cb13d2-2560x1439.jpg"), alt: "Billboards across a city street" } },
    ],
  },
  {
    slug: "atlas-robotics",
    title: "Atlas Robotics",
    client: "Atlas",
    summary: "Humanoid robots, introduced as colleagues rather than science fiction.",
    industry: "Robotics",
    year: "2026",
    duration: "16 weeks",
    services: ["Brand identity", "Web design", "3D"],
    tags: ["Branding", "Web", "3D"],
    deliverables: ["Positioning", "Identity", "3D renders", "Website", "Investor deck", "Trade show"],
    website: "#",
    testimonial: {
      quote: "The new brand made our robots feel approachable. That changed every sales conversation.",
      name: "Hana Sato",
      role: "Chief Commercial Officer",
    },
    statement: "Robots scare people when they look like the future. Atlas needed to look like help arriving today.",
    body: "Atlas builds general-purpose robots for warehouses and hospitals. We gave the company a warm, matter-of-fact identity, rendered the machines in soft studio light, and built a site that leads with the work they do.",
    cover: { src: img("5fd142123b36769cb924200024b2816e648f935c-1920x1080.png"), alt: "A humanoid robot in a grey studio" },
    blocks: [
      { type: "full", image: { src: img("e49a3e6469bf4bbbd6a60d3aab5a106f3859b3ba-2966x1744.jpg"), alt: "Website on a laptop in a dark room" } },
      {
        type: "pair",
        images: [
          { src: img("614ca6c0a9fc75e9adddc79afcedf4a51dd8c207-2560x1395.jpg"), alt: "Laptop on a plinth showing the site" },
          { src: img("192b12ea1c0aa2337302d2022fc009a1e4551cf5-1920x1080.jpg"), alt: "Dark architectural doorway" },
        ],
      },
      { type: "wide", image: { src: img("669a25d2853f0ff91c342a4436f85899119b7f57-1920x1080.jpg"), alt: "Blue gradient platform page" } },
    ],
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}

/** The project after `slug`, wrapping from the last back to the first. */
export function getNextProject(slug: string) {
  const index = PROJECTS.findIndex((project) => project.slug === slug);
  return PROJECTS[(index + 1) % PROJECTS.length];
}

export const projectHref = (slug: string) => `/work/${slug}`;

/** Shared view-transition name: the gallery card, the case-study hero and the next-project preview all use it. */
export const projectVtName = (slug: string) => `project-${slug}`;

/**
 * Navigation type (and view-transition class) that lets a cover morph between pages.
 * Only links tagged with it morph; other navigations swap instantly.
 */
export const PROJECT_MORPH = "project-morph";

/**
 * One `sizes` for every cover (card, hero, preview), so the browser picks the same image URL in all three
 * and the destination hero is already decoded when the morph snapshots it.
 */
export const COVER_SIZES = "100vw";
