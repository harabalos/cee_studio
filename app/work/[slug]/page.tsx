"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import { useParams } from "next/navigation";
import Tag from "@/components/ui/Tag";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = projects.find((p) => p.slug === slug);
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  if (!project) {
    return (
      <div className="pt-32 pb-24 text-center">
        <h1 className="font-seasons text-4xl">Project not found</h1>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden grain-overlay">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-16 left-6 md:left-10 z-10">
          <motion.h1
            className="font-seasons text-5xl md:text-7xl text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {project.title}
          </motion.h1>
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div {...fadeUp}>
            <Tag>{project.category}</Tag>
            <h2 className="font-seasons text-3xl md:text-4xl mt-2">
              {project.title}
            </h2>
            <p className="mt-6 text-foreground/60 leading-relaxed">
              {project.description}
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col gap-4"
            {...fadeUp}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <div className="flex justify-between border-b border-accent pb-4">
              <span className="text-xs uppercase tracking-widest text-foreground/40">
                Client
              </span>
              <span className="text-sm">{project.client}</span>
            </div>
            <div className="flex justify-between border-b border-accent pb-4">
              <span className="text-xs uppercase tracking-widest text-foreground/40">
                Year
              </span>
              <span className="text-sm">{project.year}</span>
            </div>
            <div className="flex justify-between border-b border-accent pb-4">
              <span className="text-xs uppercase tracking-widest text-foreground/40">
                Category
              </span>
              <span className="text-sm">{project.category}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.images.map((img, i) => (
            <motion.div
              key={i}
              className={`relative overflow-hidden grain-overlay ${
                i === 0 ? "md:col-span-2 h-[50vh] md:h-[70vh]" : "h-[40vh] md:h-[50vh]"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
            >
              <Image
                src={img}
                alt={`${project.title} ${i + 1}`}
                fill
                className="object-cover"
                sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Next Project */}
      {nextProject && (
        <section className="border-t border-accent">
          <Link href={`/work/${nextProject.slug}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 flex items-center justify-between group">
              <div>
                <span className="text-xs uppercase tracking-widest text-foreground/40">
                  Next Project
                </span>
                <h3 className="font-seasons text-3xl md:text-4xl mt-2 group-hover:text-brand transition-colors duration-300">
                  {nextProject.title} &rarr;
                </h3>
              </div>
              <div className="hidden md:block relative w-32 h-32 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Image
                  src={nextProject.coverImage}
                  alt={nextProject.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
