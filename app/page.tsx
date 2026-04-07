"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import CtaBanner from "@/components/ui/CtaBanner";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};


const homeZones = [
  {
    id: "01",
    title: "Cyc Wall",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=800&fit=crop",
  },
  {
    id: "02",
    title: "Lifestyle Set",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=800&fit=crop",
  },
  {
    id: "03",
    title: "Makeup Area",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=800&fit=crop",
  },
  {
    id: "04",
    title: "Equipment",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop",
  },
];

export default function Home() {
  return (
    <>
      {/* Section 1 — Hero */}
      <section className="relative h-[95vh] w-full overflow-hidden">
        <div className="absolute inset-0 grain-overlay">
          <Image
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1920&h=1080&fit=crop"
            alt="CEE Studio Hero"
            fill
            className="object-cover animate-kenburns"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-background px-4">
            <h1 className="font-seasons text-6xl md:text-8xl tracking-wide">CEE</h1>
            <p className="font-seasons text-2xl md:text-4xl mt-1 tracking-widest">Studio Workspace</p>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[1px] h-10 bg-background animate-pulse-line" />
        </div>
      </section>

      {/* Section 2 — Intro */}
      <section className="py-32 bg-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            className="font-seasons text-5xl md:text-6xl lg:text-7xl text-foreground font-medium"
            {...fadeUp}
          >
            The premium studio space for Zurich&apos;s creative professionals.
          </motion.h2>
          <motion.p
            className="mt-8 text-foreground/70 max-w-lg mx-auto leading-relaxed text-lg"
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            A fully equipped B2B photo and video rental studio. From natural light lifestyle sets 
            to an expansive cyclorama wall, we provide the ultimate creative infrastructure 
            so you can focus on the art.
          </motion.p>
          <Divider className="mt-16 max-w-xs mx-auto" />
        </div>
      </section>

      {/* Section 3 — Zones Teaser */}
      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              className="font-seasons text-4xl md:text-5xl"
              {...fadeUp}
            >
              The Space
            </motion.h2>
            <motion.div {...fadeUp}>
              <Link
                href="/space"
                className="text-sm uppercase tracking-widest text-brand hover:text-brand-hover transition-colors font-semibold"
              >
                Explore Zones &rarr;
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {homeZones.map((zone, i) => (
              <motion.div
                key={zone.id}
                className="relative h-96 overflow-hidden group border border-accent/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
              >
                <Image
                  src={zone.image}
                  alt={zone.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-brand/10 group-hover:bg-brand/60 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="text-center">
                    <p className="font-sans text-sm uppercase tracking-widest text-background font-bold">
                      {zone.title}
                    </p>
                    <span className="text-accent text-2xl mt-2 inline-block">&rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Studio Split */}
      <section className="flex flex-col md:flex-row bg-accent/20">
        <motion.div
          className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh] grain-overlay"
          {...fadeUp}
        >
          <Image
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=800&fit=crop"
            alt="CEE Studio Cyc Wall"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
        <div className="w-full md:w-1/2 flex items-center">
          <motion.div className="px-8 md:px-16 py-16 md:py-0" {...fadeUp}>
            <Tag>A Plug-and-Play Ecosystem</Tag>
            <h2 className="font-seasons text-4xl md:text-5xl md:leading-[1.1] mt-4">
              Step in. Setup. <br /> Start shooting in minutes.
            </h2>
            <p className="mt-8 text-foreground/70 leading-relaxed max-w-md text-lg">
              Our boutique facility features keyless smart-lock access, massive natural light windows, and an incredibly robust in-house equipment inventory featuring Profoto and Aputure.
            </p>
            <div className="mt-10">
              <Button href="/equipment" variant="outlined">
                See Full Equipment List
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 7 — Memberships Teaser */}
      <section className="bg-brand text-background">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32 flex flex-col md:flex-row-reverse gap-12 md:gap-16 items-center">
          <motion.div
            className="relative w-full md:w-1/2 h-[60vh] grain-overlay"
            {...fadeUp}
          >
            <Image
              src="https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=1000&fit=crop"
              alt="Studio Lounge"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          <motion.div className="w-full md:w-1/2" {...fadeUp}>
            <Tag>Subscription Tiers</Tag>
            <h2 className="font-seasons text-4xl md:text-5xl mt-4">
              Become a resident creator.
            </h2>
            <p className="mt-6 text-background/80 leading-relaxed max-w-md text-lg">
              For busy freelancers, content creators, and agencies, our Studio ABO Memberships offer unmatched value. Secure guaranteed monthly studio hours at a fraction of the hourly rate.
            </p>
            <Link
              href="/studio"
              className="inline-block mt-8 text-sm uppercase tracking-widest text-accent hover:text-white transition-colors font-semibold"
            >
              View Membership Plans &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 8 — Global CTA Banner */}
      <CtaBanner />
    </>
  );
}
