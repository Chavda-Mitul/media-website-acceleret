// Statement, services and client logos, in the reference site's order.
// Placeholder content (copy, imagery and client logos) from the reference site — replace with your own.
const img = (file: string) => `/assets/images/${file}`;
const logo = (hash: string) => `/assets/logos/${hash}-200x100.svg`;

export const STATEMENT = "TinyWins is a global feelings studio that builds obsession-worthy brands for the modern age.";

export type Service = { name: string; subs: string[]; image: string };

export const SERVICES: Service[] = [
  {
    name: "Strategy",
    subs: ["Platform", "Positioning", "Brand Architecture", "Naming"],
    image: img("0a68dacbf849e5a68899b8c37e91b47fd8acc3b3-3588x4096.jpg"),
  },
  {
    name: "Verbal Identity",
    subs: ["Messaging Framework", "Tone of Voice", "Storytelling", "Copywriting"],
    image: img("d36a69b6f117471597b2af65e332ab1488d9d63d-4096x2995.jpg"),
  },
  {
    name: "Visual Identity",
    subs: ["Logo System", "Typography", "Color Palette", "Iconography", "Motion Design", "Packaging"],
    image: img("5ee5d7651bd8c86ee865aa9d351f980418cd8efc-4096x2776.png"),
  },
  {
    name: "Digital Experience",
    subs: ["Website Design & Development", "Apps & Platforms", "Product Design & Development"],
    image: img("7c224c4e882efb107ebf2e0799fb6a3c8be51f03-4000x2250.png"),
  },
  {
    name: "Go to Market Strategy",
    subs: ["Social Strategy & Execution", "Campaign Strategy & Execution", "Comms Planning", "Experiential Design"],
    image: img("80a81eee5c251419c9a3326067c545f39c825f35-2600x1462.png"),
  },
  {
    name: "Future Evolution",
    subs: ["Web3 Adoption & Tokenization", "AI Integration", "Exploratory Concepting"],
    image: img("7d74dcbcfd6f02d973a8c43076811d6696f67cbc-4096x2731.jpg"),
  },
];

export type ClientLogo = { name: string; src: string };

// Names come from the reference site's alt text for each logo file.
export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "Tony Robbins", src: logo("b13dff707699f654c5d587b91960094a415cde80") },
  { name: "Hallandale", src: logo("ba962d63a05c287e7b06fb9833ebf1c8f1c4ccdc") },
  { name: "PULL Systems", src: logo("5956f3b8245d4d717e3756f0bedb1d15e8756611") },
  { name: "Amazon", src: logo("8d490c103a4b2135dece5b3045ffca9cdba1b4c2") },
  { name: "BMW", src: logo("246774d5fa7659ae777d112a9169cc8a8fbc8ef3") },
  { name: "Warner Music Group", src: logo("1daff762e655fda8dcea3cd2a6e73b326090b9e5") },
  { name: "Albertsons", src: logo("a702349c02aa7a9bff82b4f2b9563579b69c4416") },
  { name: "Ferrari", src: logo("78d3f2634a97704ed7e5683fcbab9563c9a4b9f3") },
  { name: "Equinox", src: logo("1a11b34401f8a69f09a6de015d2f3f3c7449633f") },
  { name: "Victoria's Secret", src: logo("975620c22091706e2be956e0f488eb61725daa69") },
  { name: "Respin", src: logo("6e617847d701a79e551669793d5bd56b302eacd4") },
  { name: "Shield AI", src: logo("9067db53f0e90756b227ed930445e8b8ec041b0d") },
  { name: "Turnkey", src: logo("6825e51b686956fe8ec16fb7076ecb0ca3fb8739") },
  { name: "Supergut", src: logo("d193a5ec53392227a9ef466e2ac35b367ec51b9f") },
  { name: "Roche", src: logo("108305d7492cb1d2f8763553e5ddb7cfd0d67a7a") },
  { name: "immi", src: logo("1b3d4b2ff2c697417be28a60491aa9ddf21fc985") },
  { name: "CBRE", src: logo("0e5cdfaecb4281fe9ea643042b33ed04b1e5b8bd") },
  { name: "Activision", src: logo("52007dd76de4477e18689b55c8707f4924d366fd") },
  { name: "Samsung Ads", src: logo("0bf0dc48a6aece5a52907144f6a76a9199ba4c0f") },
  { name: "Slack", src: logo("0c7653171586979cb8705d57e734eaf3d8285beb") },
  { name: "Joby", src: logo("88220c1742ef4a5d547fee8e0e19dd6ac2a4bdc5") },
  { name: "Audi", src: logo("b65d83bc910a5ef0ae837fab65b43f2fd6f39ebe") },
  { name: "Hoka", src: logo("e010d028315ca1f9da915d94504e28fe21962f76") },
  { name: "Salesforce", src: logo("046694e4d2a0e500ca50c5d7e973ae0ee3c9b183") },
  { name: "Budweiser", src: logo("35f83d34247455e834b6e5f59da2b14d40222d1b") },
  { name: "Visa", src: logo("fcc0f1cb987aabe94943f915d2cd56de0b86b7c4") },
  { name: "Disney", src: logo("259ea690167e1edebc418d7fb5c445dcc7085b5a") },
  { name: "ServiceNow", src: logo("3e79b6e22e5028ed2606895853075aabad4a87c1") },
  { name: "Hyundai", src: logo("d2aa8e7fa461056ed5b4e33ce3bff1f5fcb9af45") },
];
