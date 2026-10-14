// Single entry point for GSAP. Import gsap and its plugins from here
// (in client components only) so plugins are registered exactly once.
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 1 });
}

export { gsap, Draggable, ScrollTrigger, SplitText, useGSAP };
