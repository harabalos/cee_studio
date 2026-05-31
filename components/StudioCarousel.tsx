"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export type CarouselLang = "en" | "de" | "fr" | "it";

export interface CarouselImage {
  src: string;
  labels: Record<CarouselLang, string>;
}

/**
 * Editorial auto-advancing carousel with counter, caption, arrows, and a
 * thumbnail strip. Extracted from the old /studio page so it can be reused
 * (currently mounted on /equipment).
 */
export default function StudioCarousel({
  images,
  lang,
}: {
  images: CarouselImage[];
  lang: CarouselLang;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const interval = 6000;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, paused, index]);

  const go = (dir: number) => {
    setIndex((prev) => (prev + dir + images.length) % images.length);
  };

  const current = images[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main image */}
      <div className="relative w-full h-[60vh] md:h-[78vh] overflow-hidden bg-foreground/5">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          >
            <Image
              src={current.src}
              alt={current.labels[lang]}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-foreground/15" />
          </motion.div>
        </AnimatePresence>

        {/* Top corner brackets — editorial frame */}
        <div className="pointer-events-none absolute inset-4 md:inset-8 z-10">
          <span className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t border-l border-background/50" />
          <span className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t border-r border-background/50" />
          <span className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 border-b border-l border-background/50" />
          <span className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b border-r border-background/50" />
        </div>

        {/* Counter top-right */}
        <div className="absolute top-6 md:top-12 right-6 md:right-14 z-10 flex items-baseline gap-2 md:gap-3">
          <span className="font-seasons text-background text-4xl md:text-6xl leading-none drop-shadow-lg">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-seasons text-background/60 text-xl md:text-2xl leading-none">/</span>
          <span className="font-seasons text-background/60 text-lg md:text-xl leading-none">
            {String(images.length).padStart(2, "0")}
          </span>
        </div>

        {/* Caption bottom-left */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-8 md:bottom-14 left-6 md:left-14 z-10 max-w-md"
          >
            <p className="font-sans text-background/80 text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2">
              CEE Studio · Zürich
            </p>
            <h3 className="font-seasons text-3xl md:text-5xl text-background drop-shadow-md">
              {current.labels[lang]}
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 border border-background/50 hover:border-background hover:bg-background/10 backdrop-blur-[2px] text-background flex items-center justify-center transition-all duration-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next"
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 border border-background/50 hover:border-background hover:bg-background/10 backdrop-blur-[2px] text-background flex items-center justify-center transition-all duration-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Thumbnail strip — flex row so it fits any number of images evenly */}
      <div className="flex gap-1.5 md:gap-3 mt-2 md:mt-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to ${img.labels[lang]}`}
            className={`group relative flex-1 min-w-0 aspect-[4/3] overflow-hidden transition-all duration-500 ${
              i === index ? "opacity-100" : "opacity-40 hover:opacity-80"
            }`}
          >
            <Image
              src={img.src}
              alt={img.labels[lang]}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 16vw"
            />
            <div className={`absolute inset-0 transition-colors duration-500 ${
              i === index ? "bg-transparent" : "bg-foreground/15 group-hover:bg-transparent"
            }`} />
            {/* Active progress bar */}
            {i === index && !paused && (
              <motion.div
                key={`progress-${index}`}
                className="absolute bottom-0 left-0 h-[2px] bg-brand"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: interval / 1000, ease: "linear" }}
              />
            )}
            {i === index && paused && (
              <div className="absolute bottom-0 left-0 h-[2px] bg-brand w-full" />
            )}
            {/* Index label */}
            <span className="absolute bottom-1 right-1.5 md:bottom-2 md:right-2.5 font-seasons text-background text-[10px] md:text-sm drop-shadow-md">
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
