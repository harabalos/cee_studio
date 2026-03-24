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
    title: "Intentional",
    description:
      "Every frame, every light, every angle is a deliberate choice. We don't shoot volume — we craft images with purpose and precision.",
  },
  {
    title: "Collaborative",
    description:
      "The best work happens when creative minds align. We work closely with our clients, building trust and shared vision from the first conversation.",
  },
  {
    title: "Enduring",
    description:
      "Trends fade. We create imagery that transcends the moment — work that feels as relevant in five years as it does today.",
  },
];

const team = [
  {
    name: "Celine Egger",
    role: "Founder & Lead Photographer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop",
  },
  {
    name: "Marco Huber",
    role: "Cinematographer",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop",
  },
  {
    name: "Lena Meier",
    role: "Creative Director",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop",
  },
  {
    name: "Noah Fischer",
    role: "Post-Production Lead",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <>
    <div>
      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden grain-overlay">
        <Image
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1920&h=1080&fit=crop"
          alt="Celine Egger — Founder"
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
              Founded 2019
            </p>
            <h1 className="font-seasons text-5xl md:text-7xl text-background mt-2">
              Our Story
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          <motion.div {...fadeUp}>
            <blockquote className="font-seasons italic text-2xl md:text-3xl text-brand leading-relaxed">
              &ldquo;Photography is not about capturing what is — it&apos;s about
              revealing what could be.&rdquo;
            </blockquote>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <p className="text-foreground/60 leading-relaxed">
              CEE Studio was born from a simple conviction: that brands deserve
              imagery as thoughtful as the products they create. What started as
              Celine Egger&apos;s solo practice in a Zurich loft has grown into a
              four-person creative studio serving fashion houses, beauty brands, and
              editorial publications across Switzerland and beyond.
            </p>
            <p className="text-foreground/60 leading-relaxed mt-6">
              We approach every project as a collaboration. Our process begins with
              understanding — your brand, your audience, your ambition. From there,
              we build a visual language that&apos;s unmistakably yours. No templates,
              no shortcuts, no compromise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <motion.div {...fadeUp}>
          <Tag>Values</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">What drives us</h2>
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

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <motion.div {...fadeUp}>
          <Tag>Team</Tag>
          <h2 className="font-seasons text-4xl md:text-5xl mt-2">The people</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <h3 className="mt-4 text-sm font-sans">{member.name}</h3>
              <p className="text-xs text-foreground/50 mt-1">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
    <CtaBanner />
    </>
  );
}
