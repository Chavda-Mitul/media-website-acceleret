// Category showcases + About/Approach, in the reference site's order.
// Placeholder content (clients, copy, imagery) from the reference site — replace with your own.
const img = (file: string) => `/assets/images/${file}`;

export type ShowcaseItem = {
  name: string;
  image: string;
  /** Image aspect ratio (width / height); desktop card width = card height × aspect. */
  aspect: number;
  href: string;
};

export type Showcase = { heading: string; body: string; items: ShowcaseItem[] };

const LANDSCAPE = 1600 / 1186;
const PORTRAIT = 920 / 1190;

export const SHOWCASES: Record<"vital" | "futureProof", Showcase> = {
  vital: {
    heading: "Feeling vital",
    body: "Beauty. Wellness. Healthy living. We turn differentiation into desire and brands into category leaders.",
    items: [
      { name: "Cottonball", image: img("7236fa690b9fab339eaea851a302a9ab8e6c5b05-1599x1185.jpg"), aspect: 1599 / 1185, href: "#work" },
      { name: "Mienne", image: img("3c8442bfc113e2b632c300d639e513685d6e7616-920x1190.jpg"), aspect: PORTRAIT, href: "#work" },
      { name: "ReSpin", image: img("9c209d052076c89300d96bbeb22db86e3fb085e3-920x1190.jpg"), aspect: PORTRAIT, href: "#work" },
      { name: "Hallandale", image: img("7a9d69302e11b50f889858c1750a09e4fb26606f-1428x1184.jpg"), aspect: 1428 / 1184, href: "#work" },
      { name: "Hydrinity", image: img("eefb59f82c337117bb29f578f982054cf79f45f8-920x1190.jpg"), aspect: PORTRAIT, href: "#work" },
      { name: "Senté", image: img("033c167a00eac0e6a735d272364b54af7568bc0d-920x1190.jpg"), aspect: PORTRAIT, href: "#work" },
    ],
  },
  futureProof: {
    heading: "Feeling future-proof",
    body: "Industrial. Intelligence. Defense. We turn market-edge technology into clarity, credibility, and narrative power.",
    items: [
      { name: "Shield AI", image: img("7a11de995a0e03a1eccf347058295dd8c613315a-1600x1186.jpg"), aspect: LANDSCAPE, href: "#work" },
      { name: "Noble Machines", image: img("ecbb709c5e84fdd27bf1b7e3d2f3ebd8765cd912-1305x1740.jpg"), aspect: 1305 / 1740, href: "#work" },
      { name: "Field AI", image: img("12980e5c80784113be9fab475ae26facc99c0a6e-920x1190.jpg"), aspect: PORTRAIT, href: "#work" },
      { name: "Halo Industries", image: img("ccc8d44132915636d067defe94628d8be7cf5f66-1600x1186.jpg"), aspect: LANDSCAPE, href: "#work" },
      { name: "Amesa", image: img("83e7fdadac4fbd3f50fef914b60cc0b58671df58-920x1190.jpg"), aspect: PORTRAIT, href: "#work" },
    ],
  },
};

export type InfoPanel = { label: string; body: string; href: string; image: string };

export const INFO_PANELS: [InfoPanel, InfoPanel] = [
  {
    label: "About us",
    body: "We started small and kept accelerating, one launch at a time. Today, we’re a mighty team across strategy, creative, design, and development.",
    href: "#about",
    image: img("ebe427d938375a1951c48dad67bd14c85e394adc-1280x854.jpg"),
  },
  {
    label: "Approach",
    body: "From machines powered by code to beauty powered by culture, the starting point never changes: define the feeling first.",
    href: "#approach",
    image: img("45f9b2d289e370f2a4dd90fb99b576bd12d5ca0d-2937x3659.jpg"),
  },
];
