import type { Metadata } from "next";
import { ParticleHero } from "@/components/sections/ParticleHero";

export const metadata: Metadata = {
  title: "Particle Hero",
  description: "Interactive particle logo hero.",
};

// Preview of the drop-in hero. To use it on the homepage, render <ParticleHero /> inside <main> there.
export default function ParticleHeroPage() {
  return (
    <main className="relative z-10 bg-tiny-white">
      <ParticleHero />
    </main>
  );
}
