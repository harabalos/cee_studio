"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { services } from "@/data/services";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

function ServiceAccordion({ subServices }: { subServices: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-sm uppercase tracking-widest text-brand hover:text-brand-hover transition-colors"
      >
        <span className="text-xl leading-none">{isOpen ? "−" : "+"}</span>
        <span>What&apos;s included</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="mt-4 space-y-2">
              {subServices.map((sub, i) => (
                <li key={i} className="text-sm text-foreground/60 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-brand flex-shrink-0" />
                  {sub}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div {...fadeUp}>
          <h1 className="font-seasons text-6xl md:text-7xl">Services</h1>
          <p className="mt-6 text-foreground/60 max-w-lg leading-relaxed">
            From initial concept to final delivery, we offer a full range of creative
            services tailored to bring your vision to life with precision and artistry.
          </p>
        </motion.div>

        {/* Services List */}
        <div className="mt-24 space-y-32">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              className={`flex flex-col ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-12 md:gap-16 items-center`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Image */}
              <div className="w-full md:w-1/2 relative h-[50vh] overflow-hidden grain-overlay">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="w-full md:w-1/2">
                <Tag>Service 0{service.id}</Tag>
                <h2 className="font-seasons text-3xl md:text-4xl mt-2">
                  {service.title}
                </h2>
                <p className="mt-6 text-foreground/60 leading-relaxed">
                  {service.description}
                </p>
                <ServiceAccordion subServices={service.subServices} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing Teaser */}
        <motion.section
          className="mt-32 bg-accent -mx-6 md:-mx-10 px-6 md:px-10 py-24"
          {...fadeUp}
        >
          <div className="max-w-3xl mx-auto text-center">
            <Tag>Pricing</Tag>
            <h2 className="font-seasons text-4xl md:text-5xl mt-2">
              Tailored to your project
            </h2>
            <p className="mt-6 text-foreground/60 leading-relaxed max-w-md mx-auto">
              Every project is unique, and so is our pricing. Get in touch for a
              custom quote based on your specific needs, timeline, and creative vision.
            </p>
            <div className="mt-10">
              <Button href="/contact" variant="filled">
                Get a Quote
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
