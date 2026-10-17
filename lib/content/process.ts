// "Our Process" section (ProcessSection), modelled on neutomni.com.
// Placeholder copy from the reference site — replace with your own (e.g. "Webflow Build").

/** Inline text runs. `italic` marks emphasis in the copy; the site renders it as plain text (one type system). */
export type RichText = { text: string; italic?: boolean }[];

export type ProcessStep = {
  /** First title line (sans). */
  title: string;
  /** Second title line (a softer tone under the first). */
  titleItalic: string;
  body: RichText;
};

export type ProcessIntro = {
  label: string;
  from: string;
  to: string;
  tagline: RichText;
};

export const PROCESS_INTRO: ProcessIntro = {
  label: "Our process",
  from: "A",
  to: "B",
  tagline: [
    { text: "The road can get " },
    { text: "bumpy", italic: true },
    { text: ". We keep you " },
    { text: "rolling", italic: true },
    { text: " regardless." },
  ],
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: "Discovery",
    titleItalic: "& Strategy",
    body: [{ text: "We map the angles before we smooth them out. Where you are, where you're going, what's standing in between." }],
  },
  {
    title: "Design",
    titleItalic: "Iterations",
    body: [{ text: "Brand, visual systems, web design — crafted into something credible and built to last. No templates." }],
  },
  {
    title: "Webflow",
    titleItalic: "Build",
    body: [{ text: "We build with the precision of designers and the speed of devs who've done it a hundred times." }],
  },
  {
    title: "Post-launch",
    titleItalic: "Support",
    body: [
      { text: "We don't shape you to fit our process. It's the " },
      { text: "process that bends", italic: true },
      { text: " to make you comfortable to collaborate." },
    ],
  },
];
