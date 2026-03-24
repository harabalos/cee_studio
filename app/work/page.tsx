"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";

const categories = ["All", "Photography", "Video", "Campaign", "Editorial", "Product"];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

export default function WorkPage() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.h1
          className="font-seasons text-6xl md:text-7xl"
          {...fadeUp}
        >
          Work
        </motion.h1>

        {/* Filter Bar */}
        <motion.div
          className="flex flex-wrap gap-6 mt-12 mb-16"
          {...fadeUp}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-sm uppercase tracking-widest font-sans pb-1 transition-all duration-300 ${
                active === cat
                  ? "text-brand border-b border-brand"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((project, i) => {
            const isLarge = i % 3 === 0;
            return (
              <motion.div
                key={project.id}
                className="relative overflow-hidden group break-inside-avoid"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: (i % 3) * 0.1 }}
              >
                <Link href={`/work/${project.slug}`}>
                  <div className={`relative ${isLarge ? "h-[500px]" : "h-[350px]"}`}>
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/50 transition-colors duration-500" />
                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-background font-sans text-sm uppercase tracking-widest">
                        {project.title}
                      </p>
                      <p className="text-background/80 font-sans text-xs mt-1">
                        {project.client} — {project.year}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
