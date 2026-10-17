// Latest Wins drawer feed, in the reference site's order.
// Placeholder content (headlines, dates, imagery) from the reference site — replace with your own.
const img = (file: string) => `/assets/images/${file}`;

export type NewsItem = {
  category: string;
  title: string;
  href: string;
  image: string;
};

export const NEWS: NewsItem[] = [
  {
    category: "Partnerships",
    title: "Launching a digital identity for Joby’s all electric air taxi",
    href: "#",
    image: img("19b11a1b29a1b533838e17b692bb650ef9a8cdd6-1800x1201.jpg"),
  },
  {
    category: "Partnerships",
    title: "Positioning Visa for new eyes on social",
    href: "#",
    image: img("b3cb45b5f3930472bb6817afb802ff8e9a1c1972-1800x1200.jpg"),
  },
  {
    category: "Launches",
    title: "Halle Berry rebrands menopause with Respin",
    href: "#",
    image: img("c9fc3989f69a11ddfb388ebe5f898f6e0f1b6657-1200x826.jpg"),
  },
  {
    category: "Client Wins",
    title: "Joby announces closing of $250M investment from Toyota",
    href: "#",
    image: img("0fabd26970509181cc03a1f31c461a5ae46273b0-1200x800.jpg"),
  },
  {
    category: "Partnerships",
    title: "Imagining the future of work with Salesforce",
    href: "#",
    image: img("48b62da9fe638011d33a8e200e6c5422e8ee8564-1200x800.jpg"),
  },
];
