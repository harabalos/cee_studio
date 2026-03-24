"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import { projects } from "@/data/projects";
import { services } from "@/data/services";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const clientLogos = [
  "Maison Vaud",
  "Schweizer Stil",
  "Lumière Parfums",
  "Faces Magazine",
  "Zuri Athletics",
  "Haus Interior",
  "Zurich Fashion Days",
  "Boden Magazine",
];

const featuredProjects = projects.slice(0, 6);
const serviceTiles = services.slice(0, 4);

export default function Home() {
  return (
    <>
      {/* Section 1 — Hero */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 grain-overlay">
          <Image
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&h=1080&fit=crop"
            alt="CEE Studio Hero"
            fill
            className="object-cover animate-kenburns"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <h1 className="font-seasons text-6xl md:text-8xl tracking-wide">CEE</h1>
            <p className="font-seasons text-2xl md:text-4xl mt-1">Studio</p>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[1px] h-10 bg-white animate-pulse-line" />
        </div>
      </section>

      {/* Section 2 — Intro */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            className="font-seasons text-5xl md:text-7xl text-foreground"
            {...fadeUp}
          >
            Visual stories, crafted in Zurich.
          </motion.h2>
          <motion.p
            className="mt-8 text-foreground/60 max-w-md mx-auto leading-relaxed"
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            We are a photography and creative studio dedicated to producing imagery
            that resonates. From concept to final frame, every detail is intentional.
          </motion.p>
          <Divider className="mt-16 max-w-xs mx-auto" />
        </div>
      </section>

      {/* Section 3 — Services Tiles */}
      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {serviceTiles.map((service, i) => (
            <motion.div
              key={service.id}
              className="relative h-96 overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="text-center">
                  <p className="font-sans text-sm uppercase tracking-widest text-foreground">
                    {service.title}
                  </p>
                  <span className="text-foreground text-2xl mt-2 inline-block">&rarr;</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 4 — Featured Work */}
      <section className="px-6 md:px-10 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              className="font-seasons text-4xl md:text-5xl"
              {...fadeUp}
            >
              Selected Work
            </motion.h2>
            <motion.div {...fadeUp}>
              <Link
                href="/work"
                className="text-sm uppercase tracking-widest text-brand hover:text-brand-hover transition-colors"
              >
                View All &rarr;
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
            {featuredProjects.map((project, i) => {
              const spanClasses = [
                "md:col-span-2 md:row-span-2",
                "md:col-span-2",
                "md:col-span-1",
                "md:col-span-1",
                "md:col-span-2",
                "md:col-span-2",
              ];
              return (
                <motion.div
                  key={project.id}
                  className={`relative overflow-hidden group ${spanClasses[i] || ""}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
                >
                  <Link href={`/work/${project.slug}`}>
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white font-sans text-sm uppercase tracking-widest">
                        {project.title}
                      </p>
                      <p className="text-white/70 font-sans text-xs mt-1">
                        {project.client}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5 — Studio Split */}
      <section className="flex flex-col md:flex-row">
        <motion.div
          className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh] grain-overlay"
          {...fadeUp}
        >
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop"
            alt="CEE Studio Space"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
        <div className="w-full md:w-1/2 flex items-center">
          <motion.div className="px-8 md:px-16 py-16 md:py-0" {...fadeUp}>
            <Tag>The Space</Tag>
            <h2 className="font-seasons text-4xl md:text-5xl mt-2">
              A studio built for creativity
            </h2>
            <p className="mt-6 text-foreground/60 leading-relaxed max-w-md">
              200m² of versatile studio space in the heart of Zurich. Equipped with
              professional lighting, backdrops, and a client lounge — everything you
              need for a seamless shoot.
            </p>
            <div className="mt-8">
              <Button href="/studio" variant="outlined">
                Explore the Studio
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 6 — Client Logos Marquee */}
      <section className="py-24 overflow-hidden">
        <motion.p
          className="text-center text-xs uppercase tracking-widest text-foreground/40 mb-12"
          {...fadeUp}
        >
          Trusted by
        </motion.p>
        <div className="relative overflow-hidden">
          <div className="marquee-track">
            {[...clientLogos, ...clientLogos].map((name, i) => (
              <span
                key={i}
                className="flex-shrink-0 mx-12 text-2xl md:text-3xl font-seasons text-foreground/20 whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — About Teaser */}
      <section className="bg-accent">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32 flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <motion.div
            className="relative w-full md:w-1/2 h-[60vh] grain-overlay"
            {...fadeUp}
          >
            <Image
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop"
              alt="Studio Founder"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
          <motion.div className="w-full md:w-1/2" {...fadeUp}>
            <Tag>About</Tag>
            <h2 className="font-seasons text-4xl md:text-5xl mt-2">
              The eye behind the lens
            </h2>
            <p className="mt-6 text-foreground/60 leading-relaxed max-w-md">
              Founded in 2019, CEE Studio has grown from a one-person vision into
              a collaborative creative house. We believe in the power of imagery
              to shape perception, tell stories, and build brands that endure.
            </p>
            <Link
              href="/about"
              className="inline-block mt-8 text-sm uppercase tracking-widest text-brand hover:text-brand-hover transition-colors"
            >
              Read our story &rarr;
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 8 — CTA Banner */}
      <section className="bg-brand py-32 text-center">
        <motion.div
          className="max-w-3xl mx-auto px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="font-seasons text-5xl md:text-6xl text-white">
            Let&apos;s create something.
          </h2>
          <p className="mt-6 text-white/70 max-w-md mx-auto leading-relaxed">
            Have a project in mind? We&apos;d love to hear about it. Get in touch
            and let&apos;s bring your vision to life.
          </p>
          <div className="mt-10">
            <Button href="/contact" variant="outlined-white">
              Start a Project
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
