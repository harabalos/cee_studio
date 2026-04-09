"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CtaBanner from "@/components/ui/CtaBanner";
import Tag from "@/components/ui/Tag";
import Divider from "@/components/ui/Divider";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const values = [
  {
    title: "[Autonomy]",
    description:
      "[Privacy and control details.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    title: "[Frictionless]",
    description:
      "[Online scheduling and smart-lock entry.] Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    title: "[Professional Infrastructure]",
    description:
      "[Industrial standards and acoustics.] Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet.",
  },
];

const infrastructure = [
  {
    title: "[Key Feature 1: e.g. Smart Access]",
    detail: "[Brief detail: e.g. 24/7 Keyless Entry]",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop",
  },
  {
    title: "[Key Feature 2: e.g. The Cyc Wall]",
    detail: "[Brief detail: e.g. 5x6m Continuous Cove]",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=600&h=600&fit=crop",
  },
  {
    title: "[Key Feature 3: e.g. Industrial Power]",
    detail: "[Brief detail: e.g. Phase 3 32A Drops]",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop",
  },
  {
    title: "[Key Feature 4: e.g. Logistics]",
    detail: "[Brief detail: e.g. Drive-up Ramp]",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <>
    <div>
      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden grain-overlay">
        <Image
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&h=1080&fit=crop"
          alt="CEE Studio Layout"
          fill
          className="object-cover grayscale"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand/40" />
        <div className="absolute bottom-16 left-6 md:left-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-background/80 text-sm uppercase tracking-widest">
              Established 2026
            </p>
            <h1 className="font-seasons text-5xl md:text-7xl text-background mt-2">
              The Infrastructure
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          <motion.div {...fadeUp}>
            <blockquote className="font-seasons italic text-2xl md:text-3xl text-brand leading-relaxed">
              &ldquo;We don&apos;t hold your hand. We provide the flawless environment, and you bring the talent.&rdquo;
            </blockquote>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <p className="text-foreground/60 leading-relaxed">
              [Origin story of CEE Studio goes here.] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
            <p className="text-foreground/60 leading-relaxed mt-6">
              [Details about the frictionless booking experience.] Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <motion.div {...fadeUp}>
          <Tag>The Model</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">Built for Autonomy</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-16">
          {values.map((value, i) => (
            <motion.div
              key={i}
              className={`py-8 md:py-0 md:px-8 ${
                i < values.length - 1
                  ? "border-b md:border-b-0 md:border-r border-accent"
                  : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
            >
              <h3 className="font-seasons text-2xl text-brand">{value.title}</h3>
              <p className="mt-4 text-foreground/60 leading-relaxed text-sm">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <Divider className="max-w-7xl mx-auto" />

      {/* Infrastructure Core */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <motion.div {...fadeUp}>
          <Tag>Capabilities</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">Core Specifications</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-16">
          {infrastructure.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
            >
              <div className="relative aspect-square overflow-hidden mb-5">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <h3 className="text-sm font-sans tracking-wide uppercase text-foreground">{item.title}</h3>
              <p className="text-xs text-foreground/50 mt-2 leading-relaxed">{item.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
    <CtaBanner />
    </>
  );
}
